using Monevia.API.Data;
using Monevia.API.DTOs;
using Monevia.API.Entities;
using Monevia.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Monevia.API.Controllers;

[ApiController]
[Route("api/movimientos")]
[Authorize]
public class MovimientosController : ControllerBase
{
    private readonly AppDbContext _db;

    public MovimientosController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] MovimientoQuery query, CancellationToken ct)
    {
        var userId = User.GetUserId();
        var (desde, hasta) = RangoFechas.Obtener(query.Periodo ?? "", query.Desde, query.Hasta);

        var consulta = _db.Movimientos
            .Include(m => m.Categoria)
            .Include(m => m.MetodoPago)
            .Where(m => m.UsuarioId == userId && m.Fecha >= desde && m.Fecha <= hasta.AddDays(1).AddTicks(-1));

        if (query.CategoriaId.HasValue)
            consulta = consulta.Where(m => m.CategoriaId == query.CategoriaId);

        if (!string.IsNullOrEmpty(query.Tipo) && Enum.TryParse<TipoMovimiento>(query.Tipo, out var tipo))
            consulta = consulta.Where(m => m.Tipo == tipo);

        if (!string.IsNullOrEmpty(query.Busqueda))
        {
            var termino = query.Busqueda.Trim();
            consulta = consulta.Where(m =>
                m.Descripcion != null && m.Descripcion.Contains(termino) ||
                m.Categoria.Nombre.Contains(termino));
        }

        consulta = Ordenar(consulta, query.OrdenarPor, query.Direccion);

        var movimientos = await consulta.Take(500).ToListAsync(ct);
        return Ok(movimientos.Select(Mapeos.MovimientoResponse));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
    {
        var userId = User.GetUserId();
        var movimiento = await _db.Movimientos
            .Include(m => m.Categoria)
            .Include(m => m.MetodoPago)
            .SingleOrDefaultAsync(m => m.Id == id && m.UsuarioId == userId, ct);

        if (movimiento is null)
            return NotFound();

        return Ok(Mapeos.MovimientoResponse(movimiento));
    }

    [HttpPost]
    public async Task<IActionResult> Crear(MovimientoRequest request, CancellationToken ct)
    {
        var userId = User.GetUserId();

        var validacion = await Validar(request, userId, ct);
        if (validacion is not null)
            return BadRequest(new { mensaje = validacion });

        var movimiento = new Movimiento
        {
            UsuarioId = userId,
            Tipo = Enum.Parse<TipoMovimiento>(request.Tipo),
            Monto = request.Monto,
            Fecha = request.Fecha.ToUniversalTime(),
            CategoriaId = request.CategoriaId,
            MetodoPagoId = request.MetodoPagoId,
            Descripcion = request.Descripcion?.Trim()
        };

        _db.Movimientos.Add(movimiento);
        await _db.SaveChangesAsync(ct);

        var creado = await _db.Movimientos
            .Include(m => m.Categoria)
            .Include(m => m.MetodoPago)
            .SingleAsync(m => m.Id == movimiento.Id, ct);

        return CreatedAtAction(nameof(GetById), new { id = creado.Id }, Mapeos.MovimientoResponse(creado));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Actualizar(int id, MovimientoRequest request, CancellationToken ct)
    {
        var userId = User.GetUserId();
        var movimiento = await _db.Movimientos.SingleOrDefaultAsync(m => m.Id == id && m.UsuarioId == userId, ct);

        if (movimiento is null)
            return NotFound();

        var validacion = await Validar(request, userId, ct);
        if (validacion is not null)
            return BadRequest(new { mensaje = validacion });

        movimiento.Tipo = Enum.Parse<TipoMovimiento>(request.Tipo);
        movimiento.Monto = request.Monto;
        movimiento.Fecha = request.Fecha.ToUniversalTime();
        movimiento.CategoriaId = request.CategoriaId;
        movimiento.MetodoPagoId = request.MetodoPagoId;
        movimiento.Descripcion = request.Descripcion?.Trim();
        movimiento.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);

        var actualizado = await _db.Movimientos
            .Include(m => m.Categoria)
            .Include(m => m.MetodoPago)
            .SingleAsync(m => m.Id == id, ct);

        return Ok(Mapeos.MovimientoResponse(actualizado));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Eliminar(int id, CancellationToken ct)
    {
        var userId = User.GetUserId();
        var movimiento = await _db.Movimientos.SingleOrDefaultAsync(m => m.Id == id && m.UsuarioId == userId, ct);

        if (movimiento is null)
            return NotFound();

        _db.Movimientos.Remove(movimiento);
        await _db.SaveChangesAsync(ct);

        return NoContent();
    }

    private async Task<string?> Validar(MovimientoRequest request, Guid userId, CancellationToken ct)
    {
        if (!Enum.TryParse<TipoMovimiento>(request.Tipo, out var tipo))
            return "Tipo de movimiento inválido.";

        var categoria = await _db.Categorias
            .SingleOrDefaultAsync(c => c.Id == request.CategoriaId &&
                                       (c.UsuarioId == null || c.UsuarioId == userId), ct);

        if (categoria is null)
            return "Categoría no encontrada.";

        if (categoria.Tipo.ToString() != request.Tipo)
            return "La categoría no corresponde al tipo de movimiento.";

        var metodo = await _db.MetodosPago
            .SingleOrDefaultAsync(m => m.Id == request.MetodoPagoId &&
                                       (m.UsuarioId == null || m.UsuarioId == userId), ct);

        if (metodo is null)
            return "Método de pago no encontrado.";

        return null;
    }

    private static IQueryable<Movimiento> Ordenar(IQueryable<Movimiento> consulta, string? ordenarPor, string? direccion)
    {
        var descendente = string.Equals(direccion, "desc", StringComparison.OrdinalIgnoreCase);

        var ordenada = (ordenarPor ?? "fecha").ToLowerInvariant() switch
        {
            "monto" => descendente ? consulta.OrderByDescending(m => m.Monto) : consulta.OrderBy(m => m.Monto),
            "categoria" => descendente
                ? consulta.OrderByDescending(m => m.Categoria.Nombre)
                : consulta.OrderBy(m => m.Categoria.Nombre),
            _ => descendente ? consulta.OrderByDescending(m => m.Fecha) : consulta.OrderBy(m => m.Fecha)
        };

        return ordenada;
    }
}