using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class Addcompletedtasksfield : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "TaskListId1",
                table: "Tasks",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_TaskListId1",
                table: "Tasks",
                column: "TaskListId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_TaskLists_TaskListId1",
                table: "Tasks",
                column: "TaskListId1",
                principalTable: "TaskLists",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_TaskLists_TaskListId1",
                table: "Tasks");

            migrationBuilder.DropIndex(
                name: "IX_Tasks_TaskListId1",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "TaskListId1",
                table: "Tasks");
        }
    }
}
