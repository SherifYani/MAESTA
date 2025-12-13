using Microsoft.EntityFrameworkCore;
using JobMagnet.Domain.Entities;

namespace JobMagnet.Infrastructure.Data.Configuration
{
    /// <summary>
    /// تكوين شامل لجميع الفهارس (Indexes) في قاعدة البيانات
    /// لتحسين أداء عمليات البحث والاستعلام
    /// </summary>
    public static class DatabaseIndexesConfiguration
    {
        public static void ConfigureIndexes(ModelBuilder modelBuilder)
        {
            // ===== User Indexes =====
            ConfigureUserIndexes(modelBuilder);
            
            // ===== Job Indexes =====
            ConfigureJobIndexes(modelBuilder);
            
            // ===== Project Indexes =====
            ConfigureProjectIndexes(modelBuilder);
            
            // ===== Freelancer Indexes =====
            ConfigureFreelancerIndexes(modelBuilder);
            
            // ===== Company Indexes =====
            ConfigureCompanyIndexes(modelBuilder);
            
            // ===== Notification Indexes =====
            ConfigureNotificationIndexes(modelBuilder);
            
            // ===== Message & Chat Indexes =====
            ConfigureMessageIndexes(modelBuilder);
            
            // ===== Community Post Indexes =====
            ConfigureCommunityPostIndexes(modelBuilder);
            
            // ===== Search History Indexes =====
            ConfigureSearchHistoryIndexes(modelBuilder);
            
            // ===== Job Application Indexes =====
            ConfigureJobApplicationIndexes(modelBuilder);
            
            // ===== Proposal Indexes =====
            ConfigureProposalIndexes(modelBuilder);
            
            // ===== Payment & Transaction Indexes =====
            ConfigurePaymentIndexes(modelBuilder);
            
            // ===== Review & Rating Indexes =====
            ConfigureReviewIndexes(modelBuilder);
            
            // ===== Activity & Logs Indexes =====
            ConfigureLogIndexes(modelBuilder);
            
            // ===== Subscription & Wallet Indexes =====
            ConfigureSubscriptionIndexes(modelBuilder);
            
            // ===== Additional Entity Indexes =====
            ConfigureAdditionalIndexes(modelBuilder);
        }
        
        private static void ConfigureUserIndexes(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>(entity =>
            {
                // فهرس فريد للبريد الإلكتروني (Unique Index for Email)
                entity.HasIndex(u => u.Email)
                    .IsUnique()
                    .HasDatabaseName("IX_User_Email_Unique");
                
                // فهرس للبحث حسب الاسم الأول والأخير
                entity.HasIndex(u => new { u.FirstName, u.LastName })
                    .HasDatabaseName("IX_User_FirstName_LastName");
                
                // فهرس للبحث حسب نوع المستخدم
                entity.HasIndex(u => u.UserType)
                    .HasDatabaseName("IX_User_UserType");
                
                // فهرس للمستخدمين النشطين وغير المحذوفين
                entity.HasIndex(u => new { u.IsActive, u.IsDeleted })
                    .HasDatabaseName("IX_User_IsActive_IsDeleted");
                
                // فهرس للبحث حسب الدولة والمدينة
                entity.HasIndex(u => new { u.Country, u.City })
                    .HasDatabaseName("IX_User_Country_City");
                
                // فهرس للبحث حسب تاريخ الإنشاء
                entity.HasIndex(u => u.CreatedAt)
                    .HasDatabaseName("IX_User_CreatedAt");
                
                // فهرس لرقم الهاتف (للبحث والتحقق)
                entity.HasIndex(u => u.Phone)
                    .HasDatabaseName("IX_User_Phone");
                
                // فهرس للجنس (للإحصائيات والفلترة)
                entity.HasIndex(u => u.Gender)
                    .HasDatabaseName("IX_User_Gender");
                
                // فهرس لآخر تسجيل دخول
                entity.HasIndex(u => u.LastLoginAt)
                    .HasDatabaseName("IX_User_LastLoginAt");
            });
            
            // UserRole Indexes
            modelBuilder.Entity<UserRole>(entity =>
            {
                entity.HasIndex(ur => ur.UserId)
                    .HasDatabaseName("IX_UserRole_UserId");
                
                entity.HasIndex(ur => ur.RoleId)
                    .HasDatabaseName("IX_UserRole_RoleId");
                
                // فهرس مركب فريد لمنع تكرار الدور للمستخدم
                entity.HasIndex(ur => new { ur.UserId, ur.RoleId })
                    .IsUnique()
                    .HasDatabaseName("IX_UserRole_UserId_RoleId_Unique");
            });
        }
        
        private static void ConfigureJobIndexes(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Job>(entity =>
            {
                // فهرس للبحث حسب ناشر الوظيفة
                entity.HasIndex(j => j.PostedByUserId)
                    .HasDatabaseName("IX_Job_PostedByUserId");
                
                // فهرس للبحث في عنوان الوظيفة (Full-Text Index يتم إنشاؤه في Migration)
                entity.HasIndex(j => j.Title)
                    .HasDatabaseName("IX_Job_Title");
                
                // فهرس للبحث حسب الموقع
                entity.HasIndex(j => j.Location)
                    .HasDatabaseName("IX_Job_Location");
                
                // فهرس للبحث حسب نوع الوظيفة
                entity.HasIndex(j => j.Type)
                    .HasDatabaseName("IX_Job_Type");
                
                // فهرس للوظائف النشطة وغير المحذوفة
                entity.HasIndex(j => new { j.IsActive, j.IsDeleted })
                    .HasDatabaseName("IX_Job_IsActive_IsDeleted");
                
                // فهرس للبحث حسب نطاق الراتب
                entity.HasIndex(j => new { j.MinSalary, j.MaxSalary })
                    .HasDatabaseName("IX_Job_Salary_Range");
                
                // فهرس للبحث حسب تاريخ الإنشاء (للوظائف الحديثة)
                entity.HasIndex(j => j.CreatedAt)
                    .HasDatabaseName("IX_Job_CreatedAt");
                
                // فهرس مركب للبحث الشائع (نشط + غير محذوف + حسب التاريخ)
                entity.HasIndex(j => new { j.IsActive, j.IsDeleted, j.CreatedAt })
                    .HasDatabaseName("IX_Job_Active_NotDeleted_CreatedAt");
            });
            
            // JobCategory Indexes
            modelBuilder.Entity<JobCategory>(entity =>
            {
                entity.HasIndex(jc => jc.JobId)
                    .HasDatabaseName("IX_JobCategory_JobId");
                
                entity.HasIndex(jc => jc.CategoryId)
                    .HasDatabaseName("IX_JobCategory_CategoryId");
                
                // فهرس مركب فريد
                entity.HasIndex(jc => new { jc.JobId, jc.CategoryId })
                    .IsUnique()
                    .HasDatabaseName("IX_JobCategory_JobId_CategoryId_Unique");
            });
            
            // JobTag Indexes
            modelBuilder.Entity<JobTag>(entity =>
            {
                entity.HasIndex(jt => jt.JobId)
                    .HasDatabaseName("IX_JobTag_JobId");
                
                entity.HasIndex(jt => jt.TagId)
                    .HasDatabaseName("IX_JobTag_TagId");
                
                entity.HasIndex(jt => new { jt.JobId, jt.TagId })
                    .IsUnique()
                    .HasDatabaseName("IX_JobTag_JobId_TagId_Unique");
            });
        }
        
        private static void ConfigureProjectIndexes(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Project>(entity =>
            {
                // فهرس للبحث حسب صاحب المشروع
                entity.HasIndex(p => p.OwnerUserId)
                    .HasDatabaseName("IX_Project_OwnerUserId");
                
                // فهرس للبحث حسب المستقل المعين
                entity.HasIndex(p => p.AssignedFreelancerId)
                    .HasDatabaseName("IX_Project_AssignedFreelancerId");
                
                // فهرس للبحث في عنوان المشروع
                entity.HasIndex(p => p.Title)
                    .HasDatabaseName("IX_Project_Title");
                
                // فهرس للبحث حسب حالة المشروع
                entity.HasIndex(p => p.Status)
                    .HasDatabaseName("IX_Project_Status");
                
                // فهرس للمشاريع غير المحذوفة
                entity.HasIndex(p => p.IsDeleted)
                    .HasDatabaseName("IX_Project_IsDeleted");
                
                // فهرس للبحث حسب الميزانية
                entity.HasIndex(p => p.Budget)
                    .HasDatabaseName("IX_Project_Budget");
                
                // فهرس للبحث حسب تاريخ الإنشاء
                entity.HasIndex(p => p.CreatedAt)
                    .HasDatabaseName("IX_Project_CreatedAt");
                
                // فهرس مركب للبحث الشائع (حالة + غير محذوف + تاريخ)
                entity.HasIndex(p => new { p.Status, p.IsDeleted, p.CreatedAt })
                    .HasDatabaseName("IX_Project_Status_IsDeleted_CreatedAt");
            });
            
            // ProjectCategory Indexes
            modelBuilder.Entity<ProjectCategory>(entity =>
            {
                entity.HasIndex(pc => pc.ProjectId)
                    .HasDatabaseName("IX_ProjectCategory_ProjectId");
                
                entity.HasIndex(pc => pc.CategoryId)
                    .HasDatabaseName("IX_ProjectCategory_CategoryId");
                
                entity.HasIndex(pc => new { pc.ProjectId, pc.CategoryId })
                    .IsUnique()
                    .HasDatabaseName("IX_ProjectCategory_ProjectId_CategoryId_Unique");
            });
            
            // ProjectTag Indexes
            modelBuilder.Entity<ProjectTag>(entity =>
            {
                entity.HasIndex(pt => pt.ProjectId)
                    .HasDatabaseName("IX_ProjectTag_ProjectId");
                
                entity.HasIndex(pt => pt.TagId)
                    .HasDatabaseName("IX_ProjectTag_TagId");
                
                entity.HasIndex(pt => new { pt.ProjectId, pt.TagId })
                    .IsUnique()
                    .HasDatabaseName("IX_ProjectTag_ProjectId_TagId_Unique");
            });
            
            // ProjectMilestone Indexes
            modelBuilder.Entity<ProjectMilestone>(entity =>
            {
                entity.HasIndex(pm => pm.ProjectId)
                    .HasDatabaseName("IX_ProjectMilestone_ProjectId");
                
                entity.HasIndex(pm => pm.Status)
                    .HasDatabaseName("IX_ProjectMilestone_Status");
                
                entity.HasIndex(pm => new { pm.ProjectId, pm.Status })
                    .HasDatabaseName("IX_ProjectMilestone_ProjectId_Status");
            });
        }
        
        private static void ConfigureFreelancerIndexes(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Freelancer>(entity =>
            {
                // فهرس فريد لمعرف المستخدم
                entity.HasIndex(f => f.UserId)
                    .IsUnique()
                    .HasDatabaseName("IX_Freelancer_UserId_Unique");
                
                // فهرس للبحث حسب المسمى الوظيفي
                entity.HasIndex(f => f.ProfessionalTitle)
                    .HasDatabaseName("IX_Freelancer_ProfessionalTitle");
                
                // فهرس للبحث حسب سنوات الخبرة
                entity.HasIndex(f => f.ExperienceYears)
                    .HasDatabaseName("IX_Freelancer_ExperienceYears");
                
                // فهرس للبحث حسب السعر بالساعة
                entity.HasIndex(f => f.HourlyRate)
                    .HasDatabaseName("IX_Freelancer_HourlyRate");
                
                // فهرس للمستقلين الموثقين
                entity.HasIndex(f => f.IsVerified)
                    .HasDatabaseName("IX_Freelancer_IsVerified");
                
                // فهرس للمستقلين غير المحذوفين
                entity.HasIndex(f => f.IsDeleted)
                    .HasDatabaseName("IX_Freelancer_IsDeleted");
                
                // فهرس مركب للبحث (موثق + غير محذوف + سعر الساعة)
                entity.HasIndex(f => new { f.IsVerified, f.IsDeleted, f.HourlyRate })
                    .HasDatabaseName("IX_Freelancer_Verified_NotDeleted_Rate");
                
                // فهرس لعدد المشاريع المكتملة
                entity.HasIndex(f => f.TotalCompletedProjects)
                    .HasDatabaseName("IX_Freelancer_TotalCompletedProjects");
            });
            
            // FreelancerTag Indexes
            modelBuilder.Entity<FreelancerTag>(entity =>
            {
                entity.HasIndex(ft => ft.FreelancerId)
                    .HasDatabaseName("IX_FreelancerTag_FreelancerId");
                
                entity.HasIndex(ft => ft.TagId)
                    .HasDatabaseName("IX_FreelancerTag_TagId");
                
                entity.HasIndex(ft => new { ft.FreelancerId, ft.TagId })
                    .IsUnique()
                    .HasDatabaseName("IX_FreelancerTag_FreelancerId_TagId_Unique");
            });
            
            // UserSkill Indexes
            modelBuilder.Entity<UserSkill>(entity =>
            {
                entity.HasIndex(us => us.UserId)
                    .HasDatabaseName("IX_UserSkill_UserId");
                
                entity.HasIndex(us => us.SkillId)
                    .HasDatabaseName("IX_UserSkill_SkillId");
                
                entity.HasIndex(us => us.ProficiencyLevel)
                    .HasDatabaseName("IX_UserSkill_ProficiencyLevel");
                
                entity.HasIndex(us => new { us.UserId, us.SkillId })
                    .IsUnique()
                    .HasDatabaseName("IX_UserSkill_UserId_SkillId_Unique");
            });
        }
        
        private static void ConfigureCompanyIndexes(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Company>(entity =>
            {
                // فهرس لمعرف صاحب العمل
                entity.HasIndex(c => c.EmployerId)
                    .HasDatabaseName("IX_Company_EmployerId");
                
                // فهرس للبحث في اسم الشركة
                entity.HasIndex(c => c.CompanyName)
                    .HasDatabaseName("IX_Company_CompanyName");
                
                // فهرس للبحث حسب المجال
                entity.HasIndex(c => c.Industry)
                    .HasDatabaseName("IX_Company_Industry");
                
                // فهرس للبحث حسب الدولة والمدينة
                entity.HasIndex(c => new { c.Country, c.City })
                    .HasDatabaseName("IX_Company_Country_City");
                
                // فهرس للشركات الموثقة
                entity.HasIndex(c => c.IsVerified)
                    .HasDatabaseName("IX_Company_IsVerified");
                
                // فهرس للشركات غير المحذوفة
                entity.HasIndex(c => c.IsDeleted)
                    .HasDatabaseName("IX_Company_IsDeleted");
                
                // فهرس مركب (موثق + غير محذوف + مجال)
                entity.HasIndex(c => new { c.IsVerified, c.IsDeleted, c.Industry })
                    .HasDatabaseName("IX_Company_Verified_NotDeleted_Industry");
            });
            
            // Employer Indexes
            modelBuilder.Entity<Employer>(entity =>
            {
                entity.HasIndex(e => e.UserId)
                    .IsUnique()
                    .HasDatabaseName("IX_Employer_UserId_Unique");
                
                entity.HasIndex(e => e.IsVerified)
                    .HasDatabaseName("IX_Employer_IsVerified");
                
                entity.HasIndex(e => e.IsDeleted)
                    .HasDatabaseName("IX_Employer_IsDeleted");
            });
        }
        
        private static void ConfigureNotificationIndexes(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Notification>(entity =>
            {
                // فهرس للبحث حسب المستخدم
                entity.HasIndex(n => n.UserId)
                    .HasDatabaseName("IX_Notification_UserId");
                
                // فهرس للبحث حسب حالة القراءة
                entity.HasIndex(n => n.IsRead)
                    .HasDatabaseName("IX_Notification_IsRead");
                
                // فهرس للبحث حسب نوع الإشعار
                entity.HasIndex(n => n.NotificationType)
                    .HasDatabaseName("IX_Notification_NotificationType");
                
                // فهرس للإشعارات غير المحذوفة
                entity.HasIndex(n => n.IsDeleted)
                    .HasDatabaseName("IX_Notification_IsDeleted");
                
                // فهرس للبحث حسب تاريخ الإنشاء
                entity.HasIndex(n => n.CreatedAt)
                    .HasDatabaseName("IX_Notification_CreatedAt");
                
                // فهرس مركب شائع (مستخدم + لم تُقرأ + غير محذوف + تاريخ)
                entity.HasIndex(n => new { n.UserId, n.IsRead, n.IsDeleted, n.CreatedAt })
                    .HasDatabaseName("IX_Notification_UserId_IsRead_IsDeleted_CreatedAt");
            });
        }
        
        private static void ConfigureMessageIndexes(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Message>(entity =>
            {
                // فهرس للبحث حسب المحادثة
                entity.HasIndex(m => m.ChatId)
                    .HasDatabaseName("IX_Message_ChatId");
                
                // فهرس للبحث حسب المرسل
                entity.HasIndex(m => m.SenderId)
                    .HasDatabaseName("IX_Message_SenderId");
                
                // فهرس للبحث حسب حالة القراءة
                entity.HasIndex(m => m.IsRead)
                    .HasDatabaseName("IX_Message_IsRead");
                
                // فهرس للرسائل غير المحذوفة
                entity.HasIndex(m => m.IsDeleted)
                    .HasDatabaseName("IX_Message_IsDeleted");
                
                // فهرس للبحث حسب تاريخ الإرسال
                entity.HasIndex(m => m.SentAt)
                    .HasDatabaseName("IX_Message_SentAt");
                
                // فهرس مركب (محادثة + غير محذوف + تاريخ الإرسال)
                entity.HasIndex(m => new { m.ChatId, m.IsDeleted, m.SentAt })
                    .HasDatabaseName("IX_Message_ChatId_IsDeleted_SentAt");
            });
            
            modelBuilder.Entity<Chat>(entity =>
            {
                entity.HasIndex(c => c.User1Id)
                    .HasDatabaseName("IX_Chat_User1Id");
                
                entity.HasIndex(c => c.User2Id)
                    .HasDatabaseName("IX_Chat_User2Id");
                
                // فهرس مركب فريد لمنع تكرار المحادثة
                entity.HasIndex(c => new { c.User1Id, c.User2Id })
                    .IsUnique()
                    .HasDatabaseName("IX_Chat_User1Id_User2Id_Unique");
            });
        }
        
        private static void ConfigureCommunityPostIndexes(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<CommunityPost>(entity =>
            {
                // فهرس للبحث حسب الناشر
                entity.HasIndex(cp => cp.PostedByUserId)
                    .HasDatabaseName("IX_CommunityPost_PostedByUserId");
                
                // فهرس للبحث في العنوان
                entity.HasIndex(cp => cp.Title)
                    .HasDatabaseName("IX_CommunityPost_Title");
                
                // فهرس للبحث حسب نوع المنشور
                entity.HasIndex(cp => cp.PostType)
                    .HasDatabaseName("IX_CommunityPost_PostType");
                
                // فهرس للمنشورات غير المحذوفة
                entity.HasIndex(cp => cp.IsDeleted)
                    .HasDatabaseName("IX_CommunityPost_IsDeleted");
                
                // فهرس للبحث حسب تاريخ الإنشاء
                entity.HasIndex(cp => cp.CreatedAt)
                    .HasDatabaseName("IX_CommunityPost_CreatedAt");
                
                // فهرس مركب (نوع + غير محذوف + تاريخ)
                entity.HasIndex(cp => new { cp.PostType, cp.IsDeleted, cp.CreatedAt })
                    .HasDatabaseName("IX_CommunityPost_PostType_IsDeleted_CreatedAt");
            });
            
            modelBuilder.Entity<CommunityReply>(entity =>
            {
                entity.HasIndex(cr => cr.CommunityPostId)
                    .HasDatabaseName("IX_CommunityReply_CommunityPostId");
                
                entity.HasIndex(cr => cr.RepliedByUserId)
                    .HasDatabaseName("IX_CommunityReply_RepliedByUserId");
                
                entity.HasIndex(cr => cr.IsDeleted)
                    .HasDatabaseName("IX_CommunityReply_IsDeleted");
                
                entity.HasIndex(cr => cr.CreatedAt)
                    .HasDatabaseName("IX_CommunityReply_CreatedAt");
            });
        }
        
        private static void ConfigureSearchHistoryIndexes(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<SearchHistory>(entity =>
            {
                // فهرس للبحث حسب المستخدم
                entity.HasIndex(sh => sh.UserId)
                    .HasDatabaseName("IX_SearchHistory_UserId");
                
                // فهرس للبحث في نص الاستعلام
                entity.HasIndex(sh => sh.QueryText)
                    .HasDatabaseName("IX_SearchHistory_QueryText");
                
                // فهرس للبحث حسب تاريخ التنفيذ
                entity.HasIndex(sh => sh.ExecutedAt)
                    .HasDatabaseName("IX_SearchHistory_ExecutedAt");
                
                // فهرس للبحث حسب IP
                entity.HasIndex(sh => sh.IpAddress)
                    .HasDatabaseName("IX_SearchHistory_IpAddress");
                
                // فهرس مركب (مستخدم + تاريخ التنفيذ)
                entity.HasIndex(sh => new { sh.UserId, sh.ExecutedAt })
                    .HasDatabaseName("IX_SearchHistory_UserId_ExecutedAt");
            });
        }
        
        private static void ConfigureJobApplicationIndexes(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<JobApplication>(entity =>
            {
                // فهرس للبحث حسب الوظيفة
                entity.HasIndex(ja => ja.JobId)
                    .HasDatabaseName("IX_JobApplication_JobId");
                
                // فهرس للبحث حسب الباحث عن العمل
                entity.HasIndex(ja => ja.JobSeekerId)
                    .HasDatabaseName("IX_JobApplication_JobSeekerId");
                
                // فهرس للبحث حسب الحالة
                entity.HasIndex(ja => ja.Status)
                    .HasDatabaseName("IX_JobApplication_Status");
                
                // فهرس للطلبات غير المحذوفة
                entity.HasIndex(ja => ja.IsDeleted)
                    .HasDatabaseName("IX_JobApplication_IsDeleted");
                
                // فهرس مركب فريد (وظيفة + باحث عن عمل)
                entity.HasIndex(ja => new { ja.JobId, ja.JobSeekerId })
                    .IsUnique()
                    .HasDatabaseName("IX_JobApplication_JobId_JobSeekerId_Unique");
                
                // فهرس مركب (وظيفة + حالة + غير محذوف)
                entity.HasIndex(ja => new { ja.JobId, ja.Status, ja.IsDeleted })
                    .HasDatabaseName("IX_JobApplication_JobId_Status_IsDeleted");
                
                // فهرس للبحث حسب تاريخ التقديم
                entity.HasIndex(ja => ja.AppliedAt)
                    .HasDatabaseName("IX_JobApplication_AppliedAt");
            });
            
            modelBuilder.Entity<JobSeeker>(entity =>
            {
                entity.HasIndex(js => js.UserId)
                    .IsUnique()
                    .HasDatabaseName("IX_JobSeeker_UserId_Unique");
                
                entity.HasIndex(js => js.IsDeleted)
                    .HasDatabaseName("IX_JobSeeker_IsDeleted");
            });
        }
        
        private static void ConfigureProposalIndexes(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Proposal>(entity =>
            {
                // فهرس للبحث حسب المشروع
                entity.HasIndex(p => p.ProjectId)
                    .HasDatabaseName("IX_Proposal_ProjectId");
                
                // فهرس للبحث حسب المستقل
                entity.HasIndex(p => p.FreelancerId)
                    .HasDatabaseName("IX_Proposal_FreelancerId");
                
                // فهرس للبحث حسب الحالة
                entity.HasIndex(p => p.Status)
                    .HasDatabaseName("IX_Proposal_Status");
                
                // فهرس للعروض غير المحذوفة
                entity.HasIndex(p => p.IsDeleted)
                    .HasDatabaseName("IX_Proposal_IsDeleted");
                
                // فهرس مركب (مشروع + حالة + غير محذوف)
                entity.HasIndex(p => new { p.ProjectId, p.Status, p.IsDeleted })
                    .HasDatabaseName("IX_Proposal_ProjectId_Status_IsDeleted");
                
                // فهرس للبحث حسب تاريخ التقديم
                entity.HasIndex(p => p.SubmittedAt)
                    .HasDatabaseName("IX_Proposal_SubmittedAt");
                
                // فهرس للبحث حسب السعر المعروض
                entity.HasIndex(p => p.ProposedAmount)
                    .HasDatabaseName("IX_Proposal_ProposedAmount");
            });
        }
        
        private static void ConfigurePaymentIndexes(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Payment>(entity =>
            {
                // فهرس للبحث حسب المستخدم
                entity.HasIndex(p => p.UserId)
                    .HasDatabaseName("IX_Payment_UserId");
                
                // فهرس للبحث حسب نوع الدفعة
                entity.HasIndex(p => p.PaymentType)
                    .HasDatabaseName("IX_Payment_PaymentType");
                
                // فهرس للبحث حسب الحالة
                entity.HasIndex(p => p.Status)
                    .HasDatabaseName("IX_Payment_Status");
                
                // فهرس للبحث حسب طريقة الدفع
                entity.HasIndex(p => p.PaymentMethod)
                    .HasDatabaseName("IX_Payment_PaymentMethod");
                
                // فهرس للبحث حسب تاريخ الدفع
                entity.HasIndex(p => p.PaymentDate)
                    .HasDatabaseName("IX_Payment_PaymentDate");
                
                // فهرس مركب (مستخدم + حالة + تاريخ)
                entity.HasIndex(p => new { p.UserId, p.Status, p.PaymentDate })
                    .HasDatabaseName("IX_Payment_UserId_Status_PaymentDate");
                
                // فهرس للبحث حسب معرف المعاملة الخارجي
                entity.HasIndex(p => p.TransactionId)
                    .HasDatabaseName("IX_Payment_TransactionId");
            });
            
            modelBuilder.Entity<Transaction>(entity =>
            {
                entity.HasIndex(t => t.UserId)
                    .HasDatabaseName("IX_Transaction_UserId");
                
                entity.HasIndex(t => t.TransactionType)
                    .HasDatabaseName("IX_Transaction_TransactionType");
                
                entity.HasIndex(t => t.Status)
                    .HasDatabaseName("IX_Transaction_Status");
                
                entity.HasIndex(t => t.TransactionDate)
                    .HasDatabaseName("IX_Transaction_TransactionDate");
                
                entity.HasIndex(t => new { t.UserId, t.Status, t.TransactionDate })
                    .HasDatabaseName("IX_Transaction_UserId_Status_TransactionDate");
            });
            
            modelBuilder.Entity<Invoice>(entity =>
            {
                entity.HasIndex(i => i.UserId)
                    .HasDatabaseName("IX_Invoice_UserId");
                
                entity.HasIndex(i => i.Status)
                    .HasDatabaseName("IX_Invoice_Status");
                
                entity.HasIndex(i => i.IssueDate)
                    .HasDatabaseName("IX_Invoice_IssueDate");
                
                entity.HasIndex(i => i.DueDate)
                    .HasDatabaseName("IX_Invoice_DueDate");
                
                entity.HasIndex(i => new { i.UserId, i.Status })
                    .HasDatabaseName("IX_Invoice_UserId_Status");
            });
        }
        
        private static void ConfigureReviewIndexes(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Review>(entity =>
            {
                // فهرس للبحث حسب المراجع
                entity.HasIndex(r => r.ReviewerId)
                    .HasDatabaseName("IX_Review_ReviewerId");
                
                // فهرس للبحث حسب المراجَع
                entity.HasIndex(r => r.RevieweeId)
                    .HasDatabaseName("IX_Review_RevieweeId");
                
                // فهرس للبحث حسب المشروع
                entity.HasIndex(r => r.ProjectId)
                    .HasDatabaseName("IX_Review_ProjectId");
                
                // فهرس للبحث حسب التقييم
                entity.HasIndex(r => r.Rating)
                    .HasDatabaseName("IX_Review_Rating");
                
                // فهرس للمراجعات غير المحذوفة
                entity.HasIndex(r => r.IsDeleted)
                    .HasDatabaseName("IX_Review_IsDeleted");
                
                // فهرس مركب (مراجَع + غير محذوف + تقييم)
                entity.HasIndex(r => new { r.RevieweeId, r.IsDeleted, r.Rating })
                    .HasDatabaseName("IX_Review_RevieweeId_IsDeleted_Rating");
                
                // فهرس للبحث حسب تاريخ الإنشاء
                entity.HasIndex(r => r.CreatedAt)
                    .HasDatabaseName("IX_Review_CreatedAt");
            });
            
            modelBuilder.Entity<Rating>(entity =>
            {
                entity.HasIndex(r => r.RaterId)
                    .HasDatabaseName("IX_Rating_RaterId");
                
                entity.HasIndex(r => r.RatedUserId)
                    .HasDatabaseName("IX_Rating_RatedUserId");
                
                entity.HasIndex(r => r.RatingValue)
                    .HasDatabaseName("IX_Rating_RatingValue");
                
                entity.HasIndex(r => new { r.RatedUserId, r.RatingValue })
                    .HasDatabaseName("IX_Rating_RatedUserId_RatingValue");
            });
        }
        
        private static void ConfigureLogIndexes(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ActivityLog>(entity =>
            {
                entity.HasIndex(al => al.UserId)
                    .HasDatabaseName("IX_ActivityLog_UserId");
                
                entity.HasIndex(al => al.ActivityType)
                    .HasDatabaseName("IX_ActivityLog_ActivityType");
                
                entity.HasIndex(al => al.Timestamp)
                    .HasDatabaseName("IX_ActivityLog_Timestamp");
                
                entity.HasIndex(al => new { al.UserId, al.Timestamp })
                    .HasDatabaseName("IX_ActivityLog_UserId_Timestamp");
            });
            
            modelBuilder.Entity<ErrorLog>(entity =>
            {
                entity.HasIndex(el => el.Severity)
                    .HasDatabaseName("IX_ErrorLog_Severity");
                
                entity.HasIndex(el => el.OccurredAt)
                    .HasDatabaseName("IX_ErrorLog_OccurredAt");
                
                entity.HasIndex(el => new { el.Severity, el.OccurredAt })
                    .HasDatabaseName("IX_ErrorLog_Severity_OccurredAt");
            });
            
            modelBuilder.Entity<SystemLog>(entity =>
            {
                entity.HasIndex(sl => sl.LogLevel)
                    .HasDatabaseName("IX_SystemLog_LogLevel");
                
                entity.HasIndex(sl => sl.Timestamp)
                    .HasDatabaseName("IX_SystemLog_Timestamp");
            });
        }
        
        private static void ConfigureSubscriptionIndexes(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Subscription>(entity =>
            {
                entity.HasIndex(s => s.UserId)
                    .HasDatabaseName("IX_Subscription_UserId");
                
                entity.HasIndex(s => s.PlanType)
                    .HasDatabaseName("IX_Subscription_PlanType");
                
                entity.HasIndex(s => s.Status)
                    .HasDatabaseName("IX_Subscription_Status");
                
                entity.HasIndex(s => s.StartDate)
                    .HasDatabaseName("IX_Subscription_StartDate");
                
                entity.HasIndex(s => s.EndDate)
                    .HasDatabaseName("IX_Subscription_EndDate");
                
                entity.HasIndex(s => new { s.UserId, s.Status })
                    .HasDatabaseName("IX_Subscription_UserId_Status");
                
                entity.HasIndex(s => new { s.Status, s.EndDate })
                    .HasDatabaseName("IX_Subscription_Status_EndDate");
            });
            
            modelBuilder.Entity<UserWallet>(entity =>
            {
                entity.HasIndex(uw => uw.UserId)
                    .IsUnique()
                    .HasDatabaseName("IX_UserWallet_UserId_Unique");
                
                entity.HasIndex(uw => uw.Balance)
                    .HasDatabaseName("IX_UserWallet_Balance");
            });
        }
        
        private static void ConfigureAdditionalIndexes(ModelBuilder modelBuilder)
        {
            // Category Indexes
            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasIndex(c => c.CategoryName)
                    .HasDatabaseName("IX_Category_CategoryName");
                
                entity.HasIndex(c => c.IsDeleted)
                    .HasDatabaseName("IX_Category_IsDeleted");
            });
            
            // Tag Indexes
            modelBuilder.Entity<Tag>(entity =>
            {
                entity.HasIndex(t => t.TagName)
                    .IsUnique()
                    .HasDatabaseName("IX_Tag_TagName_Unique");
            });
            
            // Skill Indexes
            modelBuilder.Entity<Skill>(entity =>
            {
                entity.HasIndex(s => s.SkillName)
                    .IsUnique()
                    .HasDatabaseName("IX_Skill_SkillName_Unique");
            });
            
            // Favorite Indexes
            modelBuilder.Entity<Favorite>(entity =>
            {
                entity.HasIndex(f => f.UserId)
                    .HasDatabaseName("IX_Favorite_UserId");
                
                entity.HasIndex(f => new { f.UserId, f.ItemType, f.ItemId })
                    .IsUnique()
                    .HasDatabaseName("IX_Favorite_UserId_ItemType_ItemId_Unique");
            });
            
            // SavedJob Indexes
            modelBuilder.Entity<SavedJob>(entity =>
            {
                entity.HasIndex(sj => sj.UserId)
                    .HasDatabaseName("IX_SavedJob_UserId");
                
                entity.HasIndex(sj => sj.JobId)
                    .HasDatabaseName("IX_SavedJob_JobId");
                
                entity.HasIndex(sj => new { sj.UserId, sj.JobId })
                    .IsUnique()
                    .HasDatabaseName("IX_SavedJob_UserId_JobId_Unique");
            });
            
            // SavedFreelancer Indexes
            modelBuilder.Entity<SavedFreelancer>(entity =>
            {
                entity.HasIndex(sf => sf.UserId)
                    .HasDatabaseName("IX_SavedFreelancer_UserId");
                
                entity.HasIndex(sf => sf.FreelancerId)
                    .HasDatabaseName("IX_SavedFreelancer_FreelancerId");
                
                entity.HasIndex(sf => new { sf.UserId, sf.FreelancerId })
                    .IsUnique()
                    .HasDatabaseName("IX_SavedFreelancer_UserId_FreelancerId_Unique");
            });
            
            // BlockedUser Indexes
            modelBuilder.Entity<BlockedUser>(entity =>
            {
                entity.HasIndex(bu => bu.BlockerId)
                    .HasDatabaseName("IX_BlockedUser_BlockerId");
                
                entity.HasIndex(bu => bu.BlockedId)
                    .HasDatabaseName("IX_BlockedUser_BlockedId");
                
                entity.HasIndex(bu => new { bu.BlockerId, bu.BlockedId })
                    .IsUnique()
                    .HasDatabaseName("IX_BlockedUser_BlockerId_BlockedId_Unique");
            });
            
            // RefreshToken Indexes
            modelBuilder.Entity<RefreshToken>(entity =>
            {
                entity.HasIndex(rt => rt.UserId)
                    .HasDatabaseName("IX_RefreshToken_UserId");
                
                entity.HasIndex(rt => rt.Token)
                    .IsUnique()
                    .HasDatabaseName("IX_RefreshToken_Token_Unique");
                
                entity.HasIndex(rt => rt.ExpiresAt)
                    .HasDatabaseName("IX_RefreshToken_ExpiresAt");
                
                entity.HasIndex(rt => new { rt.UserId, rt.IsRevoked })
                    .HasDatabaseName("IX_RefreshToken_UserId_IsRevoked");
            });
            
            // Report Indexes
            modelBuilder.Entity<Report>(entity =>
            {
                entity.HasIndex(r => r.ReporterId)
                    .HasDatabaseName("IX_Report_ReporterId");
                
                entity.HasIndex(r => r.ReportedUserId)
                    .HasDatabaseName("IX_Report_ReportedUserId");
                
                entity.HasIndex(r => r.Status)
                    .HasDatabaseName("IX_Report_Status");
                
                entity.HasIndex(r => r.ReportType)
                    .HasDatabaseName("IX_Report_ReportType");
                
                entity.HasIndex(r => new { r.Status, r.CreatedAt })
                    .HasDatabaseName("IX_Report_Status_CreatedAt");
            });
            
            // Dispute Indexes
            modelBuilder.Entity<Dispute>(entity =>
            {
                entity.HasIndex(d => d.ProjectId)
                    .HasDatabaseName("IX_Dispute_ProjectId");
                
                entity.HasIndex(d => d.RaisedByUserId)
                    .HasDatabaseName("IX_Dispute_RaisedByUserId");
                
                entity.HasIndex(d => d.Status)
                    .HasDatabaseName("IX_Dispute_Status");
                
                entity.HasIndex(d => new { d.Status, d.RaisedAt })
                    .HasDatabaseName("IX_Dispute_Status_RaisedAt");
            });
            
            // Announcement Indexes
            modelBuilder.Entity<Announcement>(entity =>
            {
                entity.HasIndex(a => a.IsActive)
                    .HasDatabaseName("IX_Announcement_IsActive");
                
                entity.HasIndex(a => a.StartDate)
                    .HasDatabaseName("IX_Announcement_StartDate");
                
                entity.HasIndex(a => a.EndDate)
                    .HasDatabaseName("IX_Announcement_EndDate");
                
                entity.HasIndex(a => new { a.IsActive, a.StartDate, a.EndDate })
                    .HasDatabaseName("IX_Announcement_IsActive_StartDate_EndDate");
            });
            
            // PromoCode Indexes
            modelBuilder.Entity<PromoCode>(entity =>
            {
                entity.HasIndex(pc => pc.Code)
                    .IsUnique()
                    .HasDatabaseName("IX_PromoCode_Code_Unique");
                
                entity.HasIndex(pc => pc.IsActive)
                    .HasDatabaseName("IX_PromoCode_IsActive");
                
                entity.HasIndex(pc => pc.ExpiryDate)
                    .HasDatabaseName("IX_PromoCode_ExpiryDate");
                
                entity.HasIndex(pc => new { pc.IsActive, pc.ExpiryDate })
                    .HasDatabaseName("IX_PromoCode_IsActive_ExpiryDate");
            });
        }
    }
}
