using System.ComponentModel.DataAnnotations;

namespace FinanzasIA.API.DTOs;

public record MovimientoRequest(
    [param: Required] string Tipo,
    [param: Range(0.01, double.MaxValue)] decimal Monto,
    [param: Required] DateTime Fecha,
    [param: Required] int CategoriaId,
    [param: Required] int MetodoPagoId,
    [param: MaxLength(250)] string? Descripcion
);

public record MovimientoResponse(
    int Id,
    string Tipo,
    decimal Monto,
    DateTime Fecha,
    int CategoriaId,
    string CategoriaNombre,
    int MetodoPagoId,
    string MetodoPagoNombre,
    string? Descripcion
);

public record MovimientoQuery(
    string? Periodo,
    DateTime? Desde,
    DateTime? Hasta,
    int? CategoriaId,
    string? Tipo,
    string? Busqueda,
    string? OrdenarPor,
    string? Direccion
);