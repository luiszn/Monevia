using FinanzasIA.API.DTOs;
using FinanzasIA.API.Entities;

namespace FinanzasIA.API.Services;

public static class Mapeos
{
    public static MovimientoResponse MovimientoResponse(Movimiento m) => new(
        m.Id,
        m.Tipo.ToString(),
        m.Monto,
        m.Fecha,
        m.CategoriaId,
        m.Categoria.Nombre,
        m.MetodoPagoId,
        m.MetodoPago.Nombre,
        m.Descripcion
    );

    public static MovimientoIaDto MovimientoIa(Movimiento m) => new(
        m.Fecha,
        m.Monto,
        m.Tipo.ToString(),
        m.Categoria.Nombre,
        m.Descripcion
    );

    public static PresupuestoIaDto PresupuestoIa(Presupuesto p) => new(
        p.Categoria.Nombre,
        p.Periodo.ToString(),
        p.Monto
    );

    public static CategoriaResponse CategoriaResponse(Categoria c) => new(
        c.Id,
        c.Nombre,
        c.Tipo.ToString(),
        c.Icono,
        c.Color,
        c.UsuarioId is null
    );
}