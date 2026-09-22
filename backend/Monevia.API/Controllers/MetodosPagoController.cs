using Monevia.API.Data;
using Monevia.API.DTOs;
using Monevia.API.Entities;
using Monevia.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Monevia.API.Controllers;

[ApiController]
[Route("api/metodos-pago")]
[Authorize]
public class MetodosPagoController : ControllerBase
{
    private readonly AppDbContext _db;

    public MetodosPagoController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var userId = User.GetUserId();
        var metodos = await _db.MetodosPago
            .Where(m => m.UsuarioId == null || m.UsuarioId == userId)
            .OrderBy(m => m.Nombre)
            .ToListAsync(ct);

        return Ok(metodos.Select(m => new MetodoPagoResponse(m.Id, m.Nombre, m.UsuarioId is null)));
    }

    [HttpPost]
    public async Task<IActionResult> Crear(MetodoPagoNuevoRequest request, CancellationToken ct)
    {
        var userId = User.GetUserId();

        var duplicado = await _db.MetodosPago.AnyAsync(
            m => m.Nombre == request.Nombre.Trim() && (m.UsuarioId == null || m.UsuarioId == userId), ct);

        if (duplicado)
            return Conflict(new { mensaje = "Ya existe un método de pago con ese nombre." });

        var metodo = new MetodoPago { Nombre = request.Nombre.Trim(), UsuarioId = userId };
        _db.MetodosPago.Add(metodo);
        await _db.SaveChangesAsync(ct);

        return Ok(new MetodoPagoResponse(metodo.Id, metodo.Nombre, false));
    }
}

public record MetodoPagoNuevoRequest(string Nombre);