"""
Prompt Builder Component

Assembles system prompt, citizen profile prompt, safety guidelines, output formatting,
and retrieved context into a single structured prompt for LLM execution.
"""
from __future__ import annotations
from pathlib import Path
from typing import Dict, Any, List, Optional
from app.ingestion.source_registry import ROOT_DIR

PROMPTS_DIR = ROOT_DIR / "app" / "prompts"


def _read_prompt_file(filename: str) -> str:
    file_path = PROMPTS_DIR / filename
    if file_path.exists():
        return file_path.read_text(encoding="utf-8").strip()
    return ""


class PromptBuilder:

    def __init__(self):
        self.system_prompt = _read_prompt_file("system_prompt.txt")
        self.citizen_prompt_tmpl = _read_prompt_file("citizen_prompt.txt")
        self.safety_prompt = _read_prompt_file("safety_prompt.txt")
        self.output_prompt = _read_prompt_file("output_prompt.txt")

    def build_prompt(
        self,
        query: str,
        rewritten_query: str,
        entities: Dict[str, Any],
        intent_data: Dict[str, Any],
        language_data: Dict[str, Any],
        context_text: str,
        history: Optional[List[dict]] = None,
    ) -> str:
        """
        Builds the complete multi-part prompt string.
        """
        # Format citizen profile section
        citizen_profile_str = self.citizen_prompt_tmpl.format(
            state=entities.get("state", "Central"),
            district=entities.get("district", "N/A"),
            language=language_data.get("name", "English"),
            occupation=entities.get("occupation", "General Citizen"),
            income=entities.get("income", "N/A"),
            age=entities.get("age", "N/A"),
            gender=entities.get("gender", "N/A"),
            category=entities.get("category", "N/A"),
            intent=intent_data.get("intent", "Scheme Search"),
            query=query,
            rewritten_query=rewritten_query,
        )

        # Format history section if present
        history_str = ""
        if history:
            history_lines = ["Conversation Memory:"]
            for msg in history[-4:]:  # Include last 4 turns
                sender = msg.get("sender", "User")
                text = msg.get("text", "")
                history_lines.append(f"{sender}: {text}")
            history_str = "\n".join(history_lines) + "\n\n"

        prompt_parts = [
            f"=== SYSTEM INSTRUCTIONS ===\n{self.system_prompt}",
            f"\n=== CITIZEN PROFILE & INTENT ===\n{citizen_profile_str}",
        ]

        if history_str:
            prompt_parts.append(f"=== CONVERSATION HISTORY ===\n{history_str}")

        prompt_parts.extend([
            f"=== VERIFIED SCHEME EVIDENCE ===\n{context_text}",
            f"\n=== SAFETY & GUARDRAILS ===\n{self.safety_prompt}",
            f"\n=== OUTPUT FORMAT ===\n{self.output_prompt}",
            f"\nPlease answer the citizen's query: '{query}' in {language_data.get('name', 'English')}.",
        ])

        return "\n\n".join(prompt_parts)
