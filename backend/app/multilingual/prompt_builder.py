"""
prompt_builder.py
Builds system prompt & turn messages in citizen's target language.
"""

from __future__ import annotations

from app.speech.whisper_service import SUPPORTED_LANGUAGES

_LANGUAGE_INSTRUCTIONS = {
    "en": "Respond only in English.",
    "hi": "उत्तर केवल हिंदी में दें। सरल और स्पष्ट भाषा का प्रयोग करें।",
    "mr": "उत्तर फक्त मराठीत द्या. सोपी आणि स्पष्ट भाषा वापरा.",
    "ta": "பதிலை தமிழில் மட்டும் அளிக்கவும். எளிய, தெளிவான மொழியைப் பயன்படுத்தவும்.",
    "te": "సమాధానం తెలుగులో మాత్రమే ఇవ్వండి. సరళమైన, స్పష్టమైన భాషను వాడండి.",
    "bn": "শুধুমাত্র বাংলায় উত্তর দিন। সহজ ও স্পষ্ট ভাষা ব্যবহার করুন।",
}

_BASE_RULES = """You are a helpful assistant that explains Indian government welfare
schemes to citizens who may have limited literacy or unfamiliarity with
bureaucratic language.

Rules you must always follow:
1. {language_instruction}
2. Use simple, everyday words — avoid legal or bureaucratic jargon.
3. Keep responses short: 2-4 sentences unless the user asks for more detail.
4. Preserve official government scheme names EXACTLY as given in the source
   material (e.g. "PM-KISAN", "Ayushman Bharat") — never translate or
   transliterate scheme names incorrectly.
5. If you are not certain a scheme applies to the citizen, say so plainly
   instead of guessing.
6. If retrieved context is provided below, base your answer on it rather
   than on general knowledge.
"""


def build_system_prompt(language: str, retrieved_context: str | None = None) -> str:
    if language not in SUPPORTED_LANGUAGES:
        raise ValueError(f"Unsupported language '{language}'")

    instruction = _LANGUAGE_INSTRUCTIONS[language]
    prompt = _BASE_RULES.format(language_instruction=instruction)

    if retrieved_context:
        prompt += f"\n\nRelevant scheme information:\n{retrieved_context.strip()}\n"

    return prompt


def build_messages(
    language: str,
    user_text: str,
    conversation_history: list[dict] | None = None,
    retrieved_context: str | None = None,
) -> list[dict]:
    system_prompt = build_system_prompt(language, retrieved_context)
    messages = [{"role": "system", "content": system_prompt}]

    for turn in (conversation_history or [])[-6:]:
        messages.append({"role": "user", "content": turn["user"]})
        messages.append({"role": "assistant", "content": turn["assistant"]})

    messages.append({"role": "user", "content": user_text})
    return messages
