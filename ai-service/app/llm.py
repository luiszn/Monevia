"""Integración opcional con un modelo de IA externo (API compatible con OpenAI).

Si la variable de entorno OPENAI_API_KEY está configurada, se usará el modelo
para mejorar las respuestas. Si no, el servicio funciona con reglas locales.
"""

from __future__ import annotations

import os

import httpx

MODELO = os.environ.get("OPENAI_MODELO", "gpt-4o-mini")
BASE_URL = os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1")


async def generar_con_llm(prompt: str) -> str | None:
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return None

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                f"{BASE_URL}/chat/completions",
                headers={"Authorization": f"Bearer {api_key}"},
                json={
                    "model": MODELO,
                    "messages": [
                        {
                            "role": "system",
                            "content": (
                                "Eres un asistente financiero experto. Responde en español, "
                                "de forma breve y usando solo los datos proporcionados."
                            ),
                        },
                        {"role": "user", "content": prompt},
                    ],
                },
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"].strip()
    except Exception:
        return None