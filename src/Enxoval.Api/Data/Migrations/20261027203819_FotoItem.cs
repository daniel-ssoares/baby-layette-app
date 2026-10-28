using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Enxoval.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class FotoItem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FotoArquivo",
                table: "Itens",
                type: "TEXT",
                maxLength: 64,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FotoArquivo",
                table: "Itens");
        }
    }
}
