using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Enxoval.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class TemaVisual : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Tema",
                table: "Enxovais",
                type: "TEXT",
                maxLength: 20,
                nullable: false,
                defaultValue: "Oliveira");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Tema",
                table: "Enxovais");
        }
    }
}
