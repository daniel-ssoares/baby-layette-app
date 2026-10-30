using Enxoval.Domain;

namespace Enxoval.UnitTests;

public class ListaComprasTests
{
    private static readonly Categoria Roupas = new() { Id = 1, Nome = "Roupas", Ordem = 2 };
    private static readonly Categoria Quarto = new() { Id = 2, Nome = "Quarto", Ordem = 1 };
    private static readonly Categoria Banho = new() { Id = 3, Nome = "Banho", Ordem = 3 };

    private static readonly Item[] Itens =
    [
        new() { Id = 1, CategoriaId = 1, Nome = "Body", QtdDesejada = 6, QtdAdquirida = 2, PrecoUnitarioEstimado = 20, Prioridade = Prioridade.Media },
        new() { Id = 2, CategoriaId = 1, Nome = "Meia", QtdDesejada = 4, QtdAdquirida = 4, PrecoUnitarioEstimado = 8 },
        new() { Id = 3, CategoriaId = 1, Nome = "Casaquinho", QtdDesejada = 2, PrecoUnitarioEstimado = 45, Clima = Clima.Frio, Prioridade = Prioridade.Alta },
        new() { Id = 4, CategoriaId = 2, Nome = "Berço", QtdDesejada = 1, PrecoUnitarioEstimado = 550, Prioridade = Prioridade.Alta },
        new() { Id = 5, CategoriaId = 3, Nome = "Toalha", QtdDesejada = 3, QtdAdquirida = 3 },
    ];

    private static readonly PerfilClima Calor = new(null, Estacao.Verao, [], PrecisaFrio: false, PrecisaCalor: true);

    [Fact]
    public void Lista_de_compras_tem_so_o_que_falta_dentro_da_estacao()
    {
        var lista = ListaCompras.Montar([Roupas, Quarto, Banho], Itens, Calor, completa: false);

        Assert.Equal(["Quarto", "Roupas"], lista.Grupos.Select(g => g.Categoria)); // ordem da categoria; Banho sem pendências
        var body = Assert.Single(lista.Grupos[1].Linhas);                          // Meia concluída, Casaquinho fora da estação
        Assert.Equal(("Body", 4, 80m), (body.Nome, body.Falta, body.Subtotal));
        Assert.Equal(630m, lista.Total);
        Assert.Equal(2, lista.TotalLinhas);
    }

    [Fact]
    public void Lista_completa_inclui_tudo_ordenado_por_prioridade()
    {
        var lista = ListaCompras.Montar([Roupas, Quarto, Banho], Itens, Calor, completa: true);

        Assert.Equal(5, lista.TotalLinhas);
        Assert.Equal(["Casaquinho", "Body", "Meia"], lista.Grupos[1].Linhas.Select(l => l.Nome));
        Assert.True(lista.Grupos[1].Linhas[0].ForaDaEstacao);
        Assert.Equal(0, lista.Grupos[1].Linhas[2].Falta);
    }

    [Fact]
    public void Sem_clima_nada_fica_fora_da_estacao()
    {
        var lista = ListaCompras.Montar([Roupas], Itens, clima: null, completa: false);
        Assert.Contains(lista.Grupos[0].Linhas, l => l.Nome == "Casaquinho");
    }
}
