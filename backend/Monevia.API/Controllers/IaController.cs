using FinanzasIA.API.Data;
using FinanzasIA.API.DTOs;
using FinanzasIA.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinanzasIA.API.Controllers;

[ApiController]
[Route("api/ia")]
[Authorize]
public class IaController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ServicioIa _ia;

    public IaController(AppDbContext db, ServicioIa ia)
    {
        _db = db;
        _ia = ia;
    }

    [HttpGet("analizar")]
    public async Task<IActionResult> Analizar(string? periodo, DateTime? desde, DateTime? hasta, CancellationToken ct)
    {
        var userId = User.GetUserId();
        var (rangoDesde, rangoHasta) = RangoFechas.Obtener(periodo ?? "", desde, hasta);
        var (antDesde, antHasta) = RangoFechas.Anterior(rangoDesde, rangoHasta);

        var movimientoQuery = _db.Movimientos
            .Include(m => m.Categoria)
            .Where(m => m.UsuarioId == userId);

        var actuales = await movimientoQuery
            .Where(m => m.Fecha >= rangoDesde && m.Fecha <= rangoHasta.AddDays(1).AddTicks(-1))
            .ToListAsync(ct);

        var anteriores = await movimientoQuery
            .Where(m => m.Fecha >= antDesde && m.Fecha <= antHasta.AddDays(1).AddTicks(-1))
            .ToListAsync(ct);

        var presupuestos = await _db.Presupuestos
            .Include(p => p.Categoria)
            .Where(p => p.UsuarioId == userId)
            .ToListAsync(ct);

        var envio = new AnalisisIaEnvio(
            actuales.Select(Mapeos.MovimientoIa).ToList(),
            anteriores.Select(Mapeos.MovimientoIa).ToList(),
            presupuestos.Select(Mapeos.PresupuestoIa).ToList(),
            string.IsNullOrEmpty(periodo) ? "Semana" : periodo
        );

        try
        {
            var resultado = await _ia.AnalizarAsync(envio, ct);
            if (resultado is null)
                return StatusCode(502, new { mensaje = "El servicio de IA no respondió correctamente." });

            var ingresos = resultado.Ingresos;
            var gastos = resultado.Gastos;
            var mayor = resultado.MayorGastoCategoria ?? "Sin gastos";
            var mayorMonto = resultado.MayorGastoMonto ?? 0;

            var resumenTexto = ResumenTexto(resultado, ingresos, gastos, mayor, mayorMonto);

            return Ok(new AnalisisIaResponse(
                resumenTexto,
                ingresos,
                gastos,
                ingresos - gastos,
                mayor,
                mayorMonto,
                resultado.ComparacionMensaje,
                resultado.Insights
            ));
        }
        catch (HttpRequestException)
        {
            return StatusCode(503, new { mensaje = "El servicio de IA no está disponible. Verifique que esté en ejecución." });
        }
    }

    [HttpPost("pregunta")]
    public async Task<IActionResult> Pregunta(AnalisisIaRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Pregunta))
            return BadRequest(new { mensaje = "La pregunta no puede estar vacía." });

        var userId = User.GetUserId();

        var movimientos = await _db.Movimientos
            .Include(m => m.Categoria)
            .Where(m => m.UsuarioId == userId)
            .OrderByDescending(m => m.Fecha)
            .Take(500)
            .ToListAsync(ct);

        var presupuestos = await _db.Presupuestos
            .Include(p => p.Categoria)
            .Where(p => p.UsuarioId == userId)
            .ToListAsync(ct);

        var envio = new PreguntaIaEnvio(
            request.Pregunta,
            movimientos.Select(Mapeos.MovimientoIa).ToList(),
            new List<MovimientoIaDto>(),
            presupuestos.Select(Mapeos.PresupuestoIa).ToList()
        );

        try
        {
            var resultado = await _ia.PreguntarAsync(envio, ct);
            return Ok(resultado is null
                ? new PreguntaIaResponse("No se pudo obtener una respuesta.")
                : resultado);
        }
        catch (HttpRequestException)
        {
            return StatusCode(503, new { mensaje = "El servicio de IA no está disponible. Verifique que esté en ejecución." });
        }
    }

    private static string ResumenTexto(
        AnalisisIaResultado r, decimal ingresos, decimal gastos, string mayor, decimal mayorMonto)
    {
        var lineas = new List<string>
        {
            "RESUMEN SEMANAL",
            $"Ingresos: {ingresos:N2}",
            $"Gastos: {(gastos):N2}",
            $"Balance: {(ingresos - gastos):N2}",
            "",
            $"Mayor gasto: {mayor} — {mayorMonto:N2}",
            ""
        };

        if (!string.IsNullOrEmpty(r.ComparacionMensaje))
            lineas.Add($"Comparación: {r.ComparacionMensaje}");

        return string.Join(Environment.NewLine, lineas);
    }
}