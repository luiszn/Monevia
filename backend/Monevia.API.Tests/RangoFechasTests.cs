using Monevia.API.Services;

namespace Monevia.API.Tests;

public class RangoFechasTests
{
    [Fact]
    public void Obtener_Semana_IniciaElLunes()
    {
        // Sábado 21 de septiembre de 2026 pertenece a la semana del lunes 21
        var (desde, hasta) = RangoFechas.Obtener("Semana", null, null, new DateTime(2026, 9, 21));

        Assert.Equal(new DateTime(2026, 9, 21), desde);
        Assert.Equal(new DateTime(2026, 9, 21), hasta);
    }

    [Fact]
    public void Obtener_Semana_CubreDesdeElLunesHastaHoy()
    {
        // Miércoles 23 sep 2026 → la semana va del lunes 21 hasta hoy
        var (desde, hasta) = RangoFechas.Obtener("Semana", null, null, new DateTime(2026, 9, 23));

        Assert.Equal(new DateTime(2026, 9, 21), desde);
        Assert.Equal(new DateTime(2026, 9, 23), hasta);
    }

    [Fact]
    public void Obtener_SemanaAnterior_EsLaPrevia()
    {
        var (desde, hasta) = RangoFechas.Obtener("SemanaAnterior", null, null, new DateTime(2026, 9, 21));

        Assert.Equal(new DateTime(2026, 9, 14), desde);
        Assert.Equal(new DateTime(2026, 9, 20), hasta);
    }

    [Fact]
    public void Obtener_Mes_CubreElMesCompleto()
    {
        var (desde, hasta) = RangoFechas.Obtener("Mes", null, null, new DateTime(2026, 9, 21));

        Assert.Equal(new DateTime(2026, 9, 1), desde);
        Assert.Equal(new DateTime(2026, 9, 21), hasta);
    }

    [Fact]
    public void Obtener_MesAnterior_CubreSeptiembreCuandoHoyEsOctubre()
    {
        var (desde, hasta) = RangoFechas.Obtener("MesAnterior", null, null, new DateTime(2026, 10, 4));

        Assert.Equal(new DateTime(2026, 9, 1), desde);
        Assert.Equal(new DateTime(2026, 9, 30), hasta);
    }

    [Fact]
    public void Anterior_DaElPeriodoDeIgualDuraciónAntesDelRango()
    {
        var (antDesde, antHasta) = RangoFechas.Anterior(new DateTime(2026, 9, 21), new DateTime(2026, 9, 27));

        Assert.Equal(new DateTime(2026, 9, 14), antDesde);
        Assert.Equal(new DateTime(2026, 9, 20), antHasta);
    }

    [Fact]
    public void Obtener_Rango_PersonalizadoRespetaFechas()
    {
        var (desde, hasta) = RangoFechas.Obtener("Rango", new DateTime(2026, 9, 1), new DateTime(2026, 9, 10),
            new DateTime(2026, 9, 21));

        Assert.Equal(new DateTime(2026, 9, 1), desde);
        Assert.Equal(new DateTime(2026, 9, 10), hasta);
    }
}