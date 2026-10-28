using Enxoval.Api.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Enxoval.Api.Data.Migrations
{
    /// <summary>
    /// Migration só de dados: troca os preços estimados da lista-padrão para a faixa econômica.
    /// Itens cujo preço já foi editado pelo usuário não são alterados.
    /// </summary>
    [DbContext(typeof(AppDbContext))]
    [Migration("20261026210000_PrecosFaixaEconomica")]
    public partial class PrecosFaixaEconomica : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            Atualizar(migrationBuilder, "Berço com certificação Inmetro", "Único", 900, 550);
            Atualizar(migrationBuilder, "Colchão de berço certificado Inmetro (firme)", "Único", 300, 200);
            Atualizar(migrationBuilder, "Protetor de colchão impermeável", "Único", 60, 40);
            Atualizar(migrationBuilder, "Lençol de berço com elástico", "Único", 50, 35);
            Atualizar(migrationBuilder, "Manta leve (algodão/soft)", "Único", 60, 40);
            Atualizar(migrationBuilder, "Manta/cobertor mais quente", "Único", 90, 60);
            Atualizar(migrationBuilder, "Cueiro", "Único", 30, 20);
            Atualizar(migrationBuilder, "Cômoda com trocador", "Único", 900, 550);
            Atualizar(migrationBuilder, "Poltrona de amamentação", "Único", 1200, 600);
            Atualizar(migrationBuilder, "Luz noturna / abajur", "Único", 80, 50);
            Atualizar(migrationBuilder, "Babá eletrônica", "Único", 350, 200);
            Atualizar(migrationBuilder, "Cesto para roupa suja", "Único", 60, 40);
            Atualizar(migrationBuilder, "Mosquiteiro para berço", "Único", 70, 40);
            Atualizar(migrationBuilder, "Body manga longa", "RN", 30, 20);
            Atualizar(migrationBuilder, "Body manga longa", "P", 32, 22);
            Atualizar(migrationBuilder, "Body manga curta (para usar por baixo)", "RN", 25, 15);
            Atualizar(migrationBuilder, "Body manga curta (para usar por baixo)", "P", 27, 17);
            Atualizar(migrationBuilder, "Macacão com pezinho", "RN", 50, 35);
            Atualizar(migrationBuilder, "Macacão com pezinho", "P", 55, 38);
            Atualizar(migrationBuilder, "Mijão/culote com pé", "RN", 25, 15);
            Atualizar(migrationBuilder, "Mijão/culote com pé", "P", 27, 17);
            Atualizar(migrationBuilder, "Casaquinho (tricô ou plush)", "P", 70, 45);
            Atualizar(migrationBuilder, "Meia", "Único", 12, 8);
            Atualizar(migrationBuilder, "Touca", "Único", 25, 15);
            Atualizar(migrationBuilder, "Luva", "Único", 15, 10);
            Atualizar(migrationBuilder, "Saída de maternidade", "RN", 150, 90);
            Atualizar(migrationBuilder, "Body manga longa", "M", 35, 24);
            Atualizar(migrationBuilder, "Macacão com pezinho", "M", 60, 40);
            Atualizar(migrationBuilder, "Vestidinho com body", "P", 70, 45);
            Atualizar(migrationBuilder, "Faixa/laço de cabelo macio", "Único", 15, 10);
            Atualizar(migrationBuilder, "Sapatinho de tecido", "Único", 35, 20);
            Atualizar(migrationBuilder, "Banheira com suporte", "Único", 250, 150);
            Atualizar(migrationBuilder, "Toalha com capuz", "Único", 60, 35);
            Atualizar(migrationBuilder, "Termômetro de banho", "Único", 35, 25);
            Atualizar(migrationBuilder, "Saboneteira/organizador de banho", "Único", 40, 25);
            Atualizar(migrationBuilder, "Fralda descartável (pacote)", "RN", 55, 45);
            Atualizar(migrationBuilder, "Fralda descartável (pacote)", "P", 60, 50);
            Atualizar(migrationBuilder, "Fralda descartável (pacote)", "M", 65, 55);
            Atualizar(migrationBuilder, "Fralda de pano", "Único", 8, 6);
            Atualizar(migrationBuilder, "Lenço umedecido (pacote)", "Único", 15, 12);
            Atualizar(migrationBuilder, "Sabonete líquido infantil", "Único", 30, 22);
            Atualizar(migrationBuilder, "Shampoo infantil", "Único", 30, 22);
            Atualizar(migrationBuilder, "Pomada preventiva de assadura", "Único", 35, 25);
            Atualizar(migrationBuilder, "Hidratante infantil", "Único", 35, 25);
            Atualizar(migrationBuilder, "Escova de cabelo cerdas macias", "Único", 30, 20);
            Atualizar(migrationBuilder, "Cortador/tesoura de unha infantil", "Único", 25, 18);
            Atualizar(migrationBuilder, "Lixeira com tampa para fraldas", "Único", 80, 50);
            Atualizar(migrationBuilder, "Termômetro clínico digital", "Único", 40, 35);
            Atualizar(migrationBuilder, "Aspirador nasal", "Único", 40, 30);
            Atualizar(migrationBuilder, "Soro fisiológico 0,9% (flaconetes)", "Único", 20, 15);
            Atualizar(migrationBuilder, "Álcool 70% (coto umbilical)", "Único", 15, 10);
            Atualizar(migrationBuilder, "Seringa dosadora / conta-gotas", "Único", 8, 5);
            Atualizar(migrationBuilder, "Antitérmico infantil", "Único", 25, 20);
            Atualizar(migrationBuilder, "Caixa organizadora para farmacinha", "Único", 40, 25);
            Atualizar(migrationBuilder, "Sutiã de amamentação", "Único", 60, 40);
            Atualizar(migrationBuilder, "Pomada de lanolina para mamilos", "Único", 50, 40);
            Atualizar(migrationBuilder, "Almofada de amamentação", "Único", 150, 90);
            Atualizar(migrationBuilder, "Bomba tira-leite", "Único", 250, 120);
            Atualizar(migrationBuilder, "Saquinho para armazenar leite materno (caixa)", "Único", 50, 35);
            Atualizar(migrationBuilder, "Concha protetora de seios (par)", "Único", 60, 40);
            Atualizar(migrationBuilder, "Mamadeira", "Único", 60, 35);
            Atualizar(migrationBuilder, "Babador / paninho de boca", "Único", 12, 8);
            Atualizar(migrationBuilder, "Bebê conforto (cadeirinha grupo 0+)", "Único", 800, 450);
            Atualizar(migrationBuilder, "Carrinho de bebê", "Único", 1500, 800);
            Atualizar(migrationBuilder, "Bolsa de maternidade / fraldas", "Único", 200, 120);
            Atualizar(migrationBuilder, "Trocador portátil", "Único", 60, 40);
            Atualizar(migrationBuilder, "Base Isofix para bebê conforto", "Único", 500, 350);
            Atualizar(migrationBuilder, "Canguru ergonômico / sling", "Único", 300, 150);
            Atualizar(migrationBuilder, "Capa de chuva para carrinho", "Único", 70, 40);
            Atualizar(migrationBuilder, "Camisola/pijama com abertura frontal", "Único", 90, 60);
            Atualizar(migrationBuilder, "Calcinha pós-parto (cintura alta)", "Único", 25, 15);
            Atualizar(migrationBuilder, "Absorvente pós-parto noturno (pacote)", "Único", 25, 20);
            Atualizar(migrationBuilder, "Roupão", "Único", 120, 80);
            Atualizar(migrationBuilder, "Cinta pós-parto", "Único", 120, 80);
            Atualizar(migrationBuilder, "Naninha", "Único", 50, 30);
            Atualizar(migrationBuilder, "Móbile", "Único", 120, 70);
            Atualizar(migrationBuilder, "Chupeta (opcional)", "Único", 30, 20);
        }

        protected override void Down(MigrationBuilder migrationBuilder) { }

        private static void Atualizar(MigrationBuilder mb, string nome, string tamanho, decimal antigo, decimal novo) =>
            mb.Sql($"UPDATE Itens SET PrecoUnitarioEstimado = '{novo}.0' " +
                   $"WHERE Nome = '{nome.Replace("'", "''")}' AND Tamanho = '{tamanho}' " +
                   $"AND CAST(PrecoUnitarioEstimado AS REAL) = {antigo};");
    }
}