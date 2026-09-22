namespace Monevia.API.DTOs;

public record DashboardResponse(
    decimal Ingresos,
    decimal Gastos,
    decimal Balance,
    int NumMovimientos,
    ComparacionDto ComparacionIngresos,
    ComparacionDto ComparacionGastos,
    List<GastoPorCategoriaDto> GastosPorCategoria,
    List<EvolucionDiariaDto> EvolucionDiaria,
    List<MovimientoResponse> MovimientosRecientes
);

public record ComparacionDto(decimal Actual, decimal Anterior, decimal VariacionPorcentaje);

public record GastoPorCategoriaDto(string Categoria, decimal Monto, decimal Porcentaje);

public record EvolucionDiariaDto(DateTime Fecha, decimal Ingresos, decimal Gastos);