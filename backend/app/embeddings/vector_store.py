"""
Module 8 — Vector Database (ChromaDB)

Stores chunk embeddings + metadata in ChromaDB, supporting native metadata-filtered
semantic search (state / category / jurisdiction / language) plus keyword search.
"""
from __future__ import annotations
from pathlib import Path
from typing import List, Dict, Any, Optional
import chromadb

from app.embeddings.chunker import Chunk, chunk_scheme
from app.embeddings.embed import embed_texts, DIM
from app.ingestion.normalize import load_all_normalized
from app.ingestion.source_registry import ROOT_DIR
from app.utils.logger import logger

CHROMA_DIR = ROOT_DIR / "chroma_db"
COLLECTION_NAME = "government_schemes"


class VectorStore:

    def __init__(self, persist_directory: Optional[Path] = None):
        self.persist_dir = persist_directory or CHROMA_DIR
        self.persist_dir.mkdir(parents=True, exist_ok=True)

        self.client = chromadb.PersistentClient(path=str(self.persist_dir))
        self.collection = self.client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )
        self.metadata_cache: List[dict] = []
        self._sync_cache()

    def _sync_cache(self):
        """Build in-memory metadata cache for fast fallback & keyword search."""
        try:
            results = self.collection.get(include=["metadatas", "documents"])
            cache = []
            if results and results.get("ids"):
                for idx, chunk_id in enumerate(results["ids"]):
                    meta = results["metadatas"][idx] if results.get("metadatas") else {}
                    doc = results["documents"][idx] if results.get("documents") else ""
                    item = {**meta, "chunk_id": chunk_id, "text": doc}
                    cache.append(item)
            self.metadata_cache = cache
        except Exception as e:
            logger.warning(f"ChromaDB cache sync warning: {e}")
            self.metadata_cache = []

    def build_from_scratch(self, only_published_or_validated: bool = True) -> int:
        try:
            self.client.delete_collection(COLLECTION_NAME)
        except Exception:
            pass

        self.collection = self.client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )

        records = load_all_normalized()
        if only_published_or_validated:
            records = [r for r in records if r.status.value in ("validated", "published")]

        all_chunks: List[Chunk] = []
        for r in records:
            all_chunks.extend(chunk_scheme(r))

        if not all_chunks:
            self.metadata_cache = []
            return 0

        ids = [c.chunk_id for c in all_chunks]
        documents = [c.text for c in all_chunks]
        metadatas = []
        for c in all_chunks:
            meta = c.to_dict()
            clean_meta = {}
            for k, v in meta.items():
                clean_meta[k] = "" if v is None else v
            metadatas.append(clean_meta)

        embeddings = embed_texts(documents)

        self.collection.add(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas,
        )

        self._sync_cache()
        logger.info(f"ChromaDB indexed {len(all_chunks)} scheme chunk embeddings into '{COLLECTION_NAME}' collection.")
        return len(all_chunks)

    def save(self):
        """Sync cache; PersistentClient automatically persists data."""
        self._sync_cache()

    def load(self):
        """Verify collection exists and refresh in-memory cache."""
        self.collection = self.client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )
        self._sync_cache()
        if not self.metadata_cache:
            raise FileNotFoundError("ChromaDB collection is empty.")

    def search(
        self,
        query: str,
        top_k: int = 5,
        state: Optional[str] = None,
        category: Optional[str] = None,
        language: Optional[str] = None,
        jurisdiction: Optional[str] = None,
    ) -> List[dict]:
        [qvec] = embed_texts([query])

        where_conditions = []
        if state:
            where_conditions.append({"$or": [{"state": state}, {"state": ""}, {"jurisdiction": "central"}]})
        if category:
            where_conditions.append({"category": category})
        if language:
            where_conditions.append({"language": language})
        if jurisdiction:
            where_conditions.append({"jurisdiction": jurisdiction})

        where_clause = None
        if len(where_conditions) == 1:
            where_clause = where_conditions[0]
        elif len(where_conditions) > 1:
            where_clause = {"$and": where_conditions}

        try:
            res = self.collection.query(
                query_embeddings=[qvec],
                n_results=top_k * 3,
                where=where_clause,
                include=["metadatas", "documents", "distances"],
            )
        except Exception as e:
            logger.warning(f"ChromaDB query filter exception: {e}, falling back to un-filtered query")
            res = self.collection.query(
                query_embeddings=[qvec],
                n_results=top_k * 3,
                include=["metadatas", "documents", "distances"],
            )

        results = []
        if res and res.get("ids") and res["ids"][0]:
            ids = res["ids"][0]
            metadatas = res["metadatas"][0] if res.get("metadatas") else []
            documents = res["documents"][0] if res.get("documents") else []
            distances = res["distances"][0] if res.get("distances") else []

            for idx, chunk_id in enumerate(ids):
                meta = metadatas[idx] if idx < len(metadatas) else {}
                doc = documents[idx] if idx < len(documents) else ""
                dist = distances[idx] if idx < len(distances) else 1.0

                score = max(0.0, 1.0 - (dist / 2.0))

                if state and meta.get("state") and meta["state"].lower() != state.lower() and meta.get("jurisdiction") == "state":
                    continue

                item = {
                    **meta,
                    "chunk_id": chunk_id,
                    "text": doc,
                    "score": float(score),
                }
                results.append(item)

                if len(results) >= top_k:
                    break

        return results

    def keyword_search(self, query: str, top_k: int = 5) -> List[dict]:
        q_terms = [t.lower() for t in query.split() if len(t) > 2]
        scored = []
        for meta in self.metadata_cache:
            scheme_name = meta.get("scheme_name", "")
            doc_text = meta.get("text", "")
            haystack = f"{scheme_name} {doc_text}".lower()
            hits = sum(haystack.count(t) for t in q_terms)
            if hits > 0:
                scored.append((hits, meta))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [{**meta, "score": float(hits)} for hits, meta in scored[:top_k]]


if __name__ == "__main__":
    vs = VectorStore()
    n = vs.build_from_scratch()
    vs.save()
    print(f"Indexed {n} chunks into ChromaDB store at {CHROMA_DIR}")

    print("\n-- semantic search: 'money for pregnant women' --")
    for r in vs.search("financial help for pregnant women", top_k=3):
        print(f"  [{r['score']:.3f}] {r.get('scheme_name')} / {r.get('section')}")
