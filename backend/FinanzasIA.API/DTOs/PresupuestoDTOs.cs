using System.ComponentModel.DataAnnotations;

namespace FinanzasIA.API.DTOs;

public record PresupuestoRequest(
    [param: Required] int CategoriaId,
    [param: Required] string Periodo,
    [param: Range(0.01, double.MaxValue)] decimal Monto
);

public record PresupuestoResponse(
    int Id,
    int CategoriaId,
    string CategoriaNombre,
    string Periodo,
    decimal Monto,
    decimal Gastado,
    decimal Disponible,
    decimal Porcentaje,
    string Estado
);