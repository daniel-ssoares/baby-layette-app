using Enxoval.Domain;

namespace Enxoval.UnitTests;

public class ItemTests
{
    [Theory]
    [InlineData(4, 0, StatusItem.Pendente)]
    [InlineData(4, 2, StatusItem.Parcial)]
    [InlineData(4, 4, StatusItem.Concluido)]
    [InlineData(4, 6, StatusItem.Concluido)]
    public void Status_e_derivado_das_quantidades(int desejada, int adquirida, StatusItem esperado)
    {
        var item = new Item { Nome = "Body", QtdDesejada = desejada, QtdAdquirida = adquirida };
        Assert.Equal(esperado, item.Status);
    }

    [Fact]
    public void ValorEstimado_e_preco_vezes_quantidade_desejada()
    {
        var item = new Item { Nome = "Body", QtdDesejada = 3, PrecoUnitarioEstimado = 25.5m };
        Assert.Equal(76.5m, item.ValorEstimado);
    }

    [Theory]
    [InlineData(OrigemItem.Comprado, 100)]
    [InlineData(OrigemItem.Ganhado, 0)]
    public void Somente_itens_comprados_contam_como_gasto(OrigemItem origem, decimal esperado)
    {
        var item = new Item { Nome = "Carrinho", ValorPago = 100, Origem = origem };
        Assert.Equal(esperado, item.ValorGasto);
    }

    [Fact]
    public void RegistrarCompra_soma_quantidade_e_valor()
    {
        var item = new Item { Nome = "Body", QtdDesejada = 6, QtdAdquirida = 2, ValorPago = 40, Origem = OrigemItem.Comprado };
        item.RegistrarCompra(3, OrigemItem.Comprado, 75);
        Assert.Equal(5, item.QtdAdquirida);
        Assert.Equal(115, item.ValorGasto);
    }

    [Fact]
    public void RegistrarCompra_ganho_nao_soma_valor_nem_muda_origem_comprada()
    {
        var item = new Item { Nome = "Body", QtdDesejada = 6, QtdAdquirida = 2, ValorPago = 40, Origem = OrigemItem.Comprado };
        item.RegistrarCompra(2, OrigemItem.Ganhado, 999);
        Assert.Equal(4, item.QtdAdquirida);
        Assert.Equal(40, item.ValorGasto);
        Assert.Equal(OrigemItem.Comprado, item.Origem);
    }

    [Fact]
    public void RegistrarCompra_depois_de_ganho_passa_a_contar_so_o_valor_novo()
    {
        var item = new Item { Nome = "Manta", QtdDesejada = 3 };
        item.RegistrarCompra(1, OrigemItem.Ganhado, null);
        Assert.Equal(OrigemItem.Ganhado, item.Origem);
        item.RegistrarCompra(1, OrigemItem.Comprado, 50);
        Assert.Equal(OrigemItem.Comprado, item.Origem);
        Assert.Equal(50, item.ValorGasto);
        Assert.Equal(StatusItem.Parcial, item.Status);
    }

    [Theory]
    [InlineData(0, 10)]
    [InlineData(1, -1)]
    public void RegistrarCompra_rejeita_quantidade_ou_valor_invalidos(int qtd, decimal valor)
    {
        var item = new Item { Nome = "Body" };
        Assert.Throws<ArgumentOutOfRangeException>(() => item.RegistrarCompra(qtd, OrigemItem.Comprado, valor));
    }
}
