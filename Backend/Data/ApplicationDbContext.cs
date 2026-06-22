using Microsoft.EntityFrameworkCore;
using JobMagnet.Models;

namespace JobMagnet.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        // Add your DbSets here
        // Example: public DbSet<Job> Jobs { get; set; }
        // Example: public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Configure your entity relationships here
        }
    }
}
