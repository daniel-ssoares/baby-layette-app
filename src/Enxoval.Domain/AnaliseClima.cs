namespace Enxoval.Domain;

/// <summary>Temperatura diária observada (°C), usada para montar a média histórica.</summary>
public record TemperaturaDiaria(DateOnly Dia, double Media, double Minima);

public record ClimaMes(int Ano, int Mes, double TempMedia, double TempMinima);

/// <summary>Clima esperado nos primeiros meses de vida e quais tipos de item fazem sentido.</summary>
public record PerfilClima(
    string? Cidade, Estacao EstacaoNascimento, IReadOnlyList<ClimaMes> Meses, bool PrecisaFrio, bool PrecisaCalor)
{
    /// <summary>Item com clima específico que não combina com os meses analisados.</summary>
    public bool ForaDaEstacao(Item item) => item.Clima switch
    {
        Clima.Frio => !PrecisaFrio,
        Clima.Calor => !PrecisaCalor,
        _ => false,
    };
}

public static class AnaliseClima
{
    /// <summary>Mês do nascimento + os 3 seguintes (período em que o enxoval inicial é usado).</summary>
    public const int MesesAnalisados = 4;

    // Limiares de média mensal para bebês: abaixo de 21 °C pede roupa de frio; acima de 23 °C, roupa de calor.
    public const double LimiteFrio = 21;
    public const double LimiteCalor = 23;

    public static PerfilClima Analisar(string? cidade, double latitude, DateOnly parto, IEnumerable<TemperaturaDiaria> historico)
    {
        var porMes = historico
            .GroupBy(t => t.Dia.Month)
            .ToDictionary(g => g.Key, g => (Media: g.Average(t => t.Media), Minima: g.Average(t => t.Minima)));

        var meses = Enumerable.Range(0, MesesAnalisados)
            .Select(i => parto.AddMonths(i))
            .Where(d => porMes.ContainsKey(d.Month))
            .Select(d => new ClimaMes(d.Year, d.Month, Math.Round(porMes[d.Month].Media, 1), Math.Round(porMes[d.Month].Minima, 1)))
            .ToList();

        var frio = meses.Any(m => m.TempMedia < LimiteFrio);
        var calor = meses.Any(m => m.TempMedia > LimiteCalor);
        // Meia-estação (todas as médias entre os limites): mantém os dois tipos.
        if (!frio && !calor) frio = calor = true;

        return new PerfilClima(cidade, EstacaoEm(parto, latitude), meses, frio, calor);
    }

    /// <summary>Estação astronômica aproximada; invertida no hemisfério norte.</summary>
    public static Estacao EstacaoEm(DateOnly data, double latitude)
    {
        var md = data.Month * 100 + data.Day;
        var sul = md switch
        {
            >= 321 and < 621 => Estacao.Outono,
            >= 621 and < 923 => Estacao.Inverno,
            >= 923 and < 1222 => Estacao.Primavera,
            _ => Estacao.Verao,
        };
        if (latitude < 0) return sul;
        return sul switch
        {
            Estacao.Outono => Estacao.Primavera,
            Estacao.Primavera => Estacao.Outono,
            Estacao.Inverno => Estacao.Verao,
            _ => Estacao.Inverno,
        };
    }
}
