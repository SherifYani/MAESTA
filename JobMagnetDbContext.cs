using Microsoft.EntityFrameworkCore;
using JobMagnet.Domain.Entities;
using JobMagnet.Infrastructure.Data.Configuration;

namespace JobMagnet.Infrastructure.Data
{
    public class JobMagnetDbContext : DbContext
    {
        public JobMagnetDbContext(DbContextOptions<JobMagnetDbContext> options) : base(options)
        {
        }

        // ===== User Management =====
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<Admin> Admins { get; set; }
        public DbSet<Freelancer> Freelancers { get; set; }
        public DbSet<Employer> Employers { get; set; }
        public DbSet<JobSeeker> JobSeekers { get; set; }
        public DbSet<Client> Clients { get; set; }
        
        // ===== Jobs =====
        public DbSet<Job> Jobs { get; set; }
        public DbSet<JobApplication> JobApplications { get; set; }
        public DbSet<JobCategory> JobCategories { get; set; }
        public DbSet<JobTag> JobTags { get; set; }
        
        // ===== Projects =====
        public DbSet<Project> Projects { get; set; }
        public DbSet<ProjectCategory> ProjectCategories { get; set; }
        public DbSet<ProjectTag> ProjectTags { get; set; }
        public DbSet<ProjectMilestone> ProjectMilestones { get; set; }
        public DbSet<ProjectDelivery> ProjectDeliveries { get; set; }
        public DbSet<Proposal> Proposals { get; set; }
        
        // ===== Company =====
        public DbSet<Company> Companies { get; set; }
        
        // ===== Communication =====
        public DbSet<Message> Messages { get; set; }
        public DbSet<Chat> Chats { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        
        // ===== Community =====
        public DbSet<CommunityPost> CommunityPosts { get; set; }
        public DbSet<CommunityReply> CommunityReplies { get; set; }
        
        // ===== Reviews & Ratings =====
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Rating> Ratings { get; set; }
        
        // ===== Payments & Finance =====
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<EscrowTransaction> EscrowTransactions { get; set; }
        public DbSet<UserWallet> UserWallets { get; set; }
        public DbSet<WithdrawalRequest> WithdrawalRequests { get; set; }
        public DbSet<RefundRequest> RefundRequests { get; set; }
        
        // ===== User Profile Enhancements =====
        public DbSet<UserSkill> UserSkills { get; set; }
        public DbSet<UserEducation> UserEducations { get; set; }
        public DbSet<UserWorkExperience> UserWorkExperiences { get; set; }
        public DbSet<UserCertification> UserCertifications { get; set; }
        public DbSet<UserDocument> UserDocuments { get; set; }
        public DbSet<UserSettings> UserSettings { get; set; }
        public DbSet<FreelancerPortfolio> FreelancerPortfolios { get; set; }
        public DbSet<FreelancerTag> FreelancerTags { get; set; }
        public DbSet<FreelancerLevel> FreelancerLevels { get; set; }
        
        // ===== Categories, Tags & Skills =====
        public DbSet<Category> Categories { get; set; }
        public DbSet<Tag> Tags { get; set; }
        public DbSet<Skill> Skills { get; set; }
        
        // ===== Favorites & Saved Items =====
        public DbSet<Favorite> Favorites { get; set; }
        public DbSet<SavedJob> SavedJobs { get; set; }
        public DbSet<SavedFreelancer> SavedFreelancers { get; set; }
        
        // ===== Security & Authentication =====
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<BlockedUser> BlockedUsers { get; set; }
        public DbSet<IpBlacklist> IpBlacklists { get; set; }
        
        // ===== Support & Help =====
        public DbSet<SupportTicket> SupportTickets { get; set; }
        public DbSet<TicketMessage> TicketMessages { get; set; }
        public DbSet<Faq> Faqs { get; set; }
        
        // ===== Moderation =====
        public DbSet<Report> Reports { get; set; }
        public DbSet<Dispute> Disputes { get; set; }
        public DbSet<Contract> Contracts { get; set; }
        
        // ===== Logs & Analytics =====
        public DbSet<ActivityLog> ActivityLogs { get; set; }
        public DbSet<ErrorLog> ErrorLogs { get; set; }
        public DbSet<SystemLog> SystemLogs { get; set; }
        public DbSet<SearchHistory> SearchHistories { get; set; }
        
        // ===== Settings & Administration =====
        public DbSet<PlatformSetting> PlatformSettings { get; set; }
        public DbSet<Announcement> Announcements { get; set; }
        public DbSet<EmailTemplate> EmailTemplates { get; set; }
        public DbSet<SmsTemplate> SmsTemplates { get; set; }
        public DbSet<PromoCode> PromoCodes { get; set; }
        public DbSet<CommissionRate> CommissionRates { get; set; }
        
        // ===== Gamification =====
        public DbSet<Badge> Badges { get; set; }
        public DbSet<UserBadge> UserBadges { get; set; }
        
        // ===== Subscriptions & Referrals =====
        public DbSet<Subscription> Subscriptions { get; set; }
        public DbSet<Referral> Referrals { get; set; }
        
        // ===== Time Tracking =====
        public DbSet<Timesheet> Timesheets { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ===== استدعاء تكوين الفهارس (Indexes Configuration) =====
            DatabaseIndexesConfiguration.ConfigureIndexes(modelBuilder);

            // ===== تكوينات إضافية =====
            ConfigureUserEntity(modelBuilder);
            ConfigureJobEntity(modelBuilder);
            ConfigureProjectEntity(modelBuilder);
            ConfigureMessageEntity(modelBuilder);
            ConfigurePaymentEntity(modelBuilder);
        }

        private void ConfigureUserEntity(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>(entity =>
            {
                // تكوين الحقول المحسوبة (Computed Columns)
                entity.Property(u => u.IsFreelancer)
                    .HasComputedColumnSql("CAST(CASE WHEN EXISTS(SELECT 1 FROM Freelancers WHERE UserId = Users.UserId) THEN 1 ELSE 0 END AS BIT)", stored: true);

                entity.Property(u => u.IsJobSeeker)
                    .HasComputedColumnSql("CAST(CASE WHEN EXISTS(SELECT 1 FROM JobSeekers WHERE UserId = Users.UserId) THEN 1 ELSE 0 END AS BIT)", stored: true);

                entity.Property(u => u.IsEmployer)
                    .HasComputedColumnSql("CAST(CASE WHEN EXISTS(SELECT 1 FROM Employers WHERE UserId = Users.UserId) THEN 1 ELSE 0 END AS BIT)", stored: true);

                entity.Property(u => u.IsClient)
                    .HasComputedColumnSql("CAST(CASE WHEN EXISTS(SELECT 1 FROM Clients WHERE UserId = Users.UserId) THEN 1 ELSE 0 END AS BIT)", stored: true);

                entity.Property(u => u.IsAdmin)
                    .HasComputedColumnSql("CAST(CASE WHEN EXISTS(SELECT 1 FROM Admins WHERE UserId = Users.UserId) THEN 1 ELSE 0 END AS BIT)", stored: true);

                // القيم الافتراضية
                entity.Property(u => u.IsActive).HasDefaultValue(true);
                entity.Property(u => u.IsDeleted).HasDefaultValue(false);
                entity.Property(u => u.IsEmailVerified).HasDefaultValue(false);
                entity.Property(u => u.IsPhoneVerified).HasDefaultValue(false);
                entity.Property(u => u.TwoFactorEnabled).HasDefaultValue(false);
                entity.Property(u => u.FailedLoginAttempts).HasDefaultValue(0);
                entity.Property(u => u.CreatedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");
            });
        }

        private void ConfigureJobEntity(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Job>(entity =>
            {
                // القيم الافتراضية
                entity.Property(j => j.IsActive).HasDefaultValue(true);
                entity.Property(j => j.IsDeleted).HasDefaultValue(false);
                entity.Property(j => j.CreatedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");

                // قيود التحقق
                entity.HasCheckConstraint("CK_Job_Salary_Range", "[MaxSalary] IS NULL OR [MinSalary] IS NULL OR [MaxSalary] >= [MinSalary]");
            });
        }

        private void ConfigureProjectEntity(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Project>(entity =>
            {
                // القيم الافتراضية
                entity.Property(p => p.IsDeleted).HasDefaultValue(false);
                entity.Property(p => p.CreatedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");
                entity.Property(p => p.Status).HasDefaultValue("Draft");

                // قيود التحقق
                entity.HasCheckConstraint("CK_Project_Budget_Positive", "[Budget] > 0");
            });
        }

        private void ConfigureMessageEntity(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Message>(entity =>
            {
                // القيم الافتراضية
                entity.Property(m => m.IsRead).HasDefaultValue(false);
                entity.Property(m => m.IsDeleted).HasDefaultValue(false);
                entity.Property(m => m.SentAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");
                entity.Property(m => m.CreatedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");
            });

            modelBuilder.Entity<Notification>(entity =>
            {
                entity.Property(n => n.IsRead).HasDefaultValue(false);
                entity.Property(n => n.IsDeleted).HasDefaultValue(false);
                entity.Property(n => n.CreatedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");
            });
        }

        private void ConfigurePaymentEntity(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Payment>(entity =>
            {
                // القيم الافتراضية
                entity.Property(p => p.PaymentDate).HasDefaultValueSql("SYSDATETIMEOFFSET()");
                entity.Property(p => p.Status).HasDefaultValue("Pending");

                // قيود التحقق
                entity.HasCheckConstraint("CK_Payment_Amount_Positive", "[Amount] > 0");
            });

            modelBuilder.Entity<Transaction>(entity =>
            {
                entity.Property(t => t.TransactionDate).HasDefaultValueSql("SYSDATETIMEOFFSET()");
                entity.Property(t => t.Status).HasDefaultValue("Pending");

                entity.HasCheckConstraint("CK_Transaction_Amount_Positive", "[Amount] > 0");
            });
        }
    }
}
