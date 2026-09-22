"""Servicio de IA de Monevia.

Endpoint principal:
- POST /api/analizar : análisis del período con insights
- POST /api/pregunta  : responde preguntas con los datos reales
- GET  /api/health    : healthcheck
"""

from __future__ import annotations

from typing import Any, Optional

from fastapi import FastAPI
from pydantic import BaseModel, Field

from . import analisis, llm

app = FastAPI(
    title="Monevia AI Service",
    description="Servicio de análisis financiero con IA para Monevia.",
    version="0.2.0",
)


class Movimiento(BaseModel):
    fecha: str
    monto: float
    tipo: str
    categoria: str
    descripcion: Optional[str] = None


class Presupuesto(BaseModel):
    categoria: str
    periodo: str
    monto: float


class AnalizarRequest(BaseModel):
    movimientos: list[Movimiento] = Field(default_factory=list)
    movimientos_anterior: list[Movimiento] = Field(default_factory=list)
    presupuestos: list[Presupuesto] = Field(default_factory=list)
    periodo: str = "Semana"


class PreguntaRequest(BaseModel):
    pregunta: str
    movimientos: list[Movimiento] = Field(default_factory=list)
    movimientos_anterior: list[Movimiento] = Field(default_factory=list)
    presupuestos: list[Presupuesto] = Field(default_factory=list)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok", "mensaje": "IA disponible"}


@app.post("/api/analizar")
async def analizar(peticion: AnalizarRequest) -> dict[str, Any]:
    resultado = analisis.analizar(
        _movs(peticion.movimientos),
        _movs(peticion.movimientos_anterior),
        _pres(peticion.presupuestos),
    )

    llm_prompt = _prompt_analisis(peticion, resultado)
    texto_llm = await llm.generar_con_llm(llm_prompt)
    if texto_llm:
        resultado["analisisLlm"] = texto_llm

    return resultado


@app.post("/api/pregunta")
async def pregunta(peticion: PreguntaRequest) -> dict:
    movimientos = _movs(peticion.movimientos)
    presupuestos = _pres(peticion.presupuestos)

    respuesta = analisis.responder_pregunta(peticion.pregunta, movimientos, presupuestos)

    llm_prompt = (
        f"Pregunta del usuario: {peticion.pregunta}\n"
        f"Datos (lista de movimientos): {movimientos}\n"
        f"Presupuestos: {presupuestos}\n"
        "Responde con datos reales y de forma concisa."
    )
    texto_llm = await llm.generar_con_llm(llm_prompt)
    if texto_llm:
        respuesta = texto_llm

    return {"respuesta": respuesta}


def _movs(items: list[Movimiento]) -> list[dict]:
    return [m.model_dump() for m in items]


def _pres(items: list[Presupuesto]) -> list[dict]:
    return [p.model_dump() for p in items]


def _prompt_analisis(peticion: AnalizarRequest, resultado: dict) -> str:
    return (
        "Genera un análisis financiero breve y útil en español (máx. 5 oraciones) "
        "basado solo en estos datos calculados:\n"
        f"{resultado}\n"
        f"Movimientos: {_movs(peticion.movimientos)}"
    )