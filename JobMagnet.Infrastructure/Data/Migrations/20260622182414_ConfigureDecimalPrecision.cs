using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobMagnet.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class ConfigureDecimalPrecision : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserSkills_Skills_SkillId1",
                table: "UserSkills");

            migrationBuilder.DropIndex(
                name: "IX_UserSkills_SkillId1",
                table: "UserSkills");

            migrationBuilder.DropColumn(
                name: "SkillId1",
                table: "UserSkills");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SkillId1",
                table: "UserSkills",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserSkills_SkillId1",
                table: "UserSkills",
                column: "SkillId1");

            migrationBuilder.AddForeignKey(
                name: "FK_UserSkills_Skills_SkillId1",
                table: "UserSkills",
                column: "SkillId1",
                principalTable: "Skills",
                principalColumn: "SkillId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
