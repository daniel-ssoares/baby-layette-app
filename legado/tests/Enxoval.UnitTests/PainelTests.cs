using Enxoval.Domain;

namespace Enxoval.UnitTests;

public class PainelTests
{
    private static readonly DateOnly Hoje = new(2026, 10, 26);

    [Fact]
    public void Calcula_progresso_orcamento_e_categorias()
    {
        var enxoval = new EnxovalBebe { Orcamento = 1000 };
        var quarto = new Categoria { Id = 1, Nome = "Quarto", Ordem = 1 };
        var roupas = new Categoria { Id = 2, Nome = "Roupas", Ordem = 2 };
        Item[] itens =
        [
            new() { Nome = "Berço", CategoriaId = 1, QtdDesejada = 1, QtdAdquirida = 1, PrecoUnitarioEstimado = 500, ValorPago = 450, Origem = OrigemItem.Comprado },
            new() { Nome = "Body", CategoriaId = 2, QtdDesejada = 4, QtdAdquirida = 4, PrecoUnitarioEstimado = 30, ValorPago = 120, Origem = OrigemItem.Ganhado },
            new() { Nome = "Meia", CategoriaId = 2, QtdDesejada = 6, PrecoUnitarioEstimado = 10, Prioridade = Prioridade.Alta },
        ];

        var r = Painel.Calcular(enxoval, [roupas, quarto], itens, Hoje);

        Assert.Equal(3, r.TotalItens);
        Assert.Equal(2, r.Concluidos);
        Assert.Equal(66.7m, r.PercentualGeral);
        Assert.Equal(680m, r.TotalEstimado);
        Assert.Equal(60m, r.TotalEstimadoEssencial);
        Assert.Equal(450m, r.TotalGasto);
        Assert.Equal(550m, r.Saldo);
        Assert.Equal(["Quarto", "Roupas"], r.Categorias.Select(c => c.Nome));
        Assert.Equal(50m, r.Categorias[1].Percentual);
    }

    [Fact]
    public void Sem_orcamento_nao_ha_saldo_e_sem_itens_percentual_e_zero()
    {
        var r = Painel.Calcular(new EnxovalBebe(), [], [], Hoje);
        Assert.Null(r.Saldo);
        Assert.Equal(0, r.PercentualGeral);
    }

    [Theory]
    [InlineData("2027-04-28", 13, 5, 184)]
    [InlineData("2026-10-26", 40, 0, 0)]
    [InlineData("2026-10-20", 40, 6, 0)] // passou da data prevista
    public void Calcula_idade_gestacional(string dataPrevista, int semanas, int dias, int diasParaParto)
    {
        var g = Painel.CalcularGestacao(DateOnly.Parse(dataPrevista), Hoje)!;
        Assert.Equal(new Gestacao(semanas, dias, diasParaParto), g);
    }
}
