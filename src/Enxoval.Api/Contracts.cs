using Enxoval.Domain;

namespace Enxoval.Api;

public record EnxovalDto(
    int Id, string? NomeBebe, SexoBebe Sexo, DateOnly? DataPrevistaParto, decimal? Orcamento,
    string? Cidade, double? Latitude, double? Longitude, bool BoasVindasConcluidas, TemaVisual Tema);
public record AtualizarEnxovalRequest(
    string? NomeBebe, SexoBebe Sexo, DateOnly? DataPrevistaParto, decimal? Orcamento,
    string? Cidade, double? Latitude, double? Longitude);
public record TrocarTemaRequest(TemaVisual Tema);

/// <summary>T2: respostas da tela de boas-vindas (todas opcionais). O tema precisa estar entre os do sexo informado.</summary>
public record BoasVindasRequest(string? NomeBebe, DateOnly? DataPrevistaParto, SexoBebe? Sexo = null, TemaVisual? Tema = null);

public record CategoriaDto(int Id, string Nome, int Ordem, int TotalItens);
public record SalvarCategoriaRequest(string Nome, int Ordem);

public record ItemDto(
    int Id, int CategoriaId, string Nome, string? Tamanho, int QtdDesejada, int QtdAdquirida,
    Prioridade Prioridade, Clima Clima, decimal? PrecoUnitarioEstimado, decimal? ValorPago, OrigemItem? Origem,
    string? LojaLink, string? Observacoes, StatusItem Status, decimal ValorEstimado, bool ForaDaEstacao,
    string? FotoUrl, DateTime AtualizadoEm)
{
    public static ItemDto De(Item i, PerfilClima? clima = null) => new(
        i.Id, i.CategoriaId, i.Nome, i.Tamanho, i.QtdDesejada, i.QtdAdquirida, i.Prioridade, i.Clima,
        i.PrecoUnitarioEstimado, i.ValorPago, i.Origem, i.LojaLink, i.Observacoes, i.Status,
        i.ValorEstimado, clima?.ForaDaEstacao(i) == true,
        // ?v= muda a cada foto nova, evitando cache antigo no navegador.
        i.FotoArquivo is null ? null : $"/api/itens/{i.Id}/foto?v={Path.GetFileNameWithoutExtension(i.FotoArquivo)}",
        i.AtualizadoEm);
}

public record SalvarItemRequest(
    int CategoriaId, string Nome, string? Tamanho, int QtdDesejada, int QtdAdquirida,
    Prioridade Prioridade, decimal? PrecoUnitarioEstimado, decimal? ValorPago, OrigemItem? Origem,
    string? LojaLink, string? Observacoes, Clima Clima = Clima.Todos);

/// <summary>RF25: Valor é o total pago pela compra (todas as unidades), não o unitário.</summary>
public record RegistrarCompraRequest(int Quantidade, OrigemItem Origem, decimal? Valor);

public record PainelDto(ResumoPainel Resumo, PerfilClima? Clima, IReadOnlyList<ItemDto> PendentesAltaPrioridade);
