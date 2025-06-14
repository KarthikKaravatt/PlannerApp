using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class update : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_TaskList",
                table: "TaskList");

            migrationBuilder.RenameTable(
                name: "TaskList",
                newName: "Tasks");

            migrationBuilder.AddColumn<Guid>(
                name: "TaskListId",
                table: "Tasks",
                type: "TEXT",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddPrimaryKey(
                name: "PK_Tasks",
                table: "Tasks",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "TaskLists",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    OrderIndex = table.Column<uint>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaskLists", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_TaskListId",
                table: "Tasks",
                column: "TaskListId");

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_TaskLists_TaskListId",
                table: "Tasks",
                column: "TaskListId",
                principalTable: "TaskLists",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_TaskLists_TaskListId",
                table: "Tasks");

            migrationBuilder.DropTable(
                name: "TaskLists");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Tasks",
                table: "Tasks");

            migrationBuilder.DropIndex(
                name: "IX_Tasks_TaskListId",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "TaskListId",
                table: "Tasks");

            migrationBuilder.RenameTable(
                name: "Tasks",
                newName: "TaskList");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TaskList",
                table: "TaskList",
                column: "Id");
        }
    }
}
