using Microsoft.EntityFrameworkCore;
using JobMagnet.Domain.Entities;

namespace JobMagnet.Infrastructure
{
    public static class JobMagnetDbContextExtensions
    {
        public static void ApplyEnterpriseModel(this ModelBuilder modelBuilder)
        {
            // ===== GLOBAL QUERY FILTERS FOR SOFT DELETE =====
            // تطبيق Soft Delete على جميع الكيانات التي تحتوي على IsDeleted
            
            // Core Users & Authentication
            modelBuilder.Entity<User>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Admin>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Freelancer>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Employer>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<JobSeeker>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Client>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Role>().HasQueryFilter(e => !e.IsDeleted);
            
            // Company
            modelBuilder.Entity<Company>().HasQueryFilter(e => !e.IsDeleted);
            
            // Jobs & Applications
            modelBuilder.Entity<Job>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<JobApplication>().HasQueryFilter(e => !e.IsDeleted);
            
            // Projects & Contracts
            modelBuilder.Entity<Project>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Proposal>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Contract>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<ProjectMilestone>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<ProjectDelivery>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Timesheet>().HasQueryFilter(e => !e.IsDeleted);
            
            // Finance & Payments
            modelBuilder.Entity<Payment>().HasQueryFilter(e => !e.IsDeleted);
            // modelbuilder.Entity<Subscription>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Transaction>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<UserWallet>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Invoice>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<EscrowTransaction>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<WithdrawalRequest>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<RefundRequest>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<CommissionRate>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<PromoCode>().HasQueryFilter(e => !e.IsDeleted);
            
            // Reviews & Disputes
            modelBuilder.Entity<Review>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Rating>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Dispute>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Report>().HasQueryFilter(e => !e.IsDeleted);
            
            // Communication
            modelBuilder.Entity<Chat>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Message>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Notification>().HasQueryFilter(e => !e.IsDeleted);
            
            // Community & Support
            modelBuilder.Entity<CommunityPost>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<CommunityReply>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<SupportTicket>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<TicketMessage>().HasQueryFilter(e => !e.IsDeleted);
            
            // User Profile & Documents
            modelBuilder.Entity<UserDocument>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<UserEducation>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<UserWorkExperience>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<UserCertification>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<UserSettings>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<FreelancerPortfolio>().HasQueryFilter(e => !e.IsDeleted);
            
            // Skills & Badges
            modelBuilder.Entity<Skill>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Badge>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<FreelancerLevel>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Tag>().HasQueryFilter(e => !e.IsDeleted);
            
            // Categories
            modelBuilder.Entity<Category>().HasQueryFilter(e => !e.IsDeleted);
            
            // Favorites & Saved
            modelBuilder.Entity<SavedJob>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<SavedFreelancer>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Favorite>().HasQueryFilter(e => !e.IsDeleted);
            
            // Marketing
            modelBuilder.Entity<Referral>().HasQueryFilter(e => !e.IsDeleted);
            
            // Security
            modelBuilder.Entity<IpBlacklist>().HasQueryFilter(e => !e.IsDeleted);
            
            // Templates & Settings
            modelBuilder.Entity<EmailTemplate>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<SmsTemplate>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<PlatformSetting>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Faq>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Announcement>().HasQueryFilter(e => !e.IsDeleted);
            
            // ===== INDEXES FOR PERFORMANCE OPTIMIZATION =====
            
            // ----- USER & AUTHENTICATION INDEXES -----
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email).IsUnique();
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Phone);
            modelBuilder.Entity<User>()
                .HasIndex(u => u.UserType);
            modelBuilder.Entity<User>()
                .HasIndex(u => new { u.IsActive, u.IsDeleted });
            modelBuilder.Entity<User>()
                .HasIndex(u => u.CreatedAt);
            modelBuilder.Entity<User>()
                .HasIndex(u => new { u.FirstName, u.LastName });
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Country);
            modelBuilder.Entity<User>()
                .HasIndex(u => u.City);
            modelBuilder.Entity<User>()
                .HasIndex(u => u.LinkedInUrl).IsUnique();
            
            modelBuilder.Entity<RefreshToken>()
                .HasIndex(rt => rt.UserId);
            modelBuilder.Entity<RefreshToken>()
                .HasIndex(rt => rt.Token).IsUnique();
            modelBuilder.Entity<RefreshToken>()
                .HasIndex(rt => new { rt.ExpiresAt, rt.RevokedAt });
            
            modelBuilder.Entity<Admin>()
                .HasIndex(a => a.UserId);
            modelBuilder.Entity<Admin>()
                .HasIndex(a => a.AdminLevel);
            
            modelBuilder.Entity<Freelancer>()
                .HasIndex(f => f.UserId);
            modelBuilder.Entity<Freelancer>()
                .HasIndex(f => f.FreelancerLevelId);
            modelBuilder.Entity<Freelancer>()
                .HasIndex(f => new { f.IsVerified, f.IsDeleted });
            modelBuilder.Entity<Freelancer>()
                .HasIndex(f => f.TotalCompletedProjects);
            modelBuilder.Entity<Freelancer>()
                .HasIndex(f => f.ProfessionalTitle);
            
            modelBuilder.Entity<Employer>()
                .HasIndex(e => e.UserId);
            modelBuilder.Entity<Employer>()
                .HasIndex(e => new { e.IsVerified, e.IsDeleted });
            
            modelBuilder.Entity<Company>()
                .HasIndex(c => c.EmployerId);
            modelBuilder.Entity<Company>()
                .HasIndex(c => c.CompanyName);
            modelBuilder.Entity<Company>()
                .HasIndex(c => c.Industry);
            modelBuilder.Entity<Company>()
                .HasIndex(c => c.Country);
            modelBuilder.Entity<Company>()
                .HasIndex(c => c.City);
            modelBuilder.Entity<Company>()
                .HasIndex(c => c.CommercialRegistrationNumber);
            
            modelBuilder.Entity<JobSeeker>()
                .HasIndex(js => js.UserId);
            modelBuilder.Entity<JobSeeker>()
                .HasIndex(js => new { js.IsVerified, js.IsDeleted });
            modelBuilder.Entity<JobSeeker>()
                .HasIndex(js => js.PreferredJobType);
            modelBuilder.Entity<JobSeeker>()
                .HasIndex(js => js.ProfessionalTitle);
            
            modelBuilder.Entity<Client>()
                .HasIndex(c => c.UserId);
            modelBuilder.Entity<Client>()
                .HasIndex(c => c.Website);
            modelBuilder.Entity<Client>()
                .HasIndex(c => new { c.IsVerified, c.IsDeleted });
            
            modelBuilder.Entity<UserRole>()
                .HasIndex(ur => ur.UserId);
            modelBuilder.Entity<UserRole>()
                .HasIndex(ur => ur.RoleId);
            
            modelBuilder.Entity<Role>()
                .HasIndex(r => r.RoleName).IsUnique();
            
            // ----- COMPANY INDEXES -----
            modelBuilder.Entity<Company>()
                .HasIndex(c => c.EmployerId);
            modelBuilder.Entity<Company>()
                .HasIndex(c => c.CompanyName);
            modelBuilder.Entity<Company>()
                .HasIndex(c => c.Industry);
            modelBuilder.Entity<Company>()
                .HasIndex(c => new { c.IsVerified, c.IsDeleted });
            
            // ----- JOB INDEXES -----
            modelBuilder.Entity<Job>()
                .HasIndex(j => j.PostedByUserId);
            modelBuilder.Entity<Job>()
                .HasIndex(j => j.Type);
            modelBuilder.Entity<Job>()
                .HasIndex(j => j.Location);
            modelBuilder.Entity<Job>()
                .HasIndex(j => new { j.IsActive, j.IsDeleted });
            modelBuilder.Entity<Job>()
                .HasIndex(j => j.CreatedAt);
            modelBuilder.Entity<Job>()
                .HasIndex(j => new { j.MinSalary, j.MaxSalary });
            
            modelBuilder.Entity<JobApplication>()
                .HasIndex(ja => ja.JobId);
            modelBuilder.Entity<JobApplication>()
                .HasIndex(ja => ja.JobSeekerId);
            modelBuilder.Entity<JobApplication>()
                .HasIndex(ja => ja.Status);
            modelBuilder.Entity<JobApplication>()
                .HasIndex(ja => new { ja.JobId, ja.JobSeekerId }).IsUnique();
            modelBuilder.Entity<JobApplication>()
                .HasIndex(ja => ja.AppliedAt);
            
            modelBuilder.Entity<JobCategory>()
                .HasIndex(jc => jc.JobId);
            modelBuilder.Entity<JobCategory>()
                .HasIndex(jc => jc.CategoryId);
            
            modelBuilder.Entity<JobTag>()
                .HasIndex(jt => jt.JobId);
            modelBuilder.Entity<JobTag>()
                .HasIndex(jt => jt.TagId);
            
            modelBuilder.Entity<SavedJob>()
                .HasIndex(sj => sj.UserId);
            modelBuilder.Entity<SavedJob>()
                .HasIndex(sj => sj.JobId);
            
            // ----- PROJECT INDEXES -----
            modelBuilder.Entity<Project>()
                .HasIndex(p => p.OwnerUserId);
            modelBuilder.Entity<Project>()
                .HasIndex(p => p.AssignedFreelancerId);
            modelBuilder.Entity<Project>()
                .HasIndex(p => p.Status);
            modelBuilder.Entity<Project>()
                .HasIndex(p => new { p.Status, p.IsDeleted });
            modelBuilder.Entity<Project>()
                .HasIndex(p => p.CreatedAt);
            modelBuilder.Entity<Project>()
                .HasIndex(p => p.Budget);
            
            modelBuilder.Entity<Proposal>()
                .HasIndex(pr => pr.ProjectId);
            modelBuilder.Entity<Proposal>()
                .HasIndex(pr => pr.FreelancerUserId);
            modelBuilder.Entity<Proposal>()
                .HasIndex(pr => pr.Status);
            modelBuilder.Entity<Proposal>()
                .HasIndex(pr => new { pr.ProjectId, pr.FreelancerUserId });
            
            modelBuilder.Entity<Contract>()
                .HasIndex(c => c.ProjectId);
            modelBuilder.Entity<Contract>()
                .HasIndex(c => c.ClientUserId);
            modelBuilder.Entity<Contract>()
                .HasIndex(c => c.FreelancerUserId);
            modelBuilder.Entity<Contract>()
                .HasIndex(c => c.SignedDate);
            
            modelBuilder.Entity<ProjectMilestone>()
                .HasIndex(pm => pm.ProjectId);
            modelBuilder.Entity<ProjectMilestone>()
                .HasIndex(pm => pm.Status);
            modelBuilder.Entity<ProjectMilestone>()
                .HasIndex(pm => pm.DueDate);
            
            modelBuilder.Entity<ProjectDelivery>()
                .HasIndex(pd => pd.ProjectId);
            modelBuilder.Entity<ProjectDelivery>()
                .HasIndex(pd => pd.IsApproved);
            modelBuilder.Entity<ProjectDelivery>()
                .HasIndex(pd => pd.DeliveredAt);
            
            modelBuilder.Entity<Timesheet>()
                .HasIndex(t => t.ProjectId);
            modelBuilder.Entity<Timesheet>()
                .HasIndex(t => t.FreelancerUserId);
            modelBuilder.Entity<Timesheet>()
                .HasIndex(t => t.Date);
            modelBuilder.Entity<Timesheet>()
                .HasIndex(t => new { t.ProjectId, t.Date });
            
            modelBuilder.Entity<ProjectCategory>()
                .HasIndex(pc => pc.ProjectId);
            modelBuilder.Entity<ProjectCategory>()
                .HasIndex(pc => pc.CategoryId);
            
            modelBuilder.Entity<ProjectTag>()
                .HasIndex(pt => pt.ProjectId);
            modelBuilder.Entity<ProjectTag>()
                .HasIndex(pt => pt.TagId);
            
            // ----- PAYMENT & FINANCE INDEXES -----
            modelBuilder.Entity<Payment>()
                .HasIndex(p => p.UserId);
            modelBuilder.Entity<Payment>()
                .HasIndex(p => p.Status);
            modelBuilder.Entity<Payment>()
                .HasIndex(p => p.TransactionId);
            modelBuilder.Entity<Payment>()
                .HasIndex(p => p.CreatedAt);
            modelBuilder.Entity<Payment>()
                .HasIndex(p => new { p.UserId, p.Status });
            
            modelBuilder.Entity<Subscription>()
                .HasIndex(s => s.UserId);
            modelBuilder.Entity<Subscription>()
                .HasIndex(s => s.IsActive);
            modelBuilder.Entity<Subscription>()
                .HasIndex(s => new { s.EndDate, s.IsActive });
            modelBuilder.Entity<Subscription>()
                .HasIndex(s => s.AutoRenew);
            
            modelBuilder.Entity<Transaction>()
                .HasIndex(t => t.UserId);
            modelBuilder.Entity<Transaction>()
                .HasIndex(t => t.Type);
            modelBuilder.Entity<Transaction>()
                .HasIndex(t => t.Status);
            modelBuilder.Entity<Transaction>()
                .HasIndex(t => t.CreatedAt);
            
            modelBuilder.Entity<UserWallet>()
                .HasIndex(uw => uw.UserId);
            
            modelBuilder.Entity<Invoice>()
                .HasIndex(i => i.ProjectId);
            modelBuilder.Entity<Invoice>()
                .HasIndex(i => i.Status);
            modelBuilder.Entity<Invoice>()
                .HasIndex(i => i.InvoiceNumber).IsUnique();
            modelBuilder.Entity<Invoice>()
                .HasIndex(i => i.DueDate);
            
            modelBuilder.Entity<EscrowTransaction>()
                .HasIndex(et => et.ProjectId);
            modelBuilder.Entity<EscrowTransaction>()
                .HasIndex(et => et.FreelancerUserId);
            modelBuilder.Entity<EscrowTransaction>()
                .HasIndex(et => et.Status);
            
            modelBuilder.Entity<WithdrawalRequest>()
                .HasIndex(wr => wr.UserId);
            modelBuilder.Entity<WithdrawalRequest>()
                .HasIndex(wr => wr.Status);
            modelBuilder.Entity<WithdrawalRequest>()
                .HasIndex(wr => wr.RequestedAt);
            
            modelBuilder.Entity<RefundRequest>()
                .HasIndex(rr => rr.UserId);
            modelBuilder.Entity<RefundRequest>()
                .HasIndex(rr => rr.TransactionId);
            modelBuilder.Entity<RefundRequest>()
                .HasIndex(rr => rr.Status);
            
            modelBuilder.Entity<CommissionRate>()
                .HasIndex(cr => cr.UserType);
            modelBuilder.Entity<CommissionRate>()
                .HasIndex(cr => cr.EffectiveDate);
            
            modelBuilder.Entity<PromoCode>()
                .HasIndex(pc => pc.Code).IsUnique();
            modelBuilder.Entity<PromoCode>()
                .HasIndex(pc => pc.ExpiryDate);
            
            // ----- REVIEW & RATING INDEXES -----
            modelBuilder.Entity<Review>()
                .HasIndex(r => r.ReviewerId);
            modelBuilder.Entity<Review>()
                .HasIndex(r => r.TargetUserId);
            modelBuilder.Entity<Review>()
                .HasIndex(r => r.RatingValue);
            modelBuilder.Entity<Review>()
                .HasIndex(r => new { r.TargetUserId, r.CreatedAt });
            
            modelBuilder.Entity<Rating>()
                .HasIndex(r => r.UserId);
            
            modelBuilder.Entity<Dispute>()
                .HasIndex(d => d.ProjectId);
            modelBuilder.Entity<Dispute>()
                .HasIndex(d => d.RaisedByUserId);
            modelBuilder.Entity<Dispute>()
                .HasIndex(d => d.Status);
            modelBuilder.Entity<Dispute>()
                .HasIndex(d => d.CreatedAt);
            
            modelBuilder.Entity<Report>()
                .HasIndex(r => r.ReportedBy);
            modelBuilder.Entity<Report>()
                .HasIndex(r => new { r.EntityType, r.EntityId });
            modelBuilder.Entity<Report>()
                .HasIndex(r => r.Status);
            
            // ----- COMMUNICATION INDEXES -----
            modelBuilder.Entity<Chat>()
                .HasIndex(c => c.User1Id);
            modelBuilder.Entity<Chat>()
                .HasIndex(c => c.User2Id);
            modelBuilder.Entity<Chat>()
                .HasIndex(c => new { c.User1Id, c.User2Id }).IsUnique();
            
            modelBuilder.Entity<Message>()
                .HasIndex(m => m.ChatId);
            modelBuilder.Entity<Message>()
                .HasIndex(m => m.SenderId);
            modelBuilder.Entity<Message>()
                .HasIndex(m => new { m.ChatId, m.SentAt });
            modelBuilder.Entity<Message>()
                .HasIndex(m => m.IsRead);
            
            modelBuilder.Entity<Notification>()
                .HasIndex(n => n.UserId);
            modelBuilder.Entity<Notification>()
                .HasIndex(n => n.IsRead);
            modelBuilder.Entity<Notification>()
                .HasIndex(n => new { n.UserId, n.IsRead });
            modelBuilder.Entity<Notification>()
                .HasIndex(n => n.CreatedAt);
            
            // ----- COMMUNITY INDEXES -----
            modelBuilder.Entity<CommunityPost>()
                .HasIndex(cp => cp.PostedByUserId);
            modelBuilder.Entity<CommunityPost>()
                .HasIndex(cp => cp.PostType);
            modelBuilder.Entity<CommunityPost>()
                .HasIndex(cp => cp.CreatedAt);
            
            modelBuilder.Entity<CommunityReply>()
                .HasIndex(cr => cr.PostId);
            modelBuilder.Entity<CommunityReply>()
                .HasIndex(cr => cr.UserId);
            modelBuilder.Entity<CommunityReply>()
                .HasIndex(cr => cr.CreatedAt);
            
            modelBuilder.Entity<SupportTicket>()
                .HasIndex(st => st.CreatedByUserId);
            modelBuilder.Entity<SupportTicket>()
                .HasIndex(st => st.Status);
            modelBuilder.Entity<SupportTicket>()
                .HasIndex(st => st.CreatedAt);
            
            modelBuilder.Entity<TicketMessage>()
                .HasIndex(tm => tm.TicketId);
            modelBuilder.Entity<TicketMessage>()
                .HasIndex(tm => tm.SenderUserId);
            modelBuilder.Entity<TicketMessage>()
                .HasIndex(tm => tm.SentAt);
            
            // ----- USER PROFILE INDEXES -----
            modelBuilder.Entity<UserDocument>()
                .HasIndex(ud => ud.UserId);
            modelBuilder.Entity<UserDocument>()
                .HasIndex(ud => ud.DocumentType);
            modelBuilder.Entity<UserDocument>()
                .HasIndex(ud => ud.IsVerified);
            
            modelBuilder.Entity<UserEducation>()
                .HasIndex(ue => ue.UserId);
            
            modelBuilder.Entity<UserWorkExperience>()
                .HasIndex(uwe => uwe.UserId);
            
            modelBuilder.Entity<UserCertification>()
                .HasIndex(uc => uc.UserId);
            
            modelBuilder.Entity<UserSettings>()
                .HasIndex(us => us.UserId);
            
            modelBuilder.Entity<FreelancerPortfolio>()
                .HasIndex(fp => fp.FreelancerId);
            
            // ----- SKILL & BADGE INDEXES -----
            modelBuilder.Entity<Skill>()
                .HasIndex(s => s.Name).IsUnique();
            
            modelBuilder.Entity<UserSkill>()
                .HasIndex(us => us.UserId);
            modelBuilder.Entity<UserSkill>()
                .HasIndex(us => us.SkillId);
            modelBuilder.Entity<UserSkill>()
                .HasIndex(us => us.VerifiedBy);
            
            modelBuilder.Entity<Badge>()
                .HasIndex(b => b.Name).IsUnique();
            
            modelBuilder.Entity<UserBadge>()
                .HasIndex(ub => ub.UserId);
            modelBuilder.Entity<UserBadge>()
                .HasIndex(ub => ub.BadgeId);
            
            modelBuilder.Entity<FreelancerLevel>()
                .HasIndex(fl => fl.LevelName).IsUnique();
            
            modelBuilder.Entity<Tag>()
                .HasIndex(t => t.Name).IsUnique();
            
            modelBuilder.Entity<FreelancerTag>()
                .HasIndex(ft => ft.FreelancerId);
            modelBuilder.Entity<FreelancerTag>()
                .HasIndex(ft => ft.TagId);
            
            // ----- CATEGORY INDEXES -----
            modelBuilder.Entity<Category>()
                .HasIndex(c => c.Name).IsUnique();
            
            // ----- SAVED & FAVORITE INDEXES -----
            modelBuilder.Entity<SavedFreelancer>()
                .HasIndex(sf => sf.UserId);
            modelBuilder.Entity<SavedFreelancer>()
                .HasIndex(sf => sf.FreelancerUserId);
            
            modelBuilder.Entity<Favorite>()
                .HasIndex(f => f.UserId);
            modelBuilder.Entity<Favorite>()
                .HasIndex(f => new { f.EntityType, f.EntityId });
            
            // ----- REFERRAL INDEXES -----
            modelBuilder.Entity<Referral>()
                .HasIndex(r => r.ReferrerId);
            modelBuilder.Entity<Referral>()
                .HasIndex(r => r.ReferredUserId);
            modelBuilder.Entity<Referral>()
                .HasIndex(r => r.Status);
            
            // ----- SYSTEM LOGS INDEXES -----
            modelBuilder.Entity<ActivityLog>()
                .HasIndex(al => al.UserId);
            modelBuilder.Entity<ActivityLog>()
                .HasIndex(al => al.CreatedAt);
            modelBuilder.Entity<ActivityLog>()
                .HasIndex(al => al.Action);
            
            modelBuilder.Entity<SystemLog>()
                .HasIndex(sl => sl.Level);
            modelBuilder.Entity<SystemLog>()
                .HasIndex(sl => sl.CreatedAt);
            
            modelBuilder.Entity<ErrorLog>()
                .HasIndex(el => el.UserId);
            modelBuilder.Entity<ErrorLog>()
                .HasIndex(el => el.LoggedAt);
            
            modelBuilder.Entity<SearchHistory>()
                .HasIndex(sh => sh.UserId);
            modelBuilder.Entity<SearchHistory>()
                .HasIndex(sh => sh.ExecutedAt);
            
            // ----- SECURITY INDEXES -----
            modelBuilder.Entity<IpBlacklist>()
                .HasIndex(ib => ib.IpAddress).IsUnique();
            modelBuilder.Entity<IpBlacklist>()
                .HasIndex(ib => ib.ExpiresAt);
            
            modelBuilder.Entity<BlockedUser>()
                .HasIndex(bu => bu.BlockedUserId);
            modelBuilder.Entity<BlockedUser>()
                .HasIndex(bu => bu.BlockedByUserId);
            
            // ----- TEMPLATE & SETTING INDEXES -----
            modelBuilder.Entity<EmailTemplate>()
                .HasIndex(et => et.TemplateName).IsUnique();
            
            modelBuilder.Entity<SmsTemplate>()
                .HasIndex(st => st.TemplateName).IsUnique();
            
            modelBuilder.Entity<PlatformSetting>()
                .HasIndex(ps => ps.SettingKey).IsUnique();
            modelBuilder.Entity<PlatformSetting>()
                .HasIndex(ps => ps.Category);
            
            modelBuilder.Entity<Faq>()
                .HasIndex(f => f.Category);
            
            modelBuilder.Entity<Announcement>()
                .HasIndex(a => a.TargetUsers);
            modelBuilder.Entity<Announcement>()
                .HasIndex(a => a.ExpiryDate);
        }
    }
}
