using FinanzasIA.API.Data;
using FinanzasIA.API.DTOs;
using FinanzasIA.API.Entities;
using FinanzasIA.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinanzasIA.API.Controllers;

[ApiController]
[Route("api/categorias")]
[Authorize]
public class CategoriasController : ControllerBase
{
    private readonly AppDbContext _db;

    public CategoriasController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> Get(string? tipo, CancellationToken ct)
    {
        var userId = User.GetUserId();

        var query = _db.Categorias
            .Where(c => c.UsuarioId == null || c.UsuarioId == userId);

        if (!string.IsNullOrEmpty(tipo) && Enum.TryParse<TipoCategoria>(tipo, out var tipoEnum))
            query = query.Where(c => c.Tipo == tipoEnum);

        var categorias = await query.OrderBy(c => c.Tipo).ThenBy(c => c.Nombre).ToListAsync(ct);
        return Ok(categorias.Select(Mapeos.CategoriaResponse));
    }

    [HttpPost]
    public async Task<IActionResult> Crear(CategoriaNuevaRequest request, CancellationToken ct)
    {
        var userId = User.GetUserId();

        if (!Enum.TryParse<TipoCategoria>(request.Tipo, out var tipo))
            return BadRequest(new { mensaje = "Tipo de categoría inválido." });

        var duplicada = await _db.Categorias.AnyAsync(
            c => c.Nombre == request.Nombre.Trim() && c.Tipo == tipo &&
                 (c.UsuarioId == null || c.UsuarioId == userId), ct);

        if (duplicada)
            return Conflict(new { mensaje = "Ya existe una categoría con ese nombre." });

        var categoria = new Categoria
        {
            Nombre = request.Nombre.Trim(),
            Tipo = tipo,
            Icono = request.Icono,
            Color = request.Color,
            UsuarioId = userId
        };

        _db.Categorias.Add(categoria);
        await _db.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(Get), new { id = categoria.Id }, Mapeos.CategoriaResponse(categoria));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Eliminar(int id, CancellationToken ct)
    {
        var userId = User.GetUserId();
        var categoria = await _db.Categorias.SingleOrDefaultAsync(c => c.Id == id && c.UsuarioId == userId, ct);

        if (categoria is null)
            return NotFound();

        _db.Categorias.Remove(categoria);
        await _db.SaveChangesAsync(ct);

        return NoContent();
    }
}

public record CategoriaNuevaRequest(string Nombre, string Tipo, string? Icono, string? Color);