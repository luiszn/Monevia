namespace Monevia.API.Entities;

public enum TipoCategoria
{
    Ingreso,
    Gasto
}

public class Categoria
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public TipoCategoria Tipo { get; set; }
    public string? Icono { get; set; }
    public string? Color { get; set; }
    public Guid? UsuarioId { get; set; }

    public Usuario? Usuario { get; set; }
    public ICollection<Movimiento> Movimientos { get; set; } = new List<Movimiento>();
}