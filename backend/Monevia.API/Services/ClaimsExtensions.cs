using System.Security.Claims;

namespace Monevia.API.Services;

public static class ClaimsExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal user)
    {
        var id = user.FindFirstValue(ClaimTypes.NameIdentifier)
                 ?? throw new UnauthorizedAccessException("Usuario no autenticado.");
        return Guid.Parse(id);
    }
}