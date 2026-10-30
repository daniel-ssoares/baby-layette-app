namespace Enxoval.Domain;

public record ResumoCategoria(int CategoriaId, string Nome, int TotalItens, int Concluidos, decimal Percentual);

/// <summary>Idade gestacional no formato obstétrico: semanas e dias completos (ex.: 14s5d).</summary>
public record Gestacao(int Semanas, int Dias, int DiasParaParto);

public record ResumoPainel(
    int TotalItens,
    int Concluidos,
    decimal PercentualGeral,
    decimal TotalEstimado,
    decimal TotalEstimadoEssencial,
    decimal TotalGasto,
    decimal? Saldo,
    int ForaDaEstacao,
    Gestacao? Gestacao,
    IReadOnlyList<ResumoCategoria> Categorias);

/// <summary>RF17: cálculos do dashboard, em memória (o volume de dados é pequeno).</summary>
public static class Painel
{
    /// <summary>
    /// Itens fora da estação (segundo o <paramref name="clima"/>) não entram no progresso nem nas estimativas,
    /// mas o que já foi gasto com eles continua contando.
    /// </summary>
    public static ResumoPainel Calcular(EnxovalBebe enxoval, IReadOnlyList<Categoria> categorias,
        IReadOnlyList<Item> itens, DateOnly hoje, PerfilClima? clima = null)
    {
        var considerados = itens.Where(i => clima?.ForaDaEstacao(i) != true).ToList();
        var concluidos = considerados.Count(i => i.Status == StatusItem.Concluido);
        var gasto = itens.Sum(i => i.ValorGasto);

        var porCategoria = categorias
            .OrderBy(c => c.Ordem)
            .Select(c =>
            {
                var doGrupo = considerados.Where(i => i.CategoriaId == c.Id).ToList();
                var ok = doGrupo.Count(i => i.Status == StatusItem.Concluido);
                return new ResumoCategoria(c.Id, c.Nome, doGrupo.Count, ok, Percentual(ok, doGrupo.Count));
            })
            .ToList();

        return new ResumoPainel(
            considerados.Count,
            concluidos,
            Percentual(concluidos, considerados.Count),
            considerados.Sum(i => i.ValorEstimado),
            considerados.Where(i => i.Prioridade == Prioridade.Alta).Sum(i => i.ValorEstimado),
            gasto,
            enxoval.Orcamento - gasto,
            itens.Count - considerados.Count,
            CalcularGestacao(enxoval.DataPrevistaParto, hoje),
            porCategoria);
    }

    public static Gestacao? CalcularGestacao(DateOnly? dataPrevista, DateOnly hoje)
    {
        if (dataPrevista is null) return null;
        var diasParaParto = dataPrevista.Value.DayNumber - hoje.DayNumber;
        var diasGestacao = Math.Max(280 - diasParaParto, 0);
        return new Gestacao(diasGestacao / 7, diasGestacao % 7, Math.Max(diasParaParto, 0));
    }

    private static decimal Percentual(int parte, int total) =>
        total == 0 ? 0 : Math.Round(parte * 100m / total, 1);
}
