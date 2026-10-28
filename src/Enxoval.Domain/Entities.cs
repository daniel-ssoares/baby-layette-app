namespace Enxoval.Domain;

public class EnxovalBebe
{
    public int Id { get; set; }
    /// <summary>Conta (Identity) dona do enxoval. Nulo só em dados criados antes do login existir.</summary>
    public string? UsuarioId { get; set; }
    /// <summary>T2: a tela de boas-vindas (nome da criança) já foi respondida ou pulada.</summary>
    public bool BoasVindasConcluidas { get; set; }
    public string? NomeBebe { get; set; }
    public SexoBebe Sexo { get; set; }
    public DateOnly? DataPrevistaParto { get; set; }
    public decimal? Orcamento { get; set; }

    /// <summary>Local do nascimento, usado para estimar o clima dos primeiros meses.</summary>
    public string? Cidade { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    public List<Categoria> Categorias { get; set; } = [];
    public List<Item> Itens { get; set; } = [];
}

public class Categoria
{
    public int Id { get; set; }
    public int EnxovalId { get; set; }
    public required string Nome { get; set; }
    public int Ordem { get; set; }

    public List<Item> Itens { get; set; } = [];
}

public class Item
{
    public int Id { get; set; }
    public int EnxovalId { get; set; }
    public int CategoriaId { get; set; }
    public Categoria? Categoria { get; set; }

    public required string Nome { get; set; }
    public string? Tamanho { get; set; }
    public int QtdDesejada { get; set; } = 1;
    public int QtdAdquirida { get; set; }
    public Prioridade Prioridade { get; set; } = Prioridade.Media;
    public Clima Clima { get; set; } = Clima.Todos;
    public decimal? PrecoUnitarioEstimado { get; set; }
    public decimal? ValorPago { get; set; }
    public OrigemItem? Origem { get; set; }
    public string? LojaLink { get; set; }
    public string? Observacoes { get; set; }
    /// <summary>T3: nome do arquivo da foto na pasta de fotos (ex.: "3f2a….jpg").</summary>
    public string? FotoArquivo { get; set; }
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public DateTime AtualizadoEm { get; set; } = DateTime.UtcNow;

    /// <summary>RF11: status derivado das quantidades.</summary>
    public StatusItem Status => QtdAdquirida <= 0 ? StatusItem.Pendente
        : QtdAdquirida < QtdDesejada ? StatusItem.Parcial
        : StatusItem.Concluido;

    /// <summary>RN03.</summary>
    public decimal ValorEstimado => (PrecoUnitarioEstimado ?? 0) * QtdDesejada;

    /// <summary>RN04: só itens comprados contam como gasto.</summary>
    public decimal ValorGasto => Origem == OrigemItem.Comprado ? ValorPago ?? 0 : 0;

    /// <summary>
    /// RF25: soma unidades compradas ou ganhas. Compra soma o valor ao já pago e marca o item como comprado
    /// (unidades ganhas antes continuam sem valor). Ganho não altera o valor nem uma origem já definida.
    /// </summary>
    public void RegistrarCompra(int quantidade, OrigemItem origem, decimal? valor)
    {
        if (quantidade < 1) throw new ArgumentOutOfRangeException(nameof(quantidade));
        if (valor < 0) throw new ArgumentOutOfRangeException(nameof(valor));
        QtdAdquirida += quantidade;
        if (origem == OrigemItem.Comprado)
        {
            ValorPago = (Origem == OrigemItem.Comprado ? ValorPago ?? 0 : 0) + (valor ?? 0);
            Origem = OrigemItem.Comprado;
        }
        else Origem ??= OrigemItem.Ganhado;
        AtualizadoEm = DateTime.UtcNow;
    }
}
