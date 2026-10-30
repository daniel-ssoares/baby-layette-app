using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Enxoval.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class ClimaELocalizacao : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Clima",
                table: "Itens",
                type: "TEXT",
                maxLength: 10,
                nullable: false,
                defaultValue: "Todos");

            migrationBuilder.AddColumn<string>(
                name: "Cidade",
                table: "Enxovais",
                type: "TEXT",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "Enxovais",
                type: "REAL",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "Enxovais",
                type: "REAL",
                nullable: true);

            // Dados: alinha bancos existentes com a ListaPadrao (o seed só roda em banco vazio).

            foreach (var nome in new[] { "Manta/cobertor mais quente", "Casaquinho (tricô ou plush)", "Luva" })
                migrationBuilder.Sql($"UPDATE Itens SET Clima = 'Frio' WHERE Nome = '{nome}';");
            migrationBuilder.Sql("UPDATE Itens SET Clima = 'Calor' WHERE Nome = 'Mosquiteiro para berço';");
            migrationBuilder.Sql("UPDATE Itens SET Observacoes = NULL WHERE Nome = 'Manta/cobertor mais quente' " +
                                 "AND Observacoes = 'Nasce no outono; os primeiros meses são frios.';");
            migrationBuilder.Sql("UPDATE Itens SET Observacoes = 'Escolher o tecido conforme o clima previsto.' " +
                                 "WHERE Nome = 'Saída de maternidade' AND Observacoes = 'Para outono: macacão + casaquinho + manta.';");

            Inserir(migrationBuilder, "Quarto", "Ventilador silencioso (sem vento direto no bebê)", "Único", 1, "Media", 180, "Calor");
            Inserir(migrationBuilder, "Roupas", "Macacão plush/soft", "P", 3, "Alta", 45, "Frio");
            Inserir(migrationBuilder, "Roupas", "Saco de dormir / cobertor de vestir", "P", 1, "Media", 90, "Frio",
                "Alternativa segura ao cobertor solto no berço.");
            Inserir(migrationBuilder, "Roupas", "Body regata ou manga curta", "P", 4, "Alta", 18, "Calor");
            Inserir(migrationBuilder, "Roupas", "Macaquinho curto de algodão", "P", 3, "Media", 35, "Calor");
            Inserir(migrationBuilder, "Passeio", "Mosquiteiro para carrinho", "Único", 1, "Media", 40, "Calor");
        }

        /// <summary>Insere o item na categoria de mesmo nome de cada enxoval, se ainda não existir.</summary>
        private static void Inserir(MigrationBuilder mb, string categoria, string nome, string tamanho, int qtd,
            string prioridade, int preco, string clima, string obs = null) =>
            mb.Sql(
                "INSERT INTO Itens (EnxovalId, CategoriaId, Nome, Tamanho, QtdDesejada, QtdAdquirida, Prioridade, Clima, " +
                "PrecoUnitarioEstimado, Observacoes, CriadoEm, AtualizadoEm) " +
                $"SELECT c.EnxovalId, c.Id, '{nome}', '{tamanho}', {qtd}, 0, '{prioridade}', '{clima}', '{preco}.0', " +
                $"{(obs is null ? "NULL" : $"'{obs}'")}, datetime('now'), datetime('now') FROM Categorias c " +
                $"WHERE c.Nome = '{categoria}' AND NOT EXISTS " +
                $"(SELECT 1 FROM Itens i WHERE i.EnxovalId = c.EnxovalId AND i.Nome = '{nome}');");

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Clima",
                table: "Itens");

            migrationBuilder.DropColumn(
                name: "Cidade",
                table: "Enxovais");

            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "Enxovais");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "Enxovais");
        }
    }
}
