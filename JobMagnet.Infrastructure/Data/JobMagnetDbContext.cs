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
        public DbSet<UserOtp> UserOtps { get; set; }
        
        // ===== Jobs =====
        public DbSet<Job> Jobs { get; set; }
        public DbSet<JobApplication> JobApplications { get; set; }
        public DbSet<Interview> Interviews { get; set; }
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
        public DbSet<PaymentMethod> PaymentMethods { get; set; }
        public DbSet<BankAccount> BankAccounts { get; set; }
        
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
            ConfigureCompositeKeys(modelBuilder);
            ConfigureForeignKeys(modelBuilder);
            DisableCascadeDeletes(modelBuilder);
        }

        private void ConfigureUserEntity(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>(entity =>
            {
                // القيم الافتراضية
                entity.Property(u => u.IsActive).HasDefaultValue(true);
                entity.Property(u => u.IsDeleted).HasDefaultValue(false);
                entity.Property(u => u.IsEmailVerified).HasDefaultValue(false);
                entity.Property(u => u.IsPhoneVerified).HasDefaultValue(false);
                entity.Property(u => u.TwoFactorEnabled).HasDefaultValue(false);
                entity.Property(u => u.FailedLoginAttempts).HasDefaultValue(0);
                entity.Property(u => u.CreatedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");
            });
            
            modelBuilder.Entity<UserOtp>(entity =>
            {
                entity.Property(o => o.IsUsed).HasDefaultValue(false);
                entity.Property(o => o.CreatedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");
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

            modelBuilder.Entity<Interview>(entity =>
            {
                entity.Property(i => i.Status).HasDefaultValue("Scheduled");
                entity.Property(i => i.CreatedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");
                entity.Property(i => i.IsDeleted).HasDefaultValue(false);
            });
        }

        private void ConfigurePaymentEntity(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Payment>(entity =>
            {
                // القيم الافتراضية
                entity.Property(p => p.CreatedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");
                entity.Property(p => p.Status).HasDefaultValue("Pending");

                // قيود التحقق
                entity.HasCheckConstraint("CK_Payment_Amount_Positive", "[Amount] > 0");
            });

            modelBuilder.Entity<Transaction>(entity =>
            {
                entity.Property(t => t.CreatedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");
                entity.Property(t => t.Status).HasDefaultValue("Pending");

                entity.HasCheckConstraint("CK_Transaction_Amount_Positive", "[Amount] > 0");
            });
        }

        private void ConfigureCompositeKeys(ModelBuilder modelBuilder)
        {
            // UserRole: (UserId, RoleId)
            modelBuilder.Entity<UserRole>().HasKey(ur => new { ur.UserId, ur.RoleId });

            // SavedJob: (UserId, JobId)
            modelBuilder.Entity<SavedJob>().HasKey(sj => new { sj.UserId, sj.JobId });

            // SavedFreelancer: (UserId, FreelancerUserId)
            modelBuilder.Entity<SavedFreelancer>().HasKey(sf => new { sf.UserId, sf.FreelancerUserId });

            // Favorite: (UserId, EntityType, EntityId)
            modelBuilder.Entity<Favorite>().HasKey(f => new { f.UserId, f.EntityType, f.EntityId });

            modelBuilder.Entity<JobCategory>().HasKey(jc => new { jc.JobId, jc.CategoryId });
            modelBuilder.Entity<ProjectCategory>().HasKey(pc => new { pc.ProjectId, pc.CategoryId });
            modelBuilder.Entity<UserBadge>().HasKey(ub => new { ub.UserId, ub.BadgeId });

            // JobTag: (JobId, TagId)
            modelBuilder.Entity<JobTag>().HasKey(jt => new { jt.JobId, jt.TagId });

            // ProjectTag: (ProjectId, TagId)
            modelBuilder.Entity<ProjectTag>().HasKey(pt => new { pt.ProjectId, pt.TagId });

            // FreelancerTag: (FreelancerId, TagId)
            modelBuilder.Entity<FreelancerTag>().HasKey(ft => new { ft.FreelancerId, ft.TagId });

            // UserSkill: (UserId, SkillId)
            modelBuilder.Entity<UserSkill>().HasKey(us => new { us.UserId, us.SkillId });
        }

        private void ConfigureForeignKeys(ModelBuilder modelBuilder)
        {
            // UserRole ForeignKeys
            modelBuilder.Entity<UserRole>()
                .HasOne(ur => ur.User)
                .WithMany()
                .HasForeignKey(ur => ur.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // SavedJob ForeignKeys
            modelBuilder.Entity<SavedJob>()
                .HasOne(sj => sj.User)
                .WithMany()
                .HasForeignKey(sj => sj.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SavedJob>()
                .HasOne(sj => sj.Job)
                .WithMany()
                .HasForeignKey(sj => sj.JobId)
                .OnDelete(DeleteBehavior.Cascade);

            // SavedFreelancer ForeignKeys
            modelBuilder.Entity<SavedFreelancer>()
                .HasOne(sf => sf.SavedByUser)
                .WithMany()
                .HasForeignKey(sf => sf.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SavedFreelancer>()
                .HasOne(sf => sf.FreelancerUser)
                .WithMany()
                .HasForeignKey(sf => sf.FreelancerUserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Favorite ForeignKeys
            modelBuilder.Entity<Favorite>()
                .HasOne(f => f.User)
                .WithMany()
                .HasForeignKey(f => f.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // JobTag ForeignKeys
            modelBuilder.Entity<JobTag>()
                .HasOne(jt => jt.Job)
                .WithMany()
                .HasForeignKey(jt => jt.JobId)
                .OnDelete(DeleteBehavior.Cascade);

            // ProjectTag ForeignKeys
            modelBuilder.Entity<ProjectTag>()
                .HasOne(pt => pt.Project)
                .WithMany()
                .HasForeignKey(pt => pt.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            // FreelancerTag ForeignKeys
            modelBuilder.Entity<FreelancerTag>()
                .HasOne(ft => ft.Freelancer)
                .WithMany()
                .HasForeignKey(ft => ft.FreelancerId)
                .OnDelete(DeleteBehavior.Cascade);

            // UserSkill ForeignKeys
            modelBuilder.Entity<UserSkill>()
                .HasOne(us => us.User)
                .WithMany()
                .HasForeignKey(us => us.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserSkill>()
                .HasOne<Skill>()
                .WithMany()
                .HasForeignKey(us => us.SkillId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<JobTag>()
                .HasOne<Tag>()
                .WithMany()
                .HasForeignKey(jt => jt.TagId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProjectTag>()
                .HasOne<Tag>()
                .WithMany()
                .HasForeignKey(pt => pt.TagId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<FreelancerTag>()
                .HasOne<Tag>()
                .WithMany()
                .HasForeignKey(ft => ft.TagId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserRole>()
                .HasOne<Role>()
                .WithMany()
                .HasForeignKey(ur => ur.RoleId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<BlockedUser>()
                .HasOne(b => b.BlockerUser)
                .WithMany()
                .HasForeignKey(b => b.BlockedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<BlockedUser>()
                .HasOne(b => b.BlockedUserEntity)
                .WithMany()
                .HasForeignKey(b => b.BlockedUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<JobCategory>()
                .HasOne(jc => jc.Job)
                .WithMany()
                .HasForeignKey(jc => jc.JobId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<JobCategory>()
                .HasOne<Category>()
                .WithMany()
                .HasForeignKey(jc => jc.CategoryId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProjectCategory>()
                .HasOne(pc => pc.Project)
                .WithMany()
                .HasForeignKey(pc => pc.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProjectCategory>()
                .HasOne<Category>()
                .WithMany()
                .HasForeignKey(pc => pc.CategoryId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserBadge>()
                .HasOne(ub => ub.User)
                .WithMany()
                .HasForeignKey(ub => ub.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserBadge>()
                .HasOne<Badge>()
                .WithMany()
                .HasForeignKey(ub => ub.BadgeId)
                .OnDelete(DeleteBehavior.Cascade);

            // CommunityReply ForeignKeys
            modelBuilder.Entity<CommunityReply>()
                .HasOne(cr => cr.User)
                .WithMany()
                .HasForeignKey(cr => cr.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CommunityReply>()
                .HasOne<CommunityPost>()
                .WithMany()
                .HasForeignKey(cr => cr.PostId)
                .OnDelete(DeleteBehavior.Cascade);
        }

        private void DisableCascadeDeletes(ModelBuilder modelBuilder)
        {
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                foreach (var foreignKey in entityType.GetForeignKeys())
                {
                    foreignKey.DeleteBehavior = DeleteBehavior.Restrict;
                }
            }
        }
    }
}
