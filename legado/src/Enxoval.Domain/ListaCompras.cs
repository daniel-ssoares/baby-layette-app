namespace Enxoval.Domain;

public record LinhaCompra(
    string Nome, string? Tamanho, int Desejada, int Adquirida, int Falta, Prioridade Prioridade,
    decimal? PrecoUnitario, decimal Subtotal, StatusItem Status, bool ForaDaEstacao);

public record GrupoCompra(string Categoria, IReadOnlyList<LinhaCompra> Linhas)
{
    public decimal Subtotal => Linhas.Sum(l => l.Subtotal);
}

public record ListaDeCompras(IReadOnlyList<GrupoCompra> Grupos, bool Completa)
{
    public int TotalLinhas => Grupos.Sum(g => g.Linhas.Count);
    public decimal Total => Grupos.Sum(g => g.Subtotal);
}

/// <summary>T4: o que falta comprar, agrupado por categoria, para exportar em PDF/Excel.</summary>
public static class ListaCompras
{
    /// <param name="completa">false: só itens pendentes e dentro da estação (lista de compras);
    /// true: todos os itens, com status.</param>
    public static ListaDeCompras Montar(IEnumerable<Categoria> categorias, IEnumerable<Item> itens,
        PerfilClima? clima, bool completa)
    {
        var porCategoria = itens.ToLookup(i => i.CategoriaId);
        var grupos = categorias
            .OrderBy(c => c.Ordem).ThenBy(c => c.Nome)
            .Select(c => new GrupoCompra(c.Nome, porCategoria[c.Id]
                .Select(i => (Item: i, Fora: clima?.ForaDaEstacao(i) == true))
                .Where(x => completa || (x.Item.Status != StatusItem.Concluido && !x.Fora))
                .OrderBy(x => x.Item.Prioridade).ThenBy(x => x.Item.Id)
                .Select(x => Linha(x.Item, x.Fora))
                .ToList()))
            .Where(g => g.Linhas.Count > 0)
            .ToList();
        return new ListaDeCompras(grupos, completa);
    }

    private static LinhaCompra Linha(Item i, bool fora)
    {
        var falta = Math.Max(i.QtdDesejada - i.QtdAdquirida, 0);
        return new LinhaCompra(i.Nome, i.Tamanho, i.QtdDesejada, i.QtdAdquirida, falta, i.Prioridade,
            i.PrecoUnitarioEstimado, (i.PrecoUnitarioEstimado ?? 0) * falta, i.Status, fora);
    }
}
