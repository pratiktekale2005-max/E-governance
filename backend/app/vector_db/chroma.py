"""
ChromaDB Vector Store Component

Persistent ChromaDB collection management with metadata indexing and caching.
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


class ChromaVectorStore:

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
        try:
            results = self.collection.get(include=["metadatas", "documents"])
            cache = []
            if results and results.get("ids"):
                for idx, chunk_id in enumerate(results["ids"]):
                    meta = results["metadatas"][idx] if results.get("metadatas") else {}
                    doc = results["documents"][idx] if results.get("documents") else ""
                    cache.append({**meta, "chunk_id": chunk_id, "text": doc})
            self.metadata_cache = cache
        except Exception as exc:
            logger.warning(f"ChromaDB cache sync warning: {exc}")
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
            metadatas.append({k: ("" if v is None else v) for k, v in meta.items()})

        embeddings = embed_texts(documents)

        self.collection.add(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas,
        )

        self._sync_cache()
        logger.info(f"ChromaDB indexed {len(all_chunks)} chunks into collection '{COLLECTION_NAME}'.")
        return len(all_chunks)

    def fetch_candidates(
        self,
        query: str,
        candidate_k: int = 50,
        state: Optional[str] = None,
        category: Optional[str] = None,
    ) -> List[dict]:
        """
        Retrieves Top N candidate chunks from ChromaDB for downstream hybrid reranking.
        """
        [qvec] = embed_texts([query])

        where_conditions = []
        if state:
            where_conditions.append({"$or": [{"state": state}, {"state": ""}, {"jurisdiction": "central"}]})
        if category:
            where_conditions.append({"category": category})

        where_clause = None
        if len(where_conditions) == 1:
            where_clause = where_conditions[0]
        elif len(where_conditions) > 1:
            where_clause = {"$and": where_conditions}

        try:
            res = self.collection.query(
                query_embeddings=[qvec],
                n_results=min(candidate_k, self.collection.count() or 1),
                where=where_clause,
                include=["metadatas", "documents", "distances"],
            )
        except Exception:
            res = self.collection.query(
                query_embeddings=[qvec],
                n_results=min(candidate_k, self.collection.count() or 1),
                include=["metadatas", "documents", "distances"],
            )

        candidates = []
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

                candidates.append({
                    **meta,
                    "chunk_id": chunk_id,
                    "text": doc,
                    "vector_score": float(score),
                })

        return candidates
