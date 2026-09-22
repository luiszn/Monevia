using System.Net.Http.Json;
using System.Text.Json;
using Monevia.API.DTOs;

namespace Monevia.API.Services;

public class ServicioIa
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly HttpClient _http;

    public ServicioIa(HttpClient http)
    {
        _http = http;
    }

    public async Task<AnalisisIaResultado?> AnalizarAsync(AnalisisIaEnvio datos, CancellationToken ct = default)
    {
        var response = await _http.PostAsJsonAsync("/api/analizar", datos, JsonOptions, ct);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<AnalisisIaResultado>(JsonOptions, ct);
    }

    public async Task<PreguntaIaResultado?> PreguntarAsync(PreguntaIaEnvio datos, CancellationToken ct = default)
    {
        var response = await _http.PostAsJsonAsync("/api/pregunta", datos, JsonOptions, ct);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<PreguntaIaResultado>(JsonOptions, ct);
    }
}