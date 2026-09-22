namespace FinanzasIA.API.Entities;

public enum TipoMovimiento
{
    Ingreso,
    Gasto
}

public class Movimiento
{
    public int Id { get; set; }
    public Guid UsuarioId { get; set; }
    public int CategoriaId { get; set; }
    public int MetodoPagoId { get; set; }
    public TipoMovimiento Tipo { get; set; }
    public decimal Monto { get; set; }
    public DateTime Fecha { get; set; }
    public string? Descripcion { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Usuario Usuario { get; set; } = null!;
    public Categoria Categoria { get; set; } = null!;
    public MetodoPago MetodoPago { get; set; } = null!;
}