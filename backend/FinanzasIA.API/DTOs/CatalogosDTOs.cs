namespace FinanzasIA.API.DTOs;

public record CategoriaResponse(
    int Id,
    string Nombre,
    string Tipo,
    string? Icono,
    string? Color,
    bool EsSistema
);

public record MetodoPagoResponse(int Id, string Nombre, bool EsSistema);