using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddTagDefaults : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<float>(
                name: "Colour_L",
                table: "Tags",
                type: "REAL",
                nullable: false,
                defaultValue: 100f,
                oldClrType: typeof(float),
                oldType: "REAL");

            migrationBuilder.AlterColumn<float>(
                name: "Colour_H",
                table: "Tags",
                type: "REAL",
                nullable: false,
                defaultValue: 0f,
                oldClrType: typeof(float),
                oldType: "REAL");

            migrationBuilder.AlterColumn<float>(
                name: "Colour_C",
                table: "Tags",
                type: "REAL",
                nullable: false,
                defaultValue: 0f,
                oldClrType: typeof(float),
                oldType: "REAL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<float>(
                name: "Colour_L",
                table: "Tags",
                type: "REAL",
                nullable: false,
                oldClrType: typeof(float),
                oldType: "REAL",
                oldDefaultValue: 100f);

            migrationBuilder.AlterColumn<float>(
                name: "Colour_H",
                table: "Tags",
                type: "REAL",
                nullable: false,
                oldClrType: typeof(float),
                oldType: "REAL",
                oldDefaultValue: 0f);

            migrationBuilder.AlterColumn<float>(
                name: "Colour_C",
                table: "Tags",
                type: "REAL",
                nullable: false,
                oldClrType: typeof(float),
                oldType: "REAL",
                oldDefaultValue: 0f);
        }
    }
}
