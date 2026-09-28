using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobMagnet.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class FixPendingChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Column already exists, snapshot was just out of sync
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
