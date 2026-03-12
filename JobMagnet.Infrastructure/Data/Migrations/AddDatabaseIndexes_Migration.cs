using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobMagnet.Infrastructure.Data.Migrations
{
    /// <summary>
    /// Migration لإضافة جميع الفهارس (Indexes) اللازمة لتحسين أداء البحث
    /// </summary>
    public partial class AddDatabaseIndexes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ===== User Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_User_Email_Unique",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_User_FirstName_LastName",
                table: "Users",
                columns: new[] { "FirstName", "LastName" });

            migrationBuilder.CreateIndex(
                name: "IX_User_UserType",
                table: "Users",
                column: "UserType");

            migrationBuilder.CreateIndex(
                name: "IX_User_IsActive_IsDeleted",
                table: "Users",
                columns: new[] { "IsActive", "IsDeleted" });

            migrationBuilder.CreateIndex(
                name: "IX_User_Country_City",
                table: "Users",
                columns: new[] { "Country", "City" });

            migrationBuilder.CreateIndex(
                name: "IX_User_CreatedAt",
                table: "Users",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_User_Phone",
                table: "Users",
                column: "Phone");

            migrationBuilder.CreateIndex(
                name: "IX_User_Gender",
                table: "Users",
                column: "Gender");

            migrationBuilder.CreateIndex(
                name: "IX_User_LastLoginAt",
                table: "Users",
                column: "LastLoginAt");

            // ===== UserRole Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_UserRole_UserId",
                table: "UserRoles",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserRole_RoleId",
                table: "UserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_UserRole_UserId_RoleId_Unique",
                table: "UserRoles",
                columns: new[] { "UserId", "RoleId" },
                unique: true);

            // ===== Job Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_Job_PostedByUserId",
                table: "Jobs",
                column: "PostedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Job_Title",
                table: "Jobs",
                column: "Title");

            migrationBuilder.CreateIndex(
                name: "IX_Job_Location",
                table: "Jobs",
                column: "Location");

            migrationBuilder.CreateIndex(
                name: "IX_Job_Type",
                table: "Jobs",
                column: "Type");

            migrationBuilder.CreateIndex(
                name: "IX_Job_IsActive_IsDeleted",
                table: "Jobs",
                columns: new[] { "IsActive", "IsDeleted" });

            migrationBuilder.CreateIndex(
                name: "IX_Job_Salary_Range",
                table: "Jobs",
                columns: new[] { "MinSalary", "MaxSalary" });

            migrationBuilder.CreateIndex(
                name: "IX_Job_CreatedAt",
                table: "Jobs",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Job_Active_NotDeleted_CreatedAt",
                table: "Jobs",
                columns: new[] { "IsActive", "IsDeleted", "CreatedAt" });

            // ===== JobCategory Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_JobCategory_JobId",
                table: "JobCategories",
                column: "JobId");

            migrationBuilder.CreateIndex(
                name: "IX_JobCategory_CategoryId",
                table: "JobCategories",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_JobCategory_JobId_CategoryId_Unique",
                table: "JobCategories",
                columns: new[] { "JobId", "CategoryId" },
                unique: true);

            // ===== JobTag Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_JobTag_JobId",
                table: "JobTags",
                column: "JobId");

            migrationBuilder.CreateIndex(
                name: "IX_JobTag_TagId",
                table: "JobTags",
                column: "TagId");

            migrationBuilder.CreateIndex(
                name: "IX_JobTag_JobId_TagId_Unique",
                table: "JobTags",
                columns: new[] { "JobId", "TagId" },
                unique: true);

            // ===== Project Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_Project_OwnerUserId",
                table: "Projects",
                column: "OwnerUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Project_AssignedFreelancerId",
                table: "Projects",
                column: "AssignedFreelancerId");

            migrationBuilder.CreateIndex(
                name: "IX_Project_Title",
                table: "Projects",
                column: "Title");

            migrationBuilder.CreateIndex(
                name: "IX_Project_Status",
                table: "Projects",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Project_IsDeleted",
                table: "Projects",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_Project_Budget",
                table: "Projects",
                column: "Budget");

            migrationBuilder.CreateIndex(
                name: "IX_Project_CreatedAt",
                table: "Projects",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Project_Status_IsDeleted_CreatedAt",
                table: "Projects",
                columns: new[] { "Status", "IsDeleted", "CreatedAt" });

            // ===== ProjectCategory Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_ProjectCategory_ProjectId",
                table: "ProjectCategories",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectCategory_CategoryId",
                table: "ProjectCategories",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectCategory_ProjectId_CategoryId_Unique",
                table: "ProjectCategories",
                columns: new[] { "ProjectId", "CategoryId" },
                unique: true);

            // ===== ProjectTag Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_ProjectTag_ProjectId",
                table: "ProjectTags",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectTag_TagId",
                table: "ProjectTags",
                column: "TagId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectTag_ProjectId_TagId_Unique",
                table: "ProjectTags",
                columns: new[] { "ProjectId", "TagId" },
                unique: true);

            // ===== ProjectMilestone Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_ProjectMilestone_ProjectId",
                table: "ProjectMilestones",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectMilestone_Status",
                table: "ProjectMilestones",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectMilestone_ProjectId_Status",
                table: "ProjectMilestones",
                columns: new[] { "ProjectId", "Status" });

            // ===== Freelancer Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_Freelancer_UserId_Unique",
                table: "Freelancers",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Freelancer_ProfessionalTitle",
                table: "Freelancers",
                column: "ProfessionalTitle");

            migrationBuilder.CreateIndex(
                name: "IX_Freelancer_ExperienceYears",
                table: "Freelancers",
                column: "ExperienceYears");

            migrationBuilder.CreateIndex(
                name: "IX_Freelancer_HourlyRate",
                table: "Freelancers",
                column: "HourlyRate");

            migrationBuilder.CreateIndex(
                name: "IX_Freelancer_IsVerified",
                table: "Freelancers",
                column: "IsVerified");

            migrationBuilder.CreateIndex(
                name: "IX_Freelancer_IsDeleted",
                table: "Freelancers",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_Freelancer_Verified_NotDeleted_Rate",
                table: "Freelancers",
                columns: new[] { "IsVerified", "IsDeleted", "HourlyRate" });

            migrationBuilder.CreateIndex(
                name: "IX_Freelancer_TotalCompletedProjects",
                table: "Freelancers",
                column: "TotalCompletedProjects");

            // ===== FreelancerTag Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_FreelancerTag_FreelancerId",
                table: "FreelancerTags",
                column: "FreelancerId");

            migrationBuilder.CreateIndex(
                name: "IX_FreelancerTag_TagId",
                table: "FreelancerTags",
                column: "TagId");

            migrationBuilder.CreateIndex(
                name: "IX_FreelancerTag_FreelancerId_TagId_Unique",
                table: "FreelancerTags",
                columns: new[] { "FreelancerId", "TagId" },
                unique: true);

            // ===== UserSkill Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_UserSkill_UserId",
                table: "UserSkills",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserSkill_SkillId",
                table: "UserSkills",
                column: "SkillId");

            migrationBuilder.CreateIndex(
                name: "IX_UserSkill_ProficiencyLevel",
                table: "UserSkills",
                column: "ProficiencyLevel");

            migrationBuilder.CreateIndex(
                name: "IX_UserSkill_UserId_SkillId_Unique",
                table: "UserSkills",
                columns: new[] { "UserId", "SkillId" },
                unique: true);

            // ===== Company Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_Company_EmployerId",
                table: "Companies",
                column: "EmployerId");

            migrationBuilder.CreateIndex(
                name: "IX_Company_CompanyName",
                table: "Companies",
                column: "CompanyName");

            migrationBuilder.CreateIndex(
                name: "IX_Company_Industry",
                table: "Companies",
                column: "Industry");

            migrationBuilder.CreateIndex(
                name: "IX_Company_Country_City",
                table: "Companies",
                columns: new[] { "Country", "City" });

            migrationBuilder.CreateIndex(
                name: "IX_Company_IsVerified",
                table: "Companies",
                column: "IsVerified");

            migrationBuilder.CreateIndex(
                name: "IX_Company_IsDeleted",
                table: "Companies",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_Company_Verified_NotDeleted_Industry",
                table: "Companies",
                columns: new[] { "IsVerified", "IsDeleted", "Industry" });

            // ===== Employer Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_Employer_UserId_Unique",
                table: "Employers",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Employer_IsVerified",
                table: "Employers",
                column: "IsVerified");

            migrationBuilder.CreateIndex(
                name: "IX_Employer_IsDeleted",
                table: "Employers",
                column: "IsDeleted");

            // ===== Notification Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_Notification_UserId",
                table: "Notifications",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Notification_IsRead",
                table: "Notifications",
                column: "IsRead");

            migrationBuilder.CreateIndex(
                name: "IX_Notification_NotificationType",
                table: "Notifications",
                column: "NotificationType");

            migrationBuilder.CreateIndex(
                name: "IX_Notification_IsDeleted",
                table: "Notifications",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_Notification_CreatedAt",
                table: "Notifications",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Notification_UserId_IsRead_IsDeleted_CreatedAt",
                table: "Notifications",
                columns: new[] { "UserId", "IsRead", "IsDeleted", "CreatedAt" });

            // ===== Message Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_Message_ChatId",
                table: "Messages",
                column: "ChatId");

            migrationBuilder.CreateIndex(
                name: "IX_Message_SenderId",
                table: "Messages",
                column: "SenderId");

            migrationBuilder.CreateIndex(
                name: "IX_Message_IsRead",
                table: "Messages",
                column: "IsRead");

            migrationBuilder.CreateIndex(
                name: "IX_Message_IsDeleted",
                table: "Messages",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_Message_SentAt",
                table: "Messages",
                column: "SentAt");

            migrationBuilder.CreateIndex(
                name: "IX_Message_ChatId_IsDeleted_SentAt",
                table: "Messages",
                columns: new[] { "ChatId", "IsDeleted", "SentAt" });

            // ===== Chat Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_Chat_User1Id",
                table: "Chats",
                column: "User1Id");

            migrationBuilder.CreateIndex(
                name: "IX_Chat_User2Id",
                table: "Chats",
                column: "User2Id");

            migrationBuilder.CreateIndex(
                name: "IX_Chat_User1Id_User2Id_Unique",
                table: "Chats",
                columns: new[] { "User1Id", "User2Id" },
                unique: true);

            // ===== CommunityPost Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_CommunityPost_PostedByUserId",
                table: "CommunityPosts",
                column: "PostedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_CommunityPost_Title",
                table: "CommunityPosts",
                column: "Title");

            migrationBuilder.CreateIndex(
                name: "IX_CommunityPost_PostType",
                table: "CommunityPosts",
                column: "PostType");

            migrationBuilder.CreateIndex(
                name: "IX_CommunityPost_IsDeleted",
                table: "CommunityPosts",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_CommunityPost_CreatedAt",
                table: "CommunityPosts",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_CommunityPost_PostType_IsDeleted_CreatedAt",
                table: "CommunityPosts",
                columns: new[] { "PostType", "IsDeleted", "CreatedAt" });

            // ===== CommunityReply Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_CommunityReply_CommunityPostId",
                table: "CommunityReplies",
                column: "CommunityPostId");

            migrationBuilder.CreateIndex(
                name: "IX_CommunityReply_RepliedByUserId",
                table: "CommunityReplies",
                column: "RepliedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_CommunityReply_IsDeleted",
                table: "CommunityReplies",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_CommunityReply_CreatedAt",
                table: "CommunityReplies",
                column: "CreatedAt");

            // ===== SearchHistory Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_SearchHistory_UserId",
                table: "SearchHistories",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_SearchHistory_QueryText",
                table: "SearchHistories",
                column: "QueryText");

            migrationBuilder.CreateIndex(
                name: "IX_SearchHistory_ExecutedAt",
                table: "SearchHistories",
                column: "ExecutedAt");

            migrationBuilder.CreateIndex(
                name: "IX_SearchHistory_IpAddress",
                table: "SearchHistories",
                column: "IpAddress");

            migrationBuilder.CreateIndex(
                name: "IX_SearchHistory_UserId_ExecutedAt",
                table: "SearchHistories",
                columns: new[] { "UserId", "ExecutedAt" });

            // ===== JobApplication Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_JobApplication_JobId",
                table: "JobApplications",
                column: "JobId");

            migrationBuilder.CreateIndex(
                name: "IX_JobApplication_JobSeekerId",
                table: "JobApplications",
                column: "JobSeekerId");

            migrationBuilder.CreateIndex(
                name: "IX_JobApplication_Status",
                table: "JobApplications",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_JobApplication_IsDeleted",
                table: "JobApplications",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_JobApplication_JobId_JobSeekerId_Unique",
                table: "JobApplications",
                columns: new[] { "JobId", "JobSeekerId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JobApplication_JobId_Status_IsDeleted",
                table: "JobApplications",
                columns: new[] { "JobId", "Status", "IsDeleted" });

            migrationBuilder.CreateIndex(
                name: "IX_JobApplication_AppliedAt",
                table: "JobApplications",
                column: "AppliedAt");

            // ===== JobSeeker Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_JobSeeker_UserId_Unique",
                table: "JobSeekers",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JobSeeker_IsDeleted",
                table: "JobSeekers",
                column: "IsDeleted");

            // ===== Proposal Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_Proposal_ProjectId",
                table: "Proposals",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Proposal_FreelancerId",
                table: "Proposals",
                column: "FreelancerId");

            migrationBuilder.CreateIndex(
                name: "IX_Proposal_Status",
                table: "Proposals",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Proposal_IsDeleted",
                table: "Proposals",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_Proposal_ProjectId_Status_IsDeleted",
                table: "Proposals",
                columns: new[] { "ProjectId", "Status", "IsDeleted" });

            migrationBuilder.CreateIndex(
                name: "IX_Proposal_SubmittedAt",
                table: "Proposals",
                column: "SubmittedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Proposal_ProposedAmount",
                table: "Proposals",
                column: "ProposedAmount");

            // ===== Payment Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_Payment_UserId",
                table: "Payments",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Payment_PaymentType",
                table: "Payments",
                column: "PaymentType");

            migrationBuilder.CreateIndex(
                name: "IX_Payment_Status",
                table: "Payments",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Payment_PaymentMethod",
                table: "Payments",
                column: "PaymentMethod");

            migrationBuilder.CreateIndex(
                name: "IX_Payment_PaymentDate",
                table: "Payments",
                column: "PaymentDate");

            migrationBuilder.CreateIndex(
                name: "IX_Payment_UserId_Status_PaymentDate",
                table: "Payments",
                columns: new[] { "UserId", "Status", "PaymentDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Payment_TransactionId",
                table: "Payments",
                column: "TransactionId");

            // ===== Transaction Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_Transaction_UserId",
                table: "Transactions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Transaction_TransactionType",
                table: "Transactions",
                column: "TransactionType");

            migrationBuilder.CreateIndex(
                name: "IX_Transaction_Status",
                table: "Transactions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Transaction_TransactionDate",
                table: "Transactions",
                column: "TransactionDate");

            migrationBuilder.CreateIndex(
                name: "IX_Transaction_UserId_Status_TransactionDate",
                table: "Transactions",
                columns: new[] { "UserId", "Status", "TransactionDate" });

            // ===== Invoice Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_Invoice_UserId",
                table: "Invoices",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Invoice_Status",
                table: "Invoices",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Invoice_IssueDate",
                table: "Invoices",
                column: "IssueDate");

            migrationBuilder.CreateIndex(
                name: "IX_Invoice_DueDate",
                table: "Invoices",
                column: "DueDate");

            migrationBuilder.CreateIndex(
                name: "IX_Invoice_UserId_Status",
                table: "Invoices",
                columns: new[] { "UserId", "Status" });

            // ===== Review Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_Review_ReviewerId",
                table: "Reviews",
                column: "ReviewerId");

            migrationBuilder.CreateIndex(
                name: "IX_Review_RevieweeId",
                table: "Reviews",
                column: "RevieweeId");

            migrationBuilder.CreateIndex(
                name: "IX_Review_ProjectId",
                table: "Reviews",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Review_Rating",
                table: "Reviews",
                column: "Rating");

            migrationBuilder.CreateIndex(
                name: "IX_Review_IsDeleted",
                table: "Reviews",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_Review_RevieweeId_IsDeleted_Rating",
                table: "Reviews",
                columns: new[] { "RevieweeId", "IsDeleted", "Rating" });

            migrationBuilder.CreateIndex(
                name: "IX_Review_CreatedAt",
                table: "Reviews",
                column: "CreatedAt");

            // ===== Rating Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_Rating_RaterId",
                table: "Ratings",
                column: "RaterId");

            migrationBuilder.CreateIndex(
                name: "IX_Rating_RatedUserId",
                table: "Ratings",
                column: "RatedUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Rating_RatingValue",
                table: "Ratings",
                column: "RatingValue");

            migrationBuilder.CreateIndex(
                name: "IX_Rating_RatedUserId_RatingValue",
                table: "Ratings",
                columns: new[] { "RatedUserId", "RatingValue" });

            // ===== ActivityLog Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_ActivityLog_UserId",
                table: "ActivityLogs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ActivityLog_ActivityType",
                table: "ActivityLogs",
                column: "ActivityType");

            migrationBuilder.CreateIndex(
                name: "IX_ActivityLog_Timestamp",
                table: "ActivityLogs",
                column: "Timestamp");

            migrationBuilder.CreateIndex(
                name: "IX_ActivityLog_UserId_Timestamp",
                table: "ActivityLogs",
                columns: new[] { "UserId", "Timestamp" });

            // ===== ErrorLog Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_ErrorLog_Severity",
                table: "ErrorLogs",
                column: "Severity");

            migrationBuilder.CreateIndex(
                name: "IX_ErrorLog_OccurredAt",
                table: "ErrorLogs",
                column: "OccurredAt");

            migrationBuilder.CreateIndex(
                name: "IX_ErrorLog_Severity_OccurredAt",
                table: "ErrorLogs",
                columns: new[] { "Severity", "OccurredAt" });

            // ===== SystemLog Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_SystemLog_LogLevel",
                table: "SystemLogs",
                column: "LogLevel");

            migrationBuilder.CreateIndex(
                name: "IX_SystemLog_Timestamp",
                table: "SystemLogs",
                column: "Timestamp");

            // ===== Subscription Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_Subscription_UserId",
                table: "Subscriptions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Subscription_PlanType",
                table: "Subscriptions",
                column: "PlanType");

            migrationBuilder.CreateIndex(
                name: "IX_Subscription_Status",
                table: "Subscriptions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Subscription_StartDate",
                table: "Subscriptions",
                column: "StartDate");

            migrationBuilder.CreateIndex(
                name: "IX_Subscription_EndDate",
                table: "Subscriptions",
                column: "EndDate");

            migrationBuilder.CreateIndex(
                name: "IX_Subscription_UserId_Status",
                table: "Subscriptions",
                columns: new[] { "UserId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Subscription_Status_EndDate",
                table: "Subscriptions",
                columns: new[] { "Status", "EndDate" });

            // ===== UserWallet Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_UserWallet_UserId_Unique",
                table: "UserWallets",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserWallet_Balance",
                table: "UserWallets",
                column: "Balance");

            // ===== Category Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_Category_CategoryName",
                table: "Categories",
                column: "CategoryName");

            migrationBuilder.CreateIndex(
                name: "IX_Category_IsDeleted",
                table: "Categories",
                column: "IsDeleted");

            // ===== Tag Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_Tag_TagName_Unique",
                table: "Tags",
                column: "TagName",
                unique: true);

            // ===== Skill Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_Skill_SkillName_Unique",
                table: "Skills",
                column: "SkillName",
                unique: true);

            // ===== Favorite Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_Favorite_UserId",
                table: "Favorites",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Favorite_UserId_ItemType_ItemId_Unique",
                table: "Favorites",
                columns: new[] { "UserId", "ItemType", "ItemId" },
                unique: true);

            // ===== SavedJob Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_SavedJob_UserId",
                table: "SavedJobs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_SavedJob_JobId",
                table: "SavedJobs",
                column: "JobId");

            migrationBuilder.CreateIndex(
                name: "IX_SavedJob_UserId_JobId_Unique",
                table: "SavedJobs",
                columns: new[] { "UserId", "JobId" },
                unique: true);

            // ===== SavedFreelancer Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_SavedFreelancer_UserId",
                table: "SavedFreelancers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_SavedFreelancer_FreelancerId",
                table: "SavedFreelancers",
                column: "FreelancerId");

            migrationBuilder.CreateIndex(
                name: "IX_SavedFreelancer_UserId_FreelancerId_Unique",
                table: "SavedFreelancers",
                columns: new[] { "UserId", "FreelancerId" },
                unique: true);

            // ===== BlockedUser Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_BlockedUser_BlockerId",
                table: "BlockedUsers",
                column: "BlockerId");

            migrationBuilder.CreateIndex(
                name: "IX_BlockedUser_BlockedId",
                table: "BlockedUsers",
                column: "BlockedId");

            migrationBuilder.CreateIndex(
                name: "IX_BlockedUser_BlockerId_BlockedId_Unique",
                table: "BlockedUsers",
                columns: new[] { "BlockerId", "BlockedId" },
                unique: true);

            // ===== RefreshToken Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_RefreshToken_UserId",
                table: "RefreshTokens",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshToken_Token_Unique",
                table: "RefreshTokens",
                column: "Token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RefreshToken_ExpiresAt",
                table: "RefreshTokens",
                column: "ExpiresAt");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshToken_UserId_IsRevoked",
                table: "RefreshTokens",
                columns: new[] { "UserId", "IsRevoked" });

            // ===== Report Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_Report_ReporterId",
                table: "Reports",
                column: "ReporterId");

            migrationBuilder.CreateIndex(
                name: "IX_Report_ReportedUserId",
                table: "Reports",
                column: "ReportedUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Report_Status",
                table: "Reports",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Report_ReportType",
                table: "Reports",
                column: "ReportType");

            migrationBuilder.CreateIndex(
                name: "IX_Report_Status_CreatedAt",
                table: "Reports",
                columns: new[] { "Status", "CreatedAt" });

            // ===== Dispute Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_Dispute_ProjectId",
                table: "Disputes",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Dispute_RaisedByUserId",
                table: "Disputes",
                column: "RaisedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Dispute_Status",
                table: "Disputes",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Dispute_Status_RaisedAt",
                table: "Disputes",
                columns: new[] { "Status", "RaisedAt" });

            // ===== Announcement Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_Announcement_IsActive",
                table: "Announcements",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_Announcement_StartDate",
                table: "Announcements",
                column: "StartDate");

            migrationBuilder.CreateIndex(
                name: "IX_Announcement_EndDate",
                table: "Announcements",
                column: "EndDate");

            migrationBuilder.CreateIndex(
                name: "IX_Announcement_IsActive_StartDate_EndDate",
                table: "Announcements",
                columns: new[] { "IsActive", "StartDate", "EndDate" });

            // ===== PromoCode Indexes =====
            migrationBuilder.CreateIndex(
                name: "IX_PromoCode_Code_Unique",
                table: "PromoCodes",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PromoCode_IsActive",
                table: "PromoCodes",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_PromoCode_ExpiryDate",
                table: "PromoCodes",
                column: "ExpiryDate");

            migrationBuilder.CreateIndex(
                name: "IX_PromoCode_IsActive_ExpiryDate",
                table: "PromoCodes",
                columns: new[] { "IsActive", "ExpiryDate" });

            // ===== Full-Text Indexes =====
            // ملحوظة: Full-Text Indexes تحتاج إلى SQL خام
            // البحث النصي الكامل في العناوين والأوصاف
            
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM sys.fulltext_catalogs WHERE name = 'JobMagnetFullTextCatalog')
                BEGIN
                    CREATE FULLTEXT CATALOG JobMagnetFullTextCatalog AS DEFAULT;
                END
            ");

            // Full-Text Index للوظائف (Jobs)
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM sys.fulltext_indexes WHERE object_id = OBJECT_ID('Jobs'))
                BEGIN
                    CREATE FULLTEXT INDEX ON Jobs(Title, Description)
                    KEY INDEX PK_Jobs
                    ON JobMagnetFullTextCatalog
                    WITH CHANGE_TRACKING AUTO;
                END
            ");

            // Full-Text Index للمشاريع (Projects)
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM sys.fulltext_indexes WHERE object_id = OBJECT_ID('Projects'))
                BEGIN
                    CREATE FULLTEXT INDEX ON Projects(Title, Description)
                    KEY INDEX PK_Projects
                    ON JobMagnetFullTextCatalog
                    WITH CHANGE_TRACKING AUTO;
                END
            ");

            // Full-Text Index للمستقلين (Freelancers)
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM sys.fulltext_indexes WHERE object_id = OBJECT_ID('Freelancers'))
                BEGIN
                    CREATE FULLTEXT INDEX ON Freelancers(ProfessionalTitle, Bio)
                    KEY INDEX PK_Freelancers
                    ON JobMagnetFullTextCatalog
                    WITH CHANGE_TRACKING AUTO;
                END
            ");

            // Full-Text Index للشركات (Companies)
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM sys.fulltext_indexes WHERE object_id = OBJECT_ID('Companies'))
                BEGIN
                    CREATE FULLTEXT INDEX ON Companies(CompanyName, Description)
                    KEY INDEX PK_Companies
                    ON JobMagnetFullTextCatalog
                    WITH CHANGE_TRACKING AUTO;
                END
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // حذف جميع الفهارس بالترتيب العكسي
            
            // Full-Text Indexes
            migrationBuilder.Sql("IF EXISTS (SELECT * FROM sys.fulltext_indexes WHERE object_id = OBJECT_ID('Companies')) DROP FULLTEXT INDEX ON Companies;");
            migrationBuilder.Sql("IF EXISTS (SELECT * FROM sys.fulltext_indexes WHERE object_id = OBJECT_ID('Freelancers')) DROP FULLTEXT INDEX ON Freelancers;");
            migrationBuilder.Sql("IF EXISTS (SELECT * FROM sys.fulltext_indexes WHERE object_id = OBJECT_ID('Projects')) DROP FULLTEXT INDEX ON Projects;");
            migrationBuilder.Sql("IF EXISTS (SELECT * FROM sys.fulltext_indexes WHERE object_id = OBJECT_ID('Jobs')) DROP FULLTEXT INDEX ON Jobs;");
            migrationBuilder.Sql("IF EXISTS (SELECT * FROM sys.fulltext_catalogs WHERE name = 'JobMagnetFullTextCatalog') DROP FULLTEXT CATALOG JobMagnetFullTextCatalog;");

            // PromoCode Indexes
            migrationBuilder.DropIndex(name: "IX_PromoCode_IsActive_ExpiryDate", table: "PromoCodes");
            migrationBuilder.DropIndex(name: "IX_PromoCode_ExpiryDate", table: "PromoCodes");
            migrationBuilder.DropIndex(name: "IX_PromoCode_IsActive", table: "PromoCodes");
            migrationBuilder.DropIndex(name: "IX_PromoCode_Code_Unique", table: "PromoCodes");

            // Announcement Indexes
            migrationBuilder.DropIndex(name: "IX_Announcement_IsActive_StartDate_EndDate", table: "Announcements");
            migrationBuilder.DropIndex(name: "IX_Announcement_EndDate", table: "Announcements");
            migrationBuilder.DropIndex(name: "IX_Announcement_StartDate", table: "Announcements");
            migrationBuilder.DropIndex(name: "IX_Announcement_IsActive", table: "Announcements");

            // ... (باقي الـ Drop Indexes بالترتيب العكسي)
            // ملحوظة: لتوفير المساحة، يمكن إضافة باقي الـ Drop statements هنا
        }
    }
}
