using Enxoval.Domain;

namespace Enxoval.UnitTests;

public class AnaliseClimaTests
{
    /// <summary>Histórico sintético: mesma média em todos os dias do mês.</summary>
    private static IEnumerable<TemperaturaDiaria> Historico(Func<int, double> mediaDoMes) =>
        Enumerable.Range(0, 365).Select(d => DateOnly.FromDateTime(new DateTime(2024, 1, 1).AddDays(d)))
            .Select(dia => new TemperaturaDiaria(dia, mediaDoMes(dia.Month), mediaDoMes(dia.Month) - 6));

    private static readonly DateOnly Parto = new(2027, 4, 28);

    [Fact]
    public void Outono_frio_pede_itens_de_frio_e_dispensa_calor()
    {
        // Abr 22, mai 19, jun 17, jul 17 (perfil de São Paulo).
        var p = AnaliseClima.Analisar("São Paulo", -23.5, Parto,
            Historico(m => m switch { 4 => 22, 5 => 19, 6 => 17, 7 => 17, _ => 24 }));

        Assert.Equal(Estacao.Outono, p.EstacaoNascimento);
        Assert.Equal([4, 5, 6, 7], p.Meses.Select(m => m.Mes));
        Assert.Equal(17, p.Meses[2].TempMedia);
        Assert.Equal(11, p.Meses[2].TempMinima);
        Assert.True(p.PrecisaFrio);
        Assert.False(p.PrecisaCalor);
    }

    [Fact]
    public void Clima_quente_o_ano_todo_dispensa_itens_de_frio()
    {
        var p = AnaliseClima.Analisar("Fortaleza", -3.7, Parto, Historico(_ => 27));
        Assert.False(p.PrecisaFrio);
        Assert.True(p.PrecisaCalor);
        Assert.True(p.ForaDaEstacao(new Item { Nome = "Manta", Clima = Clima.Frio }));
        Assert.False(p.ForaDaEstacao(new Item { Nome = "Body", Clima = Clima.Todos }));
    }

    [Fact]
    public void Meia_estacao_mantem_os_dois_tipos()
    {
        var p = AnaliseClima.Analisar(null, -20, Parto, Historico(_ => 22));
        Assert.True(p.PrecisaFrio && p.PrecisaCalor);
    }

    [Theory]
    [InlineData("2027-04-28", -23.5, Estacao.Outono)]
    [InlineData("2027-07-10", -23.5, Estacao.Inverno)]
    [InlineData("2027-01-10", -23.5, Estacao.Verao)]
    [InlineData("2027-10-10", -23.5, Estacao.Primavera)]
    [InlineData("2027-04-28", 40.4, Estacao.Primavera)] // hemisfério norte
    [InlineData("2027-01-10", 40.4, Estacao.Inverno)]
    public void Estacao_depende_do_hemisferio(string data, double latitude, Estacao esperada) =>
        Assert.Equal(esperada, AnaliseClima.EstacaoEm(DateOnly.Parse(data), latitude));

    [Fact]
    public void Painel_desconsidera_itens_fora_da_estacao()
    {
        var clima = new PerfilClima(null, Estacao.Verao, [], PrecisaFrio: false, PrecisaCalor: true);
        Item[] itens =
        [
            new() { Nome = "Body", CategoriaId = 1, QtdDesejada = 1, PrecoUnitarioEstimado = 20 },
            new() { Nome = "Manta quente", CategoriaId = 1, QtdDesejada = 1, PrecoUnitarioEstimado = 60, Clima = Clima.Frio,
                    QtdAdquirida = 1, ValorPago = 60, Origem = OrigemItem.Comprado },
        ];

        var r = Painel.Calcular(new EnxovalBebe(), [new Categoria { Id = 1, Nome = "Roupas" }], itens, new(2026, 10, 26), clima);

        Assert.Equal(1, r.TotalItens);
        Assert.Equal(1, r.ForaDaEstacao);
        Assert.Equal(20m, r.TotalEstimado);
        Assert.Equal(60m, r.TotalGasto); // o que já foi gasto continua contando
    }
}
