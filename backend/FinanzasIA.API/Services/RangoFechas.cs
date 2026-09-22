namespace FinanzasIA.API.Services;

public static class RangoFechas
{
    /// <summary>
    /// Calcula el rango de fechas de un período. La semana inicia en lunes.
    /// </summary>
    public static (DateTime Desde, DateTime Hasta) Obtener(
        string periodo, DateTime? desde, DateTime? hasta, DateTime? hoy = null)
    {
        var fecha = (hoy ?? DateTime.Today).Date;

        var (inicio, fin) = periodo switch
        {
            "Semana" or "" or null => (InicioSemana(fecha), fecha),
            "SemanaAnterior" => (InicioSemana(fecha).AddDays(-7), InicioSemana(fecha).AddDays(-1)),
            "Mes" => (new DateTime(fecha.Year, fecha.Month, 1), fecha),
            "MesAnterior" => (new DateTime(fecha.Year, fecha.Month, 1).AddMonths(-1),
                              new DateTime(fecha.Year, fecha.Month, 1).AddDays(-1)),
            "Rango" when desde.HasValue && hasta.HasValue => (desde.Value.Date, hasta.Value.Date >= fecha ? fecha : hasta.Value.Date),
            _ => (InicioSemana(fecha), fecha)
        };

        return (inicio, fin);
    }

    private static DateTime InicioSemana(DateTime fecha)
    {
        int dias = ((int)fecha.DayOfWeek + 6) % 7;
        return fecha.AddDays(-dias);
    }

    /// <summary>
    /// Calcula el período inmediatamente anterior a un rango dado.
    /// </summary>
    public static (DateTime Desde, DateTime Hasta) Anterior(DateTime desde, DateTime hasta)
    {
        int dias = (hasta.Date - desde.Date).Days;
        return (desde.Date.AddDays(-(dias + 1)), desde.Date.AddDays(-1));
    }
}