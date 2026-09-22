using FinanzasIA.API.Entities;
using FinanzasIA.API.Services;

namespace FinanzasIA.API.Tests;

public class MapeosTests
{
    [Fact]
    public void CategoriaResponse_MarcaEsSistema_CuandoNoTieneUsuario()
    {
        var categoria = new Categoria { Id = 5, Nombre = "Alimentación", Tipo = TipoCategoria.Gasto };

        var dto = Mapeos.CategoriaResponse(categoria);

        Assert.True(dto.EsSistema);
        Assert.Equal("Gasto", dto.Tipo);
    }

    [Fact]
    public void MovimientoIa_UsaElNombreDeLaCategoria()
    {
        var movimiento = new Movimiento
        {
            Fecha = new DateTime(2026, 9, 21),
            Monto = 120.50m,
            Tipo = TipoMovimiento.Gasto,
            Descripcion = "Mercado",
            Categoria = new Categoria { Nombre = "Alimentación" }
        };

        var dto = Mapeos.MovimientoIa(movimiento);

        Assert.Equal("Alimentación", dto.Categoria);
        Assert.Equal("Gasto", dto.Tipo);
        Assert.Equal(120.50m, dto.Monto);
    }
}