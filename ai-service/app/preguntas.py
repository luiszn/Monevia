"""Respondedor de preguntas en lenguaje natural sobre las finanzas del usuario."""

from __future__ import annotations

import unicodedata

AliasCategorias = {
    "alimentacion": "Alimentación",
    "comida": "Alimentación",
    "mercado": "Alimentación",
    "supermercado": "Alimentación",
    "restaurante": "Alimentación",
    "transporte": "Transporte",
    "pasajes": "Transporte",
    "combustible": "Transporte",
    "gasolina": "Transporte",
    "estudios": "Estudios",
    "universidad": "Estudios",
    "cursos": "Estudios",
    "entretenimiento": "Entretenimiento",
    "cine": "Entretenimiento",
    "ocio": "Entretenimiento",
    "salud": "Salud",
    "medicina": "Salud",
    "farmacia": "Salud",
    "doctor": "Salud",
    "compras": "Compras",
    "ropa": "Compras",
    "servicios": "Servicios",
    "luz": "Servicios",
    "agua": "Servicios",
    "internet": "Servicios",
    "sueldo": "Sueldo",
    "salario": "Sueldo",
    "freelance": "Freelance",
    "venta": "Venta",
}


def normalizar(texto: str) -> str:
    texto = unicodedata.normalize("NFD", texto)
    texto = "".join(c for c in texto if unicodedata.category(c) != "Mn")
    return texto.lower().strip()


def _totales(movimientos: list) -> tuple[float, float]:
    ingresos = sum(m["monto"] for m in movimientos if m["tipo"] == "Ingreso")
    gastos = sum(m["monto"] for m in movimientos if m["tipo"] == "Gasto")
    return float(ingresos), float(gastos)


def _gastos_por_categoria(movimientos: list) -> dict[str, float]:
    gastos: dict[str, float] = {}
    for m in movimientos:
        if m["tipo"] == "Gasto":
            gastos[m["categoria"]] = gastos.get(m["categoria"], 0.0) + m["monto"]
    return dict(sorted(gastos.items(), key=lambda x: x[1], reverse=True))


def _categoria_en_pregunta(pregunta: str, categorias_unicas: set[str]) -> str | None:
    n = normalizar(pregunta)
    for alias, categoria in AliasCategorias.items():
        if alias in n:
            return categoria
    for categoria in categorias_unicas:
        if normalizar(categoria) in n:
            return categoria
    return None


def responder(pregunta: str, movimientos: list, presupuestos: list) -> str:
    n = normalizar(pregunta)
    ingresos, gastos = _totales(movimientos)
    gastos_por_cat = _gastos_por_categoria(movimientos)
    categorias = set(gastos_por_cat.keys())
    ingresos_por_cat = _ingresos_por_categoria(movimientos)

    # Presupuestos
    if "presupuesto" in n or "respetando" in n or "límite" in n:
        return _estado_presupuestos(presupuestos, gastos_por_cat)

    # Categoría de mayor gasto
    if ("gaste mas" in n or "mayor gasto" in n or "gasto mas" in n
            or "mas gasto" in n or "en que gaste" in n):
        if not gastos_por_cat:
            return "Aún no registras gastos."
        cat, monto = next(iter(gastos_por_cat.items()))
        total = gastos
        porcentaje = (monto / total * 100) if total else 0
        return (
            f"Tu categoría de mayor gasto es {cat} con S/ {monto:.2f}, "
            f"lo que representa el {porcentaje:.0f}% de tus gastos."
        )

    # "cuánto gasté en X" o "gasté en X"
    categoria = _categoria_en_pregunta(pregunta, categorias | set(ingresos_por_cat.keys()))
    if categoria and ("gast" in n or "cuánto" in n):
        if categoria in gastos_por_cat:
            return f"Gastaste S/ {gastos_por_cat[categoria]:.2f} en {categoria}."
        return f"No registraste gastos en {categoria}."

    # Comparación con período anterior (la pregunta se responde con el total registrado)
    if "compar" in n or "pasada" in n or "mes anterior" in n or "vs" in n:
        return (
            f"Registraste ingresos por S/ {ingresos:.2f} y gastos por S/ {gastos:.2f}. "
            "Para una comparación exacta revisa el dashboard del período anterior."
        )

    # Total gastado / ingresado
    if "cuánto gasté" in n or "cuánto he gastado" in n or "cómo voy" in n:
        return f"Tus gastos totales registrados son S/ {gastos:.2f}."
    if "cuánto ingres" in n or "cuánto he ingresado" in n or "cuánto gan" in n:
        return f"Tus ingresos totales registrados son S/ {ingresos:.2f}."
    if "balance" in n or "saldo" in n or "disponible" in n:
        return f"Tu balance es de S/ {ingresos - gastos:.2f} (ingresos S/ {ingresos:.2f} - gastos S/ {gastos:.2f})."

    # Resumen general por defecto
    if not gastos_por_cat:
        return "Tus ingresos totales son S/ {:.2f} y aún no registras gastos.".format(ingresos)
    top = list(gastos_por_cat.items())
    top_txt = ", ".join(f"{c} (S/ {m:.2f})" for c, m in top[:3])
    return (
        f"Registraste ingresos por S/ {ingresos:.2f} y gastos por S/ {gastos:.2f}. "
        f"Tus principales gastos están en: {top_txt}."
    )


def _ingresos_por_categoria(movimientos: list) -> dict[str, float]:
    ingresos: dict[str, float] = {}
    for m in movimientos:
        if m["tipo"] == "Ingreso":
            ingresos[m["categoria"]] = ingresos.get(m["categoria"], 0.0) + m["monto"]
    return ingresos


def _estado_presupuestos(presupuestos: list, gastos_por_cat: dict[str, float]) -> str:
    if not presupuestos:
        return "No tienes presupuestos configurados. Puedes crearlos desde la sección Presupuestos."
    partes: list[str] = []
    for p in presupuestos:
        categoria = p["categoria"]
        limite = float(p["monto"])
        gastado = gastos_por_cat.get(categoria, 0.0)
        partes.append(
            f"{categoria}: gastado S/ {gastado:.2f} de S/ {limite:.2f}"
            f" ({'superado' if gastado > limite else f'{(gastado / limite * 100):.0f}% usado'})"
        )
    return "Presupuestos: " + "; ".join(partes) + "."