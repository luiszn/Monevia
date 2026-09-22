namespace Monevia.API.DTOs;

public record AnalisisIaResponse(
    string ResumenTexto,
    decimal Ingresos,
    decimal Gastos,
    decimal Balance,
    string MayorGastoCategoria,
    decimal MayorGastoMonto,
    string? ComparacionMensaje,
    List<string> Insights
);

public record PreguntaIaResponse(string Respuesta);

public record AnalisisIaRequest(string? Pregunta);

// Payloads enviados al servicio de IA (Python)
public record MovimientoIaDto(DateTime Fecha, decimal Monto, string Tipo, string Categoria, string? Descripcion);

public record PresupuestoIaDto(string Categoria, string Periodo, decimal Monto);

public record AnalisisIaEnvio(
    List<MovimientoIaDto> Movimientos,
    List<MovimientoIaDto> MovimientosAnterior,
    List<PresupuestoIaDto> Presupuestos,
    string Periodo
);

public record PreguntaIaEnvio(
    string Pregunta,
    List<MovimientoIaDto> Movimientos,
    List<MovimientoIaDto> MovimientosAnterior,
    List<PresupuestoIaDto> Presupuestos
);

public record AnalisisIaResultado(
    decimal Ingresos,
    decimal Gastos,
    decimal Balance,
    string? MayorGastoCategoria,
    decimal? MayorGastoMonto,
    double? ComparacionPorcentaje,
    string? ComparacionMensaje,
    List<string> Insights
);

public record PreguntaIaResultado(string Respuesta);