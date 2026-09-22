"""Análisis financiero basado en reglas sobre los datos reales del usuario."""

from __future__ import annotations

from datetime import datetime
from typing import Any


def _totales(movimientos: list[dict]) -> tuple[float, float]:
    ingresos = sum(m["monto"] for m in movimientos if m["tipo"] == "Ingreso")
    gastos = sum(m["monto"] for m in movimientos if m["tipo"] == "Gasto")
    return float(ingresos), float(gastos)


def _gastos_por_categoria(movimientos: list[dict]) -> dict[str, float]:
    gastos: dict[str, float] = {}
    for m in movimientos:
        if m["tipo"] == "Gasto":
            gastos[m["categoria"]] = gastos.get(m["categoria"], 0.0) + m["monto"]
    return dict(sorted(gastos.items(), key=lambda x: x[1], reverse=True))


def _gastos_por_categoria_anterior(movimientos_anterior: list[dict]) -> dict[str, float]:
    return _gastos_por_categoria(movimientos_anterior)


def analizar(
    movimientos: list[dict],
    movimientos_anterior: list[dict],
    presupuestos: list[dict],
) -> dict[str, Any]:
    ingresos, gastos = _totales(movimientos)
    balance = round(ingresos - gastos, 2)
    gastos_por_cat = _gastos_por_categoria(movimientos)
    gastos_por_cat_ant = _gastos_por_categoria_anterior(movimientos_anterior)

    ing_ant, gastos_ant = _totales(movimientos_anterior)
    comparacion_porcentaje = None
    comparacion_mensaje = None
    if gastos_ant > 0:
        comparacion_porcentaje = round((gastos - gastos_ant) / gastos_ant * 100, 1)
        if comparacion_porcentaje > 0:
            comparacion_mensaje = (
                f"Los gastos aumentaron {comparacion_porcentaje:g}% respecto al período anterior."
            )
        elif comparacion_porcentaje < 0:
            comparacion_mensaje = (
                f"Los gastos disminuyeron {abs(comparacion_porcentaje):g}% respecto al período anterior."
            )
        else:
            comparacion_mensaje = "Los gastos se mantuvieron iguales respecto al período anterior."
    else:
        comparacion_mensaje = "No hay datos del período anterior para comparar."

    mayor_categoria = max(gastos_por_cat, key=gastos_por_cat.get) if gastos_por_cat else None
    mayor_monto = gastos_por_cat.get(mayor_categoria) if mayor_categoria else None

    insights = _generar_insights(
        gastos, ingresos, gastos_por_cat, gastos_por_cat_ant, presupuestos
    )

    return {
        "ingresos": round(ingresos, 2),
        "gastos": round(gastos, 2),
        "balance": balance,
        "mayorGastoCategoria": mayor_categoria,
        "mayorGastoMonto": round(mayor_monto, 2) if mayor_monto is not None else None,
        "comparacionPorcentaje": comparacion_porcentaje,
        "comparacionMensaje": comparacion_mensaje,
        "insights": insights,
    }


def _generar_insights(
    gastos: float,
    ingresos: float,
    gastos_por_cat: dict[str, float],
    gastos_por_cat_ant: dict[str, float],
    presupuestos: list[dict],
) -> list[str]:
    textos: list[str] = []

    if not gastos_por_cat and gastos == 0:
        return ["No registraste gastos en este período. ¡Buen trabajo!"]

    # Categorías principales
    for categoria, monto in list(gastos_por_cat.items())[:3]:
        porcentaje = (monto / gastos * 100) if gastos else 0
        textos.append(
            f"{categoria} representa el {porcentaje:.0f}% de tus gastos "
            f"de este período (S/ {monto:.2f})."
        )

    # Cambios respecto al período anterior
    for categoria, monto in gastos_por_cat.items():
        anterior = gastos_por_cat_ant.get(categoria, 0.0)
        if anterior > 0:
            cambio = round((monto - anterior) / anterior * 100, 1)
            if cambio >= 20:
                textos.append(
                    f"Tu gasto en {categoria} aumentó un {cambio:g}% respecto al período anterior "
                    f"(de S/ {anterior:.2f} a S/ {monto:.2f})."
                )
            elif cambio <= -20:
                textos.append(
                    f"Tu gasto en {categoria} disminuyó un {abs(cambio):g}% respecto al período anterior "
                    f"(de S/ {anterior:.2f} a S/ {monto:.2f})."
                )

    # Alertas de presupuesto
    for presupuesto in presupuestos:
        categoria = presupuesto["categoria"]
        monto_limite = float(presupuesto["monto"])
        gastado = gastos_por_cat.get(categoria, 0.0)
        if gastado > 0 and monto_limite > 0:
            uso = gastado / monto_limite * 100
            if uso >= 100:
                textos.append(
                    f"Superaste tu presupuesto de {categoria} (S/ {monto_limite:.2f}). "
                    f"Llevas gastado S/ {gastado:.2f}."
                )
            elif uso >= 85:
                textos.append(
                    f"Estás cerca de superar tu presupuesto de {categoria}. "
                    f"Usaste el {uso:.0f}% (S/ {gastado:.2f} de S/ {monto_limite:.2f})."
                )

    # Patrones: gasto promedio diario
    if gastos > 0:
        textos.append(f"Tu gasto promedio diario en este período fue de S/ {gastos / 7:.2f}.")

    # Balance
    if ingresos > 0 and gastos > ingresos:
        textos.append("Estás gastando más de lo que ingresas. Revisa tus gastos.")

    return textos


def responder_pregunta(
    pregunta: str,
    movimientos: list[dict],
    presupuestos: list[dict],
) -> str:
    from .preguntas import responder

    return responder(pregunta, movimientos, presupuestos)