using Monevia.API.Data;
using Monevia.API.DTOs;
using Monevia.API.Entities;
using Monevia.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Monevia.API.Controllers;

[ApiController]
[Route("api/presupuestos")]
[Authorize]
public class PresupuestosController : ControllerBase
{
    private readonly AppDbContext _db;

    public PresupuestosController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var userId = User.GetUserId();

        var presupuestos = await _db.Presupuestos
            .Include(p => p.Categoria)
            .Where(p => p.UsuarioId == userId)
            .OrderBy(p => p.Categoria.Nombre)
            .ToListAsync(ct);

        var resultado = new List<PresupuestoResponse>();
        foreach (var presupuesto in presupuestos)
        {
            var (desde, hasta) = VentanaGasto(presupuesto.Periodo);
            var gastado = await GastoDeCategoria(userId, presupuesto.CategoriaId, desde, hasta, ct);

            var porcentaje = presupuesto.Monto > 0 ? gastado / presupuesto.Monto * 100 : 0;
            var estado = porcentaje >= 100 ? "Superado" : porcentaje >= 85 ? "Cerca" : "Disponible";

            resultado.Add(new PresupuestoResponse(
                presupuesto.Id,
                presupuesto.CategoriaId,
                presupuesto.Categoria.Nombre,
                presupuesto.Periodo.ToString(),
                presupuesto.Monto,
                gastado,
                Math.Max(0, presupuesto.Monto - gastado),
                Math.Round(porcentaje, 1),
                estado
            ));
        }

        return Ok(resultado);
    }

    [HttpPost]
    [HttpPut]
    public async Task<IActionResult> Guardar(PresupuestoRequest request, CancellationToken ct)
    {
        var userId = User.GetUserId();

        if (!Enum.TryParse<TipoPeriodo>(request.Periodo, out var periodo))
            return BadRequest(new { mensaje = "Período inválido." });

        var categoria = await _db.Categorias.SingleOrDefaultAsync(
            c => c.Id == request.CategoriaId &&
                 (c.UsuarioId == null || c.UsuarioId == userId) && c.Tipo == TipoCategoria.Gasto, ct);

        if (categoria is null)
            return BadRequest(new { mensaje = "Categoría no encontrada." });

        var existente = await _db.Presupuestos.SingleOrDefaultAsync(
            p => p.UsuarioId == userId && p.CategoriaId == request.CategoriaId && p.Periodo == periodo, ct);

        if (existente is not null)
        {
            existente.Monto = request.Monto;
        }
        else
        {
            _db.Presupuestos.Add(new Presupuesto
            {
                UsuarioId = userId,
                CategoriaId = request.CategoriaId,
                Periodo = periodo,
                Monto = request.Monto
            });
        }

        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Eliminar(int id, CancellationToken ct)
    {
        var userId = User.GetUserId();
        var presupuesto = await _db.Presupuestos.SingleOrDefaultAsync(p => p.Id == id && p.UsuarioId == userId, ct);

        if (presupuesto is null)
            return NotFound();

        _db.Presupuestos.Remove(presupuesto);
        await _db.SaveChangesAsync(ct);

        return NoContent();
    }

    private (DateTime, DateTime) VentanaGasto(TipoPeriodo periodo)
    {
        var hoy = DateTime.Today;
        return periodo == TipoPeriodo.Semanal
            ? RangoFechas.Obtener("Semana", null, null, hoy)
            : RangoFechas.Obtener("Mes", null, null, hoy);
    }

    private async Task<decimal> GastoDeCategoria(Guid userId, int categoriaId, DateTime desde, DateTime hasta, CancellationToken ct)
    {
        var hastaInclusive = hasta.AddDays(1).AddTicks(-1);
        return await _db.Movimientos
            .Where(m => m.UsuarioId == userId &&
                        m.CategoriaId == categoriaId &&
                        m.Tipo == TipoMovimiento.Gasto &&
                        m.Fecha >= desde && m.Fecha <= hastaInclusive)
            .SumAsync(m => (decimal?)m.Monto ?? 0, ct);
    }
}