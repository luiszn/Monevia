namespace FinanzasIA.API.Entities;

public class MetodoPago
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public Guid? UsuarioId { get; set; }

    public Usuario? Usuario { get; set; }
    public ICollection<Movimiento> Movimientos { get; set; } = new List<Movimiento>();
}