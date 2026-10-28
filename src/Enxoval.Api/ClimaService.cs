using System.Globalization;
using Enxoval.Domain;
using Microsoft.Extensions.Caching.Memory;

namespace Enxoval.Api;

public record LocalDto(string Nome, string? Estado, string? Pais, double Latitude, double Longitude);

/// <summary>
/// Clima histórico e busca de cidades via Open-Meteo (gratuito, sem chave).
/// Falhas de rede não quebram o app: sem dados de clima, nenhum item fica "fora da estação".
/// </summary>
public class ClimaService(HttpClient http, IMemoryCache cache, TimeProvider clock, ILogger<ClimaService> log)
{
    private const int AnosDeHistorico = 5;

    public async Task<PerfilClima?> ObterPerfilAsync(EnxovalBebe enxoval, CancellationToken ct = default)
    {
        if (enxoval is not { Latitude: { } lat, Longitude: { } lon, DataPrevistaParto: { } parto }) return null;
        var historico = await ObterHistoricoAsync(lat, lon, ct);
        return historico is null ? null : AnaliseClima.Analisar(enxoval.Cidade, lat, parto, historico);
    }

    public async Task<IReadOnlyList<LocalDto>> BuscarLocaisAsync(string termo, CancellationToken ct = default)
    {
        var url = $"https://geocoding-api.open-meteo.com/v1/search?count=6&language=pt&format=json&name={Uri.EscapeDataString(termo)}";
        try
        {
            var r = await http.GetFromJsonAsync<GeoResposta>(url, ct);
            return r?.Results?.Select(x => new LocalDto(x.Name, x.Admin1, x.Country, x.Latitude, x.Longitude)).ToList() ?? [];
        }
        catch (Exception e) when (e is HttpRequestException or TaskCanceledException)
        {
            log.LogWarning(e, "Falha ao buscar locais");
            return [];
        }
    }

    private async Task<List<TemperaturaDiaria>?> ObterHistoricoAsync(double lat, double lon, CancellationToken ct)
    {
        var chave = $"clima:{lat:F2}:{lon:F2}";
        if (cache.TryGetValue(chave, out List<TemperaturaDiaria>? salvo)) return salvo;

        var ultimoAno = clock.GetLocalNow().Year - 1;
        var inv = CultureInfo.InvariantCulture;
        var url = $"https://archive-api.open-meteo.com/v1/archive?latitude={lat.ToString("F4", inv)}&longitude={lon.ToString("F4", inv)}" +
            $"&start_date={ultimoAno - AnosDeHistorico + 1}-01-01&end_date={ultimoAno}-12-31" +
            "&daily=temperature_2m_mean,temperature_2m_min&timezone=auto";
        try
        {
            var r = await http.GetFromJsonAsync<ArquivoResposta>(url, ct);
            if (r?.Daily is not { } d) return null;
            var dias = d.Time.Select((dia, i) => (dia, media: d.Temperature_2m_mean[i], min: d.Temperature_2m_min[i]))
                .Where(x => x.media is not null && x.min is not null)
                .Select(x => new TemperaturaDiaria(DateOnly.Parse(x.dia, CultureInfo.InvariantCulture), x.media!.Value, x.min!.Value))
                .ToList();
            cache.Set(chave, dias, TimeSpan.FromDays(7));
            return dias;
        }
        catch (Exception e) when (e is HttpRequestException or TaskCanceledException)
        {
            log.LogWarning(e, "Falha ao obter clima histórico para {Lat},{Lon}", lat, lon);
            return null;
        }
    }

    private record GeoResposta(List<GeoResultado>? Results);
    private record GeoResultado(string Name, string? Admin1, string? Country, double Latitude, double Longitude);
    private record ArquivoResposta(Diario? Daily);
    private record Diario(List<string> Time, List<double?> Temperature_2m_mean, List<double?> Temperature_2m_min);
}
