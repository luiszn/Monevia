using Monevia.API.Data;
using Monevia.API.DTOs;
using Monevia.API.Entities;
using Monevia.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Monevia.API.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _db;

    public DashboardController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> Get(string? periodo, DateTime? desde, DateTime? hasta, CancellationToken ct)
    {
        var userId = User.GetUserId();
        var (rangoDesde, rangoHasta) = RangoFechas.Obtener(periodo ?? "", desde, hasta);
        var (antDesde, antHasta) = RangoFechas.Anterior(rangoDesde, rangoHasta);

        var actuales = await ObtenerMovimientos(userId, rangoDesde, rangoHasta, ct);
        var anteriores = await ObtenerMovimientos(userId, antDesde, antHasta, ct);

        var ingresos = Suma(actuales, TipoMovimiento.Ingreso);
        var gastos = Suma(actuales, TipoMovimiento.Gasto);
        var ingresosAnt = Suma(anteriores, TipoMovimiento.Ingreso);
        var gastosAnt = Suma(anteriores, TipoMovimiento.Gasto);

        var gastosPorCategoria = actuales
            .Where(m => m.Tipo == TipoMovimiento.Gasto)
            .GroupBy(m => m.Categoria.Nombre)
            .Select(g => new GastoPorCategoriaDto(
                g.Key,
                g.Sum(m => m.Monto),
                gastos > 0 ? Math.Round(g.Sum(m => m.Monto) / gastos * 100, 1) : 0))
            .OrderByDescending(g => g.Monto)
            .ToList();

        var evolucion = actuales
            .GroupBy(m => m.Fecha.Date)
            .Select(g => new EvolucionDiariaDto(
                g.Key,
                g.Where(m => m.Tipo == TipoMovimiento.Ingreso).Sum(m => m.Monto),
                g.Where(m => m.Tipo == TipoMovimiento.Gasto).Sum(m => m.Monto)))
            .OrderBy(e => e.Fecha)
            .ToList();

        var recientes = actuales
            .OrderByDescending(m => m.Fecha)
            .Take(5)
            .Select(Mapeos.MovimientoResponse)
            .ToList();

        var respuesta = new DashboardResponse(
            ingresos,
            gastos,
            ingresos - gastos,
            actuales.Count,
            Comparar(ingresos, ingresosAnt),
            Comparar(gastos, gastosAnt),
            gastosPorCategoria,
            evolucion,
            recientes
        );

        return Ok(respuesta);
    }

    private Task<List<Movimiento>> ObtenerMovimientos(Guid userId, DateTime desde, DateTime hasta, CancellationToken ct)
    {
        var hastaInclusive = hasta.AddDays(1).AddTicks(-1);
        return _db.Movimientos
            .Include(m => m.Categoria)
            .Include(m => m.MetodoPago)
            .Where(m => m.UsuarioId == userId && m.Fecha >= desde && m.Fecha <= hastaInclusive)
            .ToListAsync(ct);
    }

    private static decimal Suma(List<Movimiento> movimientos, TipoMovimiento tipo) =>
        movimientos.Where(m => m.Tipo == tipo).Sum(m => m.Monto);

    private static ComparacionDto Comparar(decimal actual, decimal anterior)
    {
        var variacion = anterior > 0
            ? Math.Round((actual - anterior) / anterior * 100, 1)
            : actual > 0 ? 100 : 0;

        return new ComparacionDto(actual, anterior, variacion);
    }
}