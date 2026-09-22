using System.ComponentModel.DataAnnotations;

namespace Monevia.API.DTOs;

public record RegisterRequest(
    [param: Required] [param: MinLength(2)] [param: MaxLength(100)] string Nombre,
    [param: Required] [param: EmailAddress] [param: MaxLength(150)] string Email,
    [param: Required] [param: MinLength(6)] [param: MaxLength(100)] string Password
);

public record LoginRequest(
    [param: Required] [param: EmailAddress] string Email,
    [param: Required] string Password
);

public record AuthResponse(
    string Token,
    Guid UsuarioId,
    string Nombre,
    string Email
);