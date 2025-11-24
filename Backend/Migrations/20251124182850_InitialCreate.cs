using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CollaborativeEditor.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RoomStates",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    YjsState = table.Column<byte[]>(type: "BLOB", nullable: false),
                    LastModified = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Metadata = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoomStates", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RoomStates_LastModified",
                table: "RoomStates",
                column: "LastModified");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RoomStates");
        }
    }
}
