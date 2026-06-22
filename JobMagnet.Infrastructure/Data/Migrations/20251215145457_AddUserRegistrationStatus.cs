using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobMagnet.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddUserRegistrationStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RegistrationStatus",
                table: "Users",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "PendingStep2");

            migrationBuilder.CreateIndex(
                name: "IX_User_RegistrationStatus",
                table: "Users",
                column: "RegistrationStatus");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_User_RegistrationStatus",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "RegistrationStatus",
                table: "Users");
        }
    }
}
