using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Enxoval.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class Inicial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Enxovais",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    NomeBebe = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    Sexo = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    DataPrevistaParto = table.Column<DateOnly>(type: "TEXT", nullable: true),
                    Orcamento = table.Column<decimal>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Enxovais", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Categorias",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    EnxovalId = table.Column<int>(type: "INTEGER", nullable: false),
                    Nome = table.Column<string>(type: "TEXT", maxLength: 60, nullable: false),
                    Ordem = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categorias", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Categorias_Enxovais_EnxovalId",
                        column: x => x.EnxovalId,
                        principalTable: "Enxovais",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Itens",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    EnxovalId = table.Column<int>(type: "INTEGER", nullable: false),
                    CategoriaId = table.Column<int>(type: "INTEGER", nullable: false),
                    Nome = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    Tamanho = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true),
                    QtdDesejada = table.Column<int>(type: "INTEGER", nullable: false),
                    QtdAdquirida = table.Column<int>(type: "INTEGER", nullable: false),
                    Prioridade = table.Column<string>(type: "TEXT", maxLength: 10, nullable: false),
                    PrecoUnitarioEstimado = table.Column<decimal>(type: "TEXT", nullable: true),
                    ValorPago = table.Column<decimal>(type: "TEXT", nullable: true),
                    Origem = table.Column<string>(type: "TEXT", maxLength: 10, nullable: true),
                    LojaLink = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    Observacoes = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "TEXT", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Itens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Itens_Categorias_CategoriaId",
                        column: x => x.CategoriaId,
                        principalTable: "Categorias",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Itens_Enxovais_EnxovalId",
                        column: x => x.EnxovalId,
                        principalTable: "Enxovais",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Categorias_EnxovalId_Nome",
                table: "Categorias",
                columns: new[] { "EnxovalId", "Nome" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Itens_CategoriaId",
                table: "Itens",
                column: "CategoriaId");

            migrationBuilder.CreateIndex(
                name: "IX_Itens_EnxovalId",
                table: "Itens",
                column: "EnxovalId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Itens");

            migrationBuilder.DropTable(
                name: "Categorias");

            migrationBuilder.DropTable(
                name: "Enxovais");
        }
    }
}
