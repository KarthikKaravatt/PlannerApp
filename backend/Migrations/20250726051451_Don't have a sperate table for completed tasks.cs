using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class Donthaveasperatetableforcompletedtasks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_TaskLists_TaskListId1",
                table: "Tasks");

            migrationBuilder.DropIndex(
                name: "IX_Tasks_TaskListId1",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "Discriminator",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "TaskListId1",
                table: "Tasks");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Discriminator",
                table: "Tasks",
                type: "TEXT",
                maxLength: 21,
                nullable: false,
                defaultValue: "");

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
    }
}
