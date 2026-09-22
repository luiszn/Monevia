from app.analisis import analizar, responder_pregunta


def _movimiento(tipo, monto, categoria):
    return {"tipo": tipo, "monto": monto, "categoria": categoria, "fecha": "2026-09-21"}


def test_analizar_totales_y_balance():
    movs = [_movimiento("Ingreso", 1500, "Sueldo"), _movimiento("Gasto", 120.5, "Alimentación")]
    resultado = analizar(movs, [], [])

    assert resultado["ingresos"] == 1500.0
    assert resultado["gastos"] == 120.5
    assert resultado["balance"] == 1379.5
    assert resultado["mayorGastoCategoria"] == "Alimentación"
    assert resultado["mayorGastoMonto"] == 120.5


def test_analizar_comparacion_con_periodo_anterior():
    movs = [_movimiento("Gasto", 200, "Compras")]
    anterior = [_movimiento("Gasto", 100, "Compras")]
    resultado = analizar(movs, anterior, [])

    assert resultado["comparacionPorcentaje"] == 100.0
    assert "aumentaron 100%" in resultado["comparacionMensaje"]


def test_analizar_sin_periodo_anterior():
    resultado = analizar([_movimiento("Gasto", 50, "Salud")], [], [])

    assert resultado["comparacionPorcentaje"] is None
    assert "No hay datos del período anterior" in resultado["comparacionMensaje"]


def test_analizar_sin_gastos():
    resultado = analizar([], [], [])

    assert resultado["mayorGastoCategoria"] is None
    assert resultado["insights"] == ["No registraste gastos en este período. ¡Buen trabajo!"]


def test_analizar_alerta_presupuesto_superado():
    movs = [_movimiento("Gasto", 450, "Alimentación")]
    presupuestos = [{"categoria": "Alimentación", "monto": 400}]
    resultado = analizar(movs, [], presupuestos)

    assert any("Superaste tu presupuesto de Alimentación" in i for i in resultado["insights"])


def test_analizar_alerta_presupuesto_cerca():
    movs = [_movimiento("Gasto", 360, "Alimentación")]
    presupuestos = [{"categoria": "Alimentación", "monto": 400}]
    resultado = analizar(movs, [], presupuestos)

    assert any("cerca de superar tu presupuesto de Alimentación" in i for i in resultado["insights"])


def test_pregunta_mayor_gasto():
    movs = [_movimiento("Gasto", 120.5, "Alimentación"), _movimiento("Gasto", 45, "Transporte")]
    respuesta = responder_pregunta("¿En qué gasté más esta semana?", movs, [])

    assert "Alimentación" in respuesta
    assert "120.50" in respuesta


def test_pregunta_cuantia_gastada_en_categoria():
    movs = [_movimiento("Gasto", 88.0, "Compras")]
    respuesta = responder_pregunta("¿Cuánto gasté en ropa?", movs, [])

    assert "Gastaste S/ 88.00 en Compras" in respuesta


def test_pregunta_categoria_sin_gastos():
    respuesta = responder_pregunta("¿Cuánto gasté en Transporte?", [], [])

    assert respuesta == "No registraste gastos en Transporte."


def test_pregunta_estado_presupuestos():
    resp = responder_pregunta(
        "¿Cómo voy con mis presupuestos?",
        [_movimiento("Gasto", 120.5, "Alimentación")],
        [{"categoria": "Alimentación", "monto": 400}],
    )
    assert "Alimentación: gastado S/ 120.50 de S/ 400.00" in resp


def test_pregunta_balance():
    movs = [_movimiento("Ingreso", 1500, "Sueldo"), _movimiento("Gasto", 200, "Compras")]
    resp = responder_pregunta("¿Cuál es mi balance?", movs, [])

    assert "1300.00" in resp