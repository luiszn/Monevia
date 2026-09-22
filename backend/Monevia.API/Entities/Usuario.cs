namespace FinanzasIA.API.Entities;

public class Usuario
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Nombre { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Movimiento> Movimientos { get; set; } = new List<Movimiento>();
    public ICollection<Presupuesto> Presupuestos { get; set; } = new List<Presupuesto>();
}