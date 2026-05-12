using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobMagnet.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCreatedByColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT name FROM sys.indexes WHERE name = N'IX_User_RegistrationStatus' AND object_id = OBJECT_ID(N'Users'))
                BEGIN
                    DROP INDEX [IX_User_RegistrationStatus] ON [Users];
                END
            ");

            // Columns already removed from db.

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
                name: "FK_JobApplications_JobSeekers_JobSeekerId",
                table: "JobApplications",
                column: "JobSeekerId",
                principalTable: "JobSeekers",
                principalColumn: "JobSeekerId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UserSkills_Skills_SkillId1",
                table: "UserSkills",
                column: "SkillId1",
                principalTable: "Skills",
                principalColumn: "SkillId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_JobApplications_JobSeekers_JobSeekerId",
                table: "JobApplications");

            migrationBuilder.DropForeignKey(
                name: "FK_UserSkills_Skills_SkillId1",
                table: "UserSkills");

            migrationBuilder.DropIndex(
                name: "IX_UserSkills_SkillId1",
                table: "UserSkills");

            migrationBuilder.DropColumn(
                name: "SkillId1",
                table: "UserSkills");

            migrationBuilder.AddColumn<string>(
                name: "RegistrationStatus",
                table: "Users",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "PendingStep2");

            migrationBuilder.AddColumn<bool>(
                name: "IsAdmin",
                table: "Users",
                type: "bit",
                nullable: false,
                computedColumnSql: "CAST(CASE WHEN [UserType] = N'Admin' THEN 1 ELSE 0 END AS BIT)",
                stored: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsClient",
                table: "Users",
                type: "bit",
                nullable: false,
                computedColumnSql: "CAST(CASE WHEN [UserType] = N'Client' THEN 1 ELSE 0 END AS BIT)",
                stored: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsEmployer",
                table: "Users",
                type: "bit",
                nullable: false,
                computedColumnSql: "CAST(CASE WHEN [UserType] = N'Employer' THEN 1 ELSE 0 END AS BIT)",
                stored: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsFreelancer",
                table: "Users",
                type: "bit",
                nullable: false,
                computedColumnSql: "CAST(CASE WHEN [UserType] = N'Freelancer' THEN 1 ELSE 0 END AS BIT)",
                stored: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsJobSeeker",
                table: "Users",
                type: "bit",
                nullable: false,
                computedColumnSql: "CAST(CASE WHEN [UserType] = N'JobSeeker' THEN 1 ELSE 0 END AS BIT)",
                stored: true);

            migrationBuilder.CreateIndex(
                name: "IX_User_RegistrationStatus",
                table: "Users",
                column: "RegistrationStatus");
        }
    }
}
