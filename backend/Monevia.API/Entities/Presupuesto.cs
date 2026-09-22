namespace Monevia.API.Entities;

public enum TipoPeriodo
{
    Semanal,
    Mensual
}

public class Presupuesto
{
    public int Id { get; set; }
    public Guid UsuarioId { get; set; }
    public int CategoriaId { get; set; }
    public TipoPeriodo Periodo { get; set; }
    public decimal Monto { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Usuario Usuario { get; set; } = null!;
    public Categoria Categoria { get; set; } = null!;
}