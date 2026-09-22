using FinanzasIA.API.Data;
using FinanzasIA.API.DTOs;
using FinanzasIA.API.Entities;
using FinanzasIA.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinanzasIA.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly TokenService _tokens;

    public AuthController(AppDbContext db, TokenService tokens)
    {
        _db = db;
        _tokens = tokens;
    }

    [HttpPost("registro")]
    [AllowAnonymous]
    public async Task<IActionResult> Registro(RegisterRequest request, CancellationToken ct)
    {
        var existe = await _db.Usuarios.AnyAsync(u => u.Email == request.Email, ct);
        if (existe)
            return Conflict(new { mensaje = "Ya existe una cuenta con ese correo." });

        var usuario = new Usuario
        {
            Nombre = request.Nombre.Trim(),
            Email = request.Email.Trim().ToLowerInvariant(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
        };

        _db.Usuarios.Add(usuario);
        await _db.SaveChangesAsync(ct);

        return Ok(Respuesta(usuario));
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login(LoginRequest request, CancellationToken ct)
    {
        var usuario = await _db.Usuarios.SingleOrDefaultAsync(u => u.Email == request.Email.Trim().ToLowerInvariant(), ct);
        if (usuario is null || !BCrypt.Net.BCrypt.Verify(request.Password, usuario.PasswordHash))
            return Unauthorized(new { mensaje = "Correo o contraseña incorrectos." });

        return Ok(Respuesta(usuario));
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me(CancellationToken ct)
    {
        var userId = User.GetUserId();
        var usuario = await _db.Usuarios.FindAsync([userId], ct);

        if (usuario is null)
            return Unauthorized();

        return Ok(Respuesta(usuario));
    }

    private AuthResponse Respuesta(Usuario usuario) => new(
        _tokens.GenerarToken(usuario),
        usuario.Id,
        usuario.Nombre,
        usuario.Email
    );
}