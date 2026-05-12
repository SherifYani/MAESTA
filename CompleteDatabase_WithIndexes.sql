-- =============================================
-- Script: إنشاء قاعدة بيانات JobMagnet كاملة مع جميع الفهارس
-- التاريخ: 2025-12-14
-- =============================================

-- إنشاء قاعدة البيانات
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'JobMagnetDB')
BEGIN
    CREATE DATABASE JobMagnetDB;
    PRINT 'تم إنشاء قاعدة البيانات JobMagnetDB';
END
ELSE
BEGIN
    PRINT 'قاعدة البيانات JobMagnetDB موجودة بالفعل';
END
GO

USE JobMagnetDB;
GO

PRINT 'بدء إنشاء الجداول...';
GO

-- =============================================
-- إنشاء الجداول الرئيسية
-- =============================================

-- جدول Users
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
BEGIN
    CREATE TABLE Users (
        UserId INT IDENTITY(1,1) PRIMARY KEY,
        Email NVARCHAR(100) NOT NULL,
        PasswordHash NVARCHAR(500) NOT NULL,
        FirstName NVARCHAR(50) NOT NULL,
        LastName NVARCHAR(50) NOT NULL,
        ProfilePictureUrl NVARCHAR(500) NULL,
        DateOfBirth DATETIMEOFFSET NULL,
        Gender NVARCHAR(20) NULL,
        Country NVARCHAR(100) NULL,
        City NVARCHAR(100) NULL,
        LinkedInUrl NVARCHAR(500) NULL,
        Phone NVARCHAR(20) NULL,
        IsPhoneVerified BIT NOT NULL DEFAULT 0,
        IsEmailVerified BIT NOT NULL DEFAULT 0,
        FailedLoginAttempts INT NOT NULL DEFAULT 0,
        LockoutEndDate DATETIMEOFFSET NULL,
        TwoFactorEnabled BIT NOT NULL DEFAULT 0,
        TwoFactorSecretKey NVARCHAR(200) NULL,
        UserType NVARCHAR(30) NULL,
        LastLoginAt DATETIMEOFFSET NULL,
        LastSeenAt DATETIMEOFFSET NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        IsDeleted BIT NOT NULL DEFAULT 0,
        CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CreatedBy INT NULL,
        UpdatedAt DATETIMEOFFSET NULL,
        UpdatedBy INT NULL,
        RowVersion ROWVERSION
    );
    PRINT 'تم إنشاء جدول Users';
END
GO

-- جدول Roles
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Roles' AND xtype='U')
BEGIN
    CREATE TABLE Roles (
        RoleId INT IDENTITY(1,1) PRIMARY KEY,
        RoleName NVARCHAR(50) NOT NULL,
        Description NVARCHAR(200) NULL,
        IsDeleted BIT NOT NULL DEFAULT 0,
        CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        RowVersion ROWVERSION
    );
    PRINT 'تم إنشاء جدول Roles';
END
GO

-- جدول UserRoles
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='UserRoles' AND xtype='U')
BEGIN
    CREATE TABLE UserRoles (
        UserRoleId INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NOT NULL,
        RoleId INT NOT NULL,
        AssignedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        FOREIGN KEY (UserId) REFERENCES Users(UserId),
        FOREIGN KEY (RoleId) REFERENCES Roles(RoleId)
    );
    PRINT 'تم إنشاء جدول UserRoles';
END
GO

-- جدول Categories
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Categories' AND xtype='U')
BEGIN
    CREATE TABLE Categories (
        CategoryId INT IDENTITY(1,1) PRIMARY KEY,
        CategoryName NVARCHAR(100) NOT NULL,
        Description NVARCHAR(500) NULL,
        IsDeleted BIT NOT NULL DEFAULT 0,
        CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        RowVersion ROWVERSION
    );
    PRINT 'تم إنشاء جدول Categories';
END
GO

-- جدول Tags
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Tags' AND xtype='U')
BEGIN
    CREATE TABLE Tags (
        TagId INT IDENTITY(1,1) PRIMARY KEY,
        TagName NVARCHAR(50) NOT NULL,
        IsDeleted BIT NOT NULL DEFAULT 0,
        CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        RowVersion ROWVERSION
    );
    PRINT 'تم إنشاء جدول Tags';
END
GO

-- جدول Skills
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Skills' AND xtype='U')
BEGIN
    CREATE TABLE Skills (
        SkillId INT IDENTITY(1,1) PRIMARY KEY,
        SkillName NVARCHAR(100) NOT NULL,
        CategoryId INT NULL,
        IsDeleted BIT NOT NULL DEFAULT 0,
        CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        RowVersion ROWVERSION
    );
    PRINT 'تم إنشاء جدول Skills';
END
GO

-- جدول Jobs
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Jobs' AND xtype='U')
BEGIN
    CREATE TABLE Jobs (
        JobId INT IDENTITY(1,1) PRIMARY KEY,
        PostedByUserId INT NOT NULL,
        Title NVARCHAR(200) NOT NULL,
        Description NVARCHAR(MAX) NOT NULL,
        Location NVARCHAR(200) NULL,
        [Type] NVARCHAR(50) NULL,
        MinSalary DECIMAL(18,2) NULL,
        MaxSalary DECIMAL(18,2) NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        IsDeleted BIT NOT NULL DEFAULT 0,
        CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CreatedBy INT NULL,
        UpdatedAt DATETIMEOFFSET NULL,
        UpdatedBy INT NULL,
        RowVersion ROWVERSION,
        FOREIGN KEY (PostedByUserId) REFERENCES Users(UserId),
        CONSTRAINT CK_Job_Salary_Range CHECK (MaxSalary IS NULL OR MinSalary IS NULL OR MaxSalary >= MinSalary)
    );
    PRINT 'تم إنشاء جدول Jobs';
END
GO

-- جدول JobCategories
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='JobCategories' AND xtype='U')
BEGIN
    CREATE TABLE JobCategories (
        JobCategoryId INT IDENTITY(1,1) PRIMARY KEY,
        JobId INT NOT NULL,
        CategoryId INT NOT NULL,
        FOREIGN KEY (JobId) REFERENCES Jobs(JobId),
        FOREIGN KEY (CategoryId) REFERENCES Categories(CategoryId)
    );
    PRINT 'تم إنشاء جدول JobCategories';
END
GO

-- جدول JobTags
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='JobTags' AND xtype='U')
BEGIN
    CREATE TABLE JobTags (
        JobTagId INT IDENTITY(1,1) PRIMARY KEY,
        JobId INT NOT NULL,
        TagId INT NOT NULL,
        FOREIGN KEY (JobId) REFERENCES Jobs(JobId),
        FOREIGN KEY (TagId) REFERENCES Tags(TagId)
    );
    PRINT 'تم إنشاء جدول JobTags';
END
GO

-- جدول Freelancers
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Freelancers' AND xtype='U')
BEGIN
    CREATE TABLE Freelancers (
        FreelancerId INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NOT NULL,
        FreelancerLevelId INT NULL,
        ProfessionalTitle NVARCHAR(100) NULL,
        ExperienceYears INT NULL,
        HourlyRate DECIMAL(18,2) NULL,
        Currency NVARCHAR(10) NULL,
        TotalCompletedProjects INT NOT NULL DEFAULT 0,
        PortfolioUrl NVARCHAR(500) NULL,
        Bio NVARCHAR(2000) NULL,
        DocumentVerificationUrl NVARCHAR(500) NULL,
        IsVerified BIT NOT NULL DEFAULT 0,
        LastActiveAt DATETIMEOFFSET NULL,
        IsDeleted BIT NOT NULL DEFAULT 0,
        CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CreatedBy INT NULL,
        UpdatedAt DATETIMEOFFSET NULL,
        UpdatedBy INT NULL,
        RowVersion ROWVERSION,
        FOREIGN KEY (UserId) REFERENCES Users(UserId)
    );
    PRINT 'تم إنشاء جدول Freelancers';
END
GO

-- جدول FreelancerTags
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='FreelancerTags' AND xtype='U')
BEGIN
    CREATE TABLE FreelancerTags (
        FreelancerTagId INT IDENTITY(1,1) PRIMARY KEY,
        FreelancerId INT NOT NULL,
        TagId INT NOT NULL,
        FOREIGN KEY (FreelancerId) REFERENCES Freelancers(FreelancerId),
        FOREIGN KEY (TagId) REFERENCES Tags(TagId)
    );
    PRINT 'تم إنشاء جدول FreelancerTags';
END
GO

-- جدول UserSkills
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='UserSkills' AND xtype='U')
BEGIN
    CREATE TABLE UserSkills (
        UserSkillId INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NOT NULL,
        SkillId INT NOT NULL,
        ProficiencyLevel NVARCHAR(20) NULL,
        YearsOfExperience INT NULL,
        FOREIGN KEY (UserId) REFERENCES Users(UserId),
        FOREIGN KEY (SkillId) REFERENCES Skills(SkillId)
    );
    PRINT 'تم إنشاء جدول UserSkills';
END
GO

-- جدول Employers
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Employers' AND xtype='U')
BEGIN
    CREATE TABLE Employers (
        EmployerId INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NOT NULL,
        CompanyId INT NULL,
        IsVerified BIT NOT NULL DEFAULT 0,
        IsDeleted BIT NOT NULL DEFAULT 0,
        CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CreatedBy INT NULL,
        UpdatedAt DATETIMEOFFSET NULL,
        UpdatedBy INT NULL,
        RowVersion ROWVERSION,
        FOREIGN KEY (UserId) REFERENCES Users(UserId)
    );
    PRINT 'تم إنشاء جدول Employers';
END
GO

-- جدول Companies
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Companies' AND xtype='U')
BEGIN
    CREATE TABLE Companies (
        CompanyId INT IDENTITY(1,1) PRIMARY KEY,
        EmployerId INT NOT NULL,
        CompanyName NVARCHAR(200) NOT NULL,
        Industry NVARCHAR(100) NULL,
        CompanySize NVARCHAR(50) NULL,
        CommercialRegistrationNumber NVARCHAR(100) NULL,
        CommercialRegistrationFileUrl NVARCHAR(500) NULL,
        Description NVARCHAR(2000) NULL,
        FoundedYear INT NULL,
        Country NVARCHAR(100) NULL,
        City NVARCHAR(100) NULL,
        Address NVARCHAR(500) NULL,
        Website NVARCHAR(200) NULL,
        LogoUrl NVARCHAR(500) NULL,
        IsVerified BIT NOT NULL DEFAULT 0,
        IsDeleted BIT NOT NULL DEFAULT 0,
        CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CreatedBy INT NULL,
        UpdatedAt DATETIMEOFFSET NULL,
        UpdatedBy INT NULL,
        RowVersion ROWVERSION,
        FOREIGN KEY (EmployerId) REFERENCES Employers(EmployerId)
    );
    PRINT 'تم إنشاء جدول Companies';
END
GO

-- جدول Projects
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Projects' AND xtype='U')
BEGIN
    CREATE TABLE Projects (
        ProjectId INT IDENTITY(1,1) PRIMARY KEY,
        OwnerUserId INT NOT NULL,
        AssignedFreelancerId INT NULL,
        Title NVARCHAR(200) NOT NULL,
        Description NVARCHAR(MAX) NOT NULL,
        Budget DECIMAL(18,2) NOT NULL,
        [Status] NVARCHAR(50) NOT NULL DEFAULT 'Draft',
        IsDeleted BIT NOT NULL DEFAULT 0,
        CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CreatedBy INT NULL,
        UpdatedAt DATETIMEOFFSET NULL,
        UpdatedBy INT NULL,
        RowVersion ROWVERSION,
        FOREIGN KEY (OwnerUserId) REFERENCES Users(UserId),
        FOREIGN KEY (AssignedFreelancerId) REFERENCES Freelancers(FreelancerId),
        CONSTRAINT CK_Project_Budget_Positive CHECK (Budget > 0)
    );
    PRINT 'تم إنشاء جدول Projects';
END
GO

-- جدول ProjectCategories
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ProjectCategories' AND xtype='U')
BEGIN
    CREATE TABLE ProjectCategories (
        ProjectCategoryId INT IDENTITY(1,1) PRIMARY KEY,
        ProjectId INT NOT NULL,
        CategoryId INT NOT NULL,
        FOREIGN KEY (ProjectId) REFERENCES Projects(ProjectId),
        FOREIGN KEY (CategoryId) REFERENCES Categories(CategoryId)
    );
    PRINT 'تم إنشاء جدول ProjectCategories';
END
GO

-- جدول ProjectTags
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ProjectTags' AND xtype='U')
BEGIN
    CREATE TABLE ProjectTags (
        ProjectTagId INT IDENTITY(1,1) PRIMARY KEY,
        ProjectId INT NOT NULL,
        TagId INT NOT NULL,
        FOREIGN KEY (ProjectId) REFERENCES Projects(ProjectId),
        FOREIGN KEY (TagId) REFERENCES Tags(TagId)
    );
    PRINT 'تم إنشاء جدول ProjectTags';
END
GO

-- جدول ProjectMilestones
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ProjectMilestones' AND xtype='U')
BEGIN
    CREATE TABLE ProjectMilestones (
        MilestoneId INT IDENTITY(1,1) PRIMARY KEY,
        ProjectId INT NOT NULL,
        Title NVARCHAR(200) NOT NULL,
        Description NVARCHAR(1000) NULL,
        Amount DECIMAL(18,2) NOT NULL,
        [Status] NVARCHAR(50) NOT NULL,
        DueDate DATETIMEOFFSET NULL,
        CompletedAt DATETIMEOFFSET NULL,
        FOREIGN KEY (ProjectId) REFERENCES Projects(ProjectId)
    );
    PRINT 'تم إنشاء جدول ProjectMilestones';
END
GO

-- جدول Proposals
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Proposals' AND xtype='U')
BEGIN
    CREATE TABLE Proposals (
        ProposalId INT IDENTITY(1,1) PRIMARY KEY,
        ProjectId INT NOT NULL,
        FreelancerId INT NOT NULL,
        ProposedAmount DECIMAL(18,2) NOT NULL,
        DeliveryTime INT NOT NULL,
        CoverLetter NVARCHAR(2000) NULL,
        [Status] NVARCHAR(50) NOT NULL,
        SubmittedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        IsDeleted BIT NOT NULL DEFAULT 0,
        CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        RowVersion ROWVERSION,
        FOREIGN KEY (ProjectId) REFERENCES Projects(ProjectId),
        FOREIGN KEY (FreelancerId) REFERENCES Freelancers(FreelancerId)
    );
    PRINT 'تم إنشاء جدول Proposals';
END
GO

-- جدول JobSeekers
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='JobSeekers' AND xtype='U')
BEGIN
    CREATE TABLE JobSeekers (
        JobSeekerId INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NOT NULL,
        ResumeUrl NVARCHAR(500) NULL,
        IsDeleted BIT NOT NULL DEFAULT 0,
        CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        RowVersion ROWVERSION,
        FOREIGN KEY (UserId) REFERENCES Users(UserId)
    );
    PRINT 'تم إنشاء جدول JobSeekers';
END
GO

-- جدول JobApplications
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='JobApplications' AND xtype='U')
BEGIN
    CREATE TABLE JobApplications (
        JobApplicationId INT IDENTITY(1,1) PRIMARY KEY,
        JobId INT NOT NULL,
        JobSeekerId INT NOT NULL,
        CoverLetter NVARCHAR(2000) NULL,
        ResumeUrl NVARCHAR(500) NULL,
        [Status] NVARCHAR(50) NOT NULL,
        AppliedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        IsDeleted BIT NOT NULL DEFAULT 0,
        CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        RowVersion ROWVERSION,
        FOREIGN KEY (JobId) REFERENCES Jobs(JobId),
        FOREIGN KEY (JobSeekerId) REFERENCES JobSeekers(JobSeekerId)
    );
    PRINT 'تم إنشاء جدول JobApplications';
END
GO

-- جدول Notifications
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Notifications' AND xtype='U')
BEGIN
    CREATE TABLE Notifications (
        NotificationId INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NOT NULL,
        Title NVARCHAR(200) NOT NULL,
        Message NVARCHAR(1000) NOT NULL,
        NotificationType NVARCHAR(50) NULL,
        RedirectUrl NVARCHAR(500) NULL,
        ImageUrl NVARCHAR(500) NULL,
        IsRead BIT NOT NULL DEFAULT 0,
        IsDeleted BIT NOT NULL DEFAULT 0,
        CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CreatedBy INT NULL,
        UpdatedAt DATETIMEOFFSET NULL,
        UpdatedBy INT NULL,
        RowVersion ROWVERSION,
        FOREIGN KEY (UserId) REFERENCES Users(UserId)
    );
    PRINT 'تم إنشاء جدول Notifications';
END
GO

-- جدول Chats
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Chats' AND xtype='U')
BEGIN
    CREATE TABLE Chats (
        ChatId INT IDENTITY(1,1) PRIMARY KEY,
        User1Id INT NOT NULL,
        User2Id INT NOT NULL,
        CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        FOREIGN KEY (User1Id) REFERENCES Users(UserId),
        FOREIGN KEY (User2Id) REFERENCES Users(UserId)
    );
    PRINT 'تم إنشاء جدول Chats';
END
GO

-- جدول Messages
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Messages' AND xtype='U')
BEGIN
    CREATE TABLE Messages (
        MessageId INT IDENTITY(1,1) PRIMARY KEY,
        ChatId INT NOT NULL,
        SenderId INT NOT NULL,
        Content NVARCHAR(MAX) NOT NULL,
        IsRead BIT NOT NULL DEFAULT 0,
        IsDeleted BIT NOT NULL DEFAULT 0,
        SentAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CreatedBy INT NULL,
        UpdatedAt DATETIMEOFFSET NULL,
        UpdatedBy INT NULL,
        RowVersion ROWVERSION,
        FOREIGN KEY (ChatId) REFERENCES Chats(ChatId)
    );
    PRINT 'تم إنشاء جدول Messages';
END
GO

-- جدول CommunityPosts
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CommunityPosts' AND xtype='U')
BEGIN
    CREATE TABLE CommunityPosts (
        CommunityPostId INT IDENTITY(1,1) PRIMARY KEY,
        PostedByUserId INT NOT NULL,
        Title NVARCHAR(300) NOT NULL,
        Content NVARCHAR(MAX) NOT NULL,
        PostType NVARCHAR(50) NULL,
        IsDeleted BIT NOT NULL DEFAULT 0,
        CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CreatedBy INT NULL,
        UpdatedAt DATETIMEOFFSET NULL,
        UpdatedBy INT NULL,
        RowVersion ROWVERSION,
        FOREIGN KEY (PostedByUserId) REFERENCES Users(UserId)
    );
    PRINT 'تم إنشاء جدول CommunityPosts';
END
GO

-- جدول CommunityReplies
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CommunityReplies' AND xtype='U')
BEGIN
    CREATE TABLE CommunityReplies (
        CommunityReplyId INT IDENTITY(1,1) PRIMARY KEY,
        CommunityPostId INT NOT NULL,
        RepliedByUserId INT NOT NULL,
        Content NVARCHAR(MAX) NOT NULL,
        IsDeleted BIT NOT NULL DEFAULT 0,
        CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        RowVersion ROWVERSION,
        FOREIGN KEY (CommunityPostId) REFERENCES CommunityPosts(CommunityPostId),
        FOREIGN KEY (RepliedByUserId) REFERENCES Users(UserId)
    );
    PRINT 'تم إنشاء جدول CommunityReplies';
END
GO

-- جدول SearchHistories
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='SearchHistories' AND xtype='U')
BEGIN
    CREATE TABLE SearchHistories (
        SearchId INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NULL,
        QueryText NVARCHAR(500) NOT NULL,
        Filters NVARCHAR(2000) NULL,
        ResultsCount INT NULL,
        ExecutedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        IpAddress NVARCHAR(45) NULL,
        FOREIGN KEY (UserId) REFERENCES Users(UserId)
    );
    PRINT 'تم إنشاء جدول SearchHistories';
END
GO

-- جدول Payments
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Payments' AND xtype='U')
BEGIN
    CREATE TABLE Payments (
        PaymentId INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NOT NULL,
        Amount DECIMAL(18,2) NOT NULL,
        PaymentType NVARCHAR(50) NULL,
        [Status] NVARCHAR(50) NOT NULL DEFAULT 'Pending',
        PaymentMethod NVARCHAR(50) NULL,
        TransactionId NVARCHAR(200) NULL,
        PaymentDate DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        FOREIGN KEY (UserId) REFERENCES Users(UserId),
        CONSTRAINT CK_Payment_Amount_Positive CHECK (Amount > 0)
    );
    PRINT 'تم إنشاء جدول Payments';
END
GO

-- جدول Transactions
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Transactions' AND xtype='U')
BEGIN
    CREATE TABLE Transactions (
        TransactionId INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NOT NULL,
        Amount DECIMAL(18,2) NOT NULL,
        TransactionType NVARCHAR(50) NULL,
        [Status] NVARCHAR(50) NOT NULL DEFAULT 'Pending',
        TransactionDate DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        Description NVARCHAR(500) NULL,
        FOREIGN KEY (UserId) REFERENCES Users(UserId),
        CONSTRAINT CK_Transaction_Amount_Positive CHECK (Amount > 0)
    );
    PRINT 'تم إنشاء جدول Transactions';
END
GO

-- جد ول Invoices
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Invoices' AND xtype='U')
BEGIN
    CREATE TABLE Invoices (
        InvoiceId INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NOT NULL,
        InvoiceNumber NVARCHAR(50) NOT NULL,
        Amount DECIMAL(18,2) NOT NULL,
        [Status] NVARCHAR(50) NOT NULL,
        IssueDate DATETIMEOFFSET NOT NULL,
        DueDate DATETIMEOFFSET NULL,
        FOREIGN KEY (UserId) REFERENCES Users(UserId)
    );
    PRINT 'تم إنشاء جدول Invoices';
END
GO

-- جدول Reviews
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Reviews' AND xtype='U')
BEGIN
    CREATE TABLE Reviews (
        ReviewId INT IDENTITY(1,1) PRIMARY KEY,
        ReviewerId INT NOT NULL,
        RevieweeId INT NOT NULL,
        ProjectId INT NULL,
        Rating DECIMAL(3,2) NOT NULL,
        Comment NVARCHAR(2000) NULL,
        IsDeleted BIT NOT NULL DEFAULT 0,
        CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        RowVersion ROWVERSION,
        FOREIGN KEY (ReviewerId) REFERENCES Users(UserId),
        FOREIGN KEY (RevieweeId) REFERENCES Users(UserId),
        FOREIGN KEY (ProjectId) REFERENCES Projects(ProjectId)
    );
    PRINT 'تم إنشاء جدول Reviews';
END
GO

-- جدول Ratings
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Ratings' AND xtype='U')
BEGIN
    CREATE TABLE Ratings (
        RatingId INT IDENTITY(1,1) PRIMARY KEY,
        RaterId INT NOT NULL,
        RatedUserId INT NOT NULL,
        RatingValue DECIMAL(3,2) NOT NULL,
        CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        FOREIGN KEY (RaterId) REFERENCES Users(UserId),
        FOREIGN KEY (RatedUserId) REFERENCES Users(UserId)
    );
    PRINT 'تم إنشاء جدول Ratings';
END
GO

-- جدول ActivityLogs
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ActivityLogs' AND xtype='U')
BEGIN
    CREATE TABLE ActivityLogs (
        ActivityLogId INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NOT NULL,
        ActivityType NVARCHAR(100) NOT NULL,
        Description NVARCHAR(500) NULL,
        [Timestamp] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        FOREIGN KEY (UserId) REFERENCES Users(UserId)
    );
    PRINT 'تم إنشاء جدول ActivityLogs';
END
GO

-- جدول ErrorLogs
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ErrorLogs' AND xtype='U')
BEGIN
    CREATE TABLE ErrorLogs (
        ErrorLogId INT IDENTITY(1,1) PRIMARY KEY,
        ErrorMessage NVARCHAR(MAX) NOT NULL,
        StackTrace NVARCHAR(MAX) NULL,
        Severity NVARCHAR(50) NOT NULL,
        OccurredAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
    );
    PRINT 'تم إنشاء جدول ErrorLogs';
END
GO

-- جدول SystemLogs
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='SystemLogs' AND xtype='U')
BEGIN
    CREATE TABLE SystemLogs (
        SystemLogId INT IDENTITY(1,1) PRIMARY KEY,
        LogMessage NVARCHAR(MAX) NOT NULL,
        LogLevel NVARCHAR(50) NOT NULL,
        [Timestamp] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
    );
    PRINT 'تم إنشاء جدول SystemLogs';
END
GO

-- جدول Subscriptions
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Subscriptions' AND xtype='U')
BEGIN
    CREATE TABLE Subscriptions (
        SubscriptionId INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NOT NULL,
        PlanType NVARCHAR(50) NOT NULL,
        [Status] NVARCHAR(50) NOT NULL,
        StartDate DATETIMEOFFSET NOT NULL,
        EndDate DATETIMEOFFSET NULL,
        FOREIGN KEY (UserId) REFERENCES Users(UserId)
    );
    PRINT 'تم إنشاء جدول Subscriptions';
END
GO

-- جدول UserWallets
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='UserWallets' AND xtype='U')
BEGIN
    CREATE TABLE UserWallets (
        WalletId INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NOT NULL,
        Balance DECIMAL(18,2) NOT NULL DEFAULT 0,
        Currency NVARCHAR(10) NOT NULL DEFAULT 'USD',
        FOREIGN KEY (UserId) REFERENCES Users(UserId)
    );
    PRINT 'تم إنشاء جدول UserWallets';
END
GO

-- جدول Favorites
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Favorites' AND xtype='U')
BEGIN
    CREATE TABLE Favorites (
        FavoriteId INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NOT NULL,
        ItemType NVARCHAR(50) NOT NULL,
        ItemId INT NOT NULL,
        AddedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        FOREIGN KEY (UserId) REFERENCES Users(UserId)
    );
    PRINT 'تم إنشاء جدول Favorites';
END
GO

-- جدول SavedJobs
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='SavedJobs' AND xtype='U')
BEGIN
    CREATE TABLE SavedJobs (
        SavedJobId INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NOT NULL,
        JobId INT NOT NULL,
        SavedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        FOREIGN KEY (UserId) REFERENCES Users(UserId),
        FOREIGN KEY (JobId) REFERENCES Jobs(JobId)
    );
    PRINT 'تم إنشاء جدول SavedJobs';
END
GO

-- جدول SavedFreelancers
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='SavedFreelancers' AND xtype='U')
BEGIN
    CREATE TABLE SavedFreelancers (
        SavedFreelancerId INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NOT NULL,
        FreelancerId INT NOT NULL,
        SavedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        FOREIGN KEY (UserId) REFERENCES Users(UserId),
        FOREIGN KEY (FreelancerId) REFERENCES Freelancers(FreelancerId)
    );
    PRINT 'تم إنشاء جدول SavedFreelancers';
END
GO

-- جدول BlockedUsers
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='BlockedUsers' AND xtype='U')
BEGIN
    CREATE TABLE BlockedUsers (
        BlockedUserId INT IDENTITY(1,1) PRIMARY KEY,
        BlockerId INT NOT NULL,
        BlockedId INT NOT NULL,
        BlockedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        Reason NVARCHAR(500) NULL,
        FOREIGN KEY (BlockerId) REFERENCES Users(UserId),
        FOREIGN KEY (BlockedId) REFERENCES Users(UserId)
    );
    PRINT 'تم إنشاء جدول BlockedUsers';
END
GO

-- جدول RefreshTokens
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='RefreshTokens' AND xtype='U')
BEGIN
    CREATE TABLE RefreshTokens (
        RefreshTokenId INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NOT NULL,
        Token NVARCHAR(500) NOT NULL,
        ExpiresAt DATETIMEOFFSET NOT NULL,
        CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        IsRevoked BIT NOT NULL DEFAULT 0,
        FOREIGN KEY (UserId) REFERENCES Users(UserId)
    );
    PRINT 'تم إنشاء جدول RefreshTokens';
END
GO

-- جدول Reports
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Reports' AND xtype='U')
BEGIN
    CREATE TABLE Reports (
        ReportId INT IDENTITY(1,1) PRIMARY KEY,
        ReporterId INT NOT NULL,
        ReportedUserId INT NULL,
        ReportType NVARCHAR(50) NOT NULL,
        Reason NVARCHAR(1000) NOT NULL,
        [Status] NVARCHAR(50) NOT NULL,
        CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        FOREIGN KEY (ReporterId) REFERENCES Users(UserId),
        FOREIGN KEY (ReportedUserId) REFERENCES Users(UserId)
    );
    PRINT 'تم إنشاء جدول Reports';
END
GO

-- جدول Disputes
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Disputes' AND xtype='U')
BEGIN
    CREATE TABLE Disputes (
        DisputeId INT IDENTITY(1,1) PRIMARY KEY,
        ProjectId INT NOT NULL,
        RaisedByUserId INT NOT NULL,
        Reason NVARCHAR(2000) NOT NULL,
        [Status] NVARCHAR(50) NOT NULL,
        RaisedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        FOREIGN KEY (ProjectId) REFERENCES Projects(ProjectId),
        FOREIGN KEY (RaisedByUserId) REFERENCES Users(UserId)
    );
    PRINT 'تم إنشاء جدول Disputes';
END
GO

-- جدول Announcements
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Announcements' AND xtype='U')
BEGIN
    CREATE TABLE Announcements (
        AnnouncementId INT IDENTITY(1,1) PRIMARY KEY,
        Title NVARCHAR(200) NOT NULL,
        Content NVARCHAR(MAX) NOT NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        StartDate DATETIMEOFFSET NOT NULL,
        EndDate DATETIMEOFFSET NULL
    );
    PRINT 'تم إنشاء جدول Announcements';
END
GO

-- جدول PromoCodes
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='PromoCodes' AND xtype='U')
BEGIN
    CREATE TABLE PromoCodes (
        PromoCodeId INT IDENTITY(1,1) PRIMARY KEY,
        Code NVARCHAR(50) NOT NULL,
        DiscountPercentage DECIMAL(5,2) NULL,
        DiscountAmount DECIMAL(18,2) NULL,
        MaxUsageCount INT NULL,
        CurrentUsageCount INT NOT NULL DEFAULT 0,
        IsActive BIT NOT NULL DEFAULT 1,
        ExpiryDate DATETIMEOFFSET NULL
    );
    PRINT 'تم إنشاء جدول PromoCodes';
END
GO

PRINT 'تم الانتهاء من إنشاء جميع الجداول!';
GO

-- الآن نبدأ بإنشاء الفهارس
PRINT '===========================================';
PRINT 'بدء إنشاء الفهارس (Indexes)...';
PRINT '===========================================';
GO
-- =============================================
-- Script: ط¥ظ†ط´ط§ط، ط¬ظ…ظٹط¹ ط§ظ„ظپظ‡ط§ط±ط³ (Indexes) ظ„ظ‚ط§ط¹ط¯ط© ط¨ظٹط§ظ†ط§طھ JobMagnet
-- ط§ظ„ظˆطµظپ: ظ‡ط°ط§ ط§ظ„ط³ظƒط±ظٹط¨طھ ظٹظ†ط´ط¦ ط¬ظ…ظٹط¹ ط§ظ„ظپظ‡ط§ط±ط³ ط§ظ„ظ„ط§ط²ظ…ط© ظ„طھط­ط³ظٹظ† ط£ط¯ط§ط، ط§ظ„ط¨ط­ط« ظˆط§ظ„ط§ط³طھط¹ظ„ط§ظ…
-- ط§ظ„طھط§ط±ظٹط®: 2025-12-14
-- ط§ظ„ط¥طµط¯ط§ط±: 1.0.0
-- =============================================

USE [JobMagnetDB]; -- ط؛ظٹظ‘ط± ط§ط³ظ… ظ‚ط§ط¹ط¯ط© ط§ظ„ط¨ظٹط§ظ†ط§طھ ط­ط³ط¨ ط§ظ„ط­ط§ط¬ط©
GO

PRINT 'ط¨ط¯ط، ط¥ظ†ط´ط§ط، ط§ظ„ظپظ‡ط§ط±ط³...';
GO

-- =============================================
-- User Indexes
-- =============================================
PRINT 'ط¥ظ†ط´ط§ط، ظپظ‡ط§ط±ط³ Users...';

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_User_Email_Unique' AND object_id = OBJECT_ID('Users'))
    CREATE UNIQUE NONCLUSTERED INDEX IX_User_Email_Unique ON Users(Email);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_User_FirstName_LastName' AND object_id = OBJECT_ID('Users'))
    CREATE NONCLUSTERED INDEX IX_User_FirstName_LastName ON Users(FirstName, LastName);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_User_UserType' AND object_id = OBJECT_ID('Users'))
    CREATE NONCLUSTERED INDEX IX_User_UserType ON Users(UserType);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_User_IsActive_IsDeleted' AND object_id = OBJECT_ID('Users'))
    CREATE NONCLUSTERED INDEX IX_User_IsActive_IsDeleted ON Users(IsActive, IsDeleted);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_User_Country_City' AND object_id = OBJECT_ID('Users'))
    CREATE NONCLUSTERED INDEX IX_User_Country_City ON Users(Country, City);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_User_CreatedAt' AND object_id = OBJECT_ID('Users'))
    CREATE NONCLUSTERED INDEX IX_User_CreatedAt ON Users(CreatedAt);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_User_Phone' AND object_id = OBJECT_ID('Users'))
    CREATE NONCLUSTERED INDEX IX_User_Phone ON Users(Phone);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_User_Gender' AND object_id = OBJECT_ID('Users'))
    CREATE NONCLUSTERED INDEX IX_User_Gender ON Users(Gender);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_User_LastLoginAt' AND object_id = OBJECT_ID('Users'))
    CREATE NONCLUSTERED INDEX IX_User_LastLoginAt ON Users(LastLoginAt);

PRINT 'طھظ… ط¥ظ†ط´ط§ط، ظپظ‡ط§ط±ط³ Users ط¨ظ†ط¬ط§ط­.';
GO

-- =============================================
-- Job Indexes
-- =============================================
PRINT 'ط¥ظ†ط´ط§ط، ظپظ‡ط§ط±ط³ Jobs...';

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Job_PostedByUserId' AND object_id = OBJECT_ID('Jobs'))
    CREATE NONCLUSTERED INDEX IX_Job_PostedByUserId ON Jobs(PostedByUserId);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Job_Title' AND object_id = OBJECT_ID('Jobs'))
    CREATE NONCLUSTERED INDEX IX_Job_Title ON Jobs(Title);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Job_Location' AND object_id = OBJECT_ID('Jobs'))
    CREATE NONCLUSTERED INDEX IX_Job_Location ON Jobs(Location);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Job_Type' AND object_id = OBJECT_ID('Jobs'))
    CREATE NONCLUSTERED INDEX IX_Job_Type ON Jobs([Type]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Job_IsActive_IsDeleted' AND object_id = OBJECT_ID('Jobs'))
    CREATE NONCLUSTERED INDEX IX_Job_IsActive_IsDeleted ON Jobs(IsActive, IsDeleted);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Job_Salary_Range' AND object_id = OBJECT_ID('Jobs'))
    CREATE NONCLUSTERED INDEX IX_Job_Salary_Range ON Jobs(MinSalary, MaxSalary);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Job_CreatedAt' AND object_id = OBJECT_ID('Jobs'))
    CREATE NONCLUSTERED INDEX IX_Job_CreatedAt ON Jobs(CreatedAt);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Job_Active_NotDeleted_CreatedAt' AND object_id = OBJECT_ID('Jobs'))
    CREATE NONCLUSTERED INDEX IX_Job_Active_NotDeleted_CreatedAt ON Jobs(IsActive, IsDeleted, CreatedAt);

PRINT 'طھظ… ط¥ظ†ط´ط§ط، ظپظ‡ط§ط±ط³ Jobs ط¨ظ†ط¬ط§ط­.';
GO

-- =============================================
-- Project Indexes
-- =============================================
PRINT 'ط¥ظ†ط´ط§ط، ظپظ‡ط§ط±ط³ Projects...';

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Project_OwnerUserId' AND object_id = OBJECT_ID('Projects'))
    CREATE NONCLUSTERED INDEX IX_Project_OwnerUserId ON Projects(OwnerUserId);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Project_AssignedFreelancerId' AND object_id = OBJECT_ID('Projects'))
    CREATE NONCLUSTERED INDEX IX_Project_AssignedFreelancerId ON Projects(AssignedFreelancerId);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Project_Title' AND object_id = OBJECT_ID('Projects'))
    CREATE NONCLUSTERED INDEX IX_Project_Title ON Projects(Title);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Project_Status' AND object_id = OBJECT_ID('Projects'))
    CREATE NONCLUSTERED INDEX IX_Project_Status ON Projects([Status]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Project_IsDeleted' AND object_id = OBJECT_ID('Projects'))
    CREATE NONCLUSTERED INDEX IX_Project_IsDeleted ON Projects(IsDeleted);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Project_Budget' AND object_id = OBJECT_ID('Projects'))
    CREATE NONCLUSTERED INDEX IX_Project_Budget ON Projects(Budget);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Project_CreatedAt' AND object_id = OBJECT_ID('Projects'))
    CREATE NONCLUSTERED INDEX IX_Project_CreatedAt ON Projects(CreatedAt);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Project_Status_IsDeleted_CreatedAt' AND object_id = OBJECT_ID('Projects'))
    CREATE NONCLUSTERED INDEX IX_Project_Status_IsDeleted_CreatedAt ON Projects([Status], IsDeleted, CreatedAt);

PRINT 'طھظ… ط¥ظ†ط´ط§ط، ظپظ‡ط§ط±ط³ Projects ط¨ظ†ط¬ط§ط­.';
GO

-- =============================================
-- Freelancer Indexes
-- =============================================
PRINT 'ط¥ظ†ط´ط§ط، ظپظ‡ط§ط±ط³ Freelancers...';

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Freelancer_UserId_Unique' AND object_id = OBJECT_ID('Freelancers'))
    CREATE UNIQUE NONCLUSTERED INDEX IX_Freelancer_UserId_Unique ON Freelancers(UserId);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Freelancer_ProfessionalTitle' AND object_id = OBJECT_ID('Freelancers'))
    CREATE NONCLUSTERED INDEX IX_Freelancer_ProfessionalTitle ON Freelancers(ProfessionalTitle);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Freelancer_ExperienceYears' AND object_id = OBJECT_ID('Freelancers'))
    CREATE NONCLUSTERED INDEX IX_Freelancer_ExperienceYears ON Freelancers(ExperienceYears);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Freelancer_HourlyRate' AND object_id = OBJECT_ID('Freelancers'))
    CREATE NONCLUSTERED INDEX IX_Freelancer_HourlyRate ON Freelancers(HourlyRate);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Freelancer_IsVerified' AND object_id = OBJECT_ID('Freelancers'))
    CREATE NONCLUSTERED INDEX IX_Freelancer_IsVerified ON Freelancers(IsVerified);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Freelancer_IsDeleted' AND object_id = OBJECT_ID('Freelancers'))
    CREATE NONCLUSTERED INDEX IX_Freelancer_IsDeleted ON Freelancers(IsDeleted);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Freelancer_Verified_NotDeleted_Rate' AND object_id = OBJECT_ID('Freelancers'))
    CREATE NONCLUSTERED INDEX IX_Freelancer_Verified_NotDeleted_Rate ON Freelancers(IsVerified, IsDeleted, HourlyRate);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Freelancer_TotalCompletedProjects' AND object_id = OBJECT_ID('Freelancers'))
    CREATE NONCLUSTERED INDEX IX_Freelancer_TotalCompletedProjects ON Freelancers(TotalCompletedProjects);

PRINT 'طھظ… ط¥ظ†ط´ط§ط، ظپظ‡ط§ط±ط³ Freelancers ط¨ظ†ط¬ط§ط­.';
GO

-- =============================================
-- Company Indexes
-- =============================================
PRINT 'ط¥ظ†ط´ط§ط، ظپظ‡ط§ط±ط³ Companies...';

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Company_EmployerId' AND object_id = OBJECT_ID('Companies'))
    CREATE NONCLUSTERED INDEX IX_Company_EmployerId ON Companies(EmployerId);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Company_CompanyName' AND object_id = OBJECT_ID('Companies'))
    CREATE NONCLUSTERED INDEX IX_Company_CompanyName ON Companies(CompanyName);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Company_Industry' AND object_id = OBJECT_ID('Companies'))
    CREATE NONCLUSTERED INDEX IX_Company_Industry ON Companies(Industry);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Company_Country_City' AND object_id = OBJECT_ID('Companies'))
    CREATE NONCLUSTERED INDEX IX_Company_Country_City ON Companies(Country, City);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Company_IsVerified' AND object_id = OBJECT_ID('Companies'))
    CREATE NONCLUSTERED INDEX IX_Company_IsVerified ON Companies(IsVerified);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Company_IsDeleted' AND object_id = OBJECT_ID('Companies'))
    CREATE NONCLUSTERED INDEX IX_Company_IsDeleted ON Companies(IsDeleted);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Company_Verified_NotDeleted_Industry' AND object_id = OBJECT_ID('Companies'))
    CREATE NONCLUSTERED INDEX IX_Company_Verified_NotDeleted_Industry ON Companies(IsVerified, IsDeleted, Industry);

PRINT 'طھظ… ط¥ظ†ط´ط§ط، ظپظ‡ط§ط±ط³ Companies ط¨ظ†ط¬ط§ط­.';
GO

-- =============================================
-- Notification Indexes
-- =============================================
PRINT 'ط¥ظ†ط´ط§ط، ظپظ‡ط§ط±ط³ Notifications...';

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Notification_UserId' AND object_id = OBJECT_ID('Notifications'))
    CREATE NONCLUSTERED INDEX IX_Notification_UserId ON Notifications(UserId);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Notification_IsRead' AND object_id = OBJECT_ID('Notifications'))
    CREATE NONCLUSTERED INDEX IX_Notification_IsRead ON Notifications(IsRead);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Notification_NotificationType' AND object_id = OBJECT_ID('Notifications'))
    CREATE NONCLUSTERED INDEX IX_Notification_NotificationType ON Notifications(NotificationType);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Notification_IsDeleted' AND object_id = OBJECT_ID('Notifications'))
    CREATE NONCLUSTERED INDEX IX_Notification_IsDeleted ON Notifications(IsDeleted);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Notification_CreatedAt' AND object_id = OBJECT_ID('Notifications'))
    CREATE NONCLUSTERED INDEX IX_Notification_CreatedAt ON Notifications(CreatedAt);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Notification_UserId_IsRead_IsDeleted_CreatedAt' AND object_id = OBJECT_ID('Notifications'))
    CREATE NONCLUSTERED INDEX IX_Notification_UserId_IsRead_IsDeleted_CreatedAt ON Notifications(UserId, IsRead, IsDeleted, CreatedAt);

PRINT 'طھظ… ط¥ظ†ط´ط§ط، ظپظ‡ط§ط±ط³ Notifications ط¨ظ†ط¬ط§ط­.';
GO

-- =============================================
-- Message Indexes
-- =============================================
PRINT 'ط¥ظ†ط´ط§ط، ظپظ‡ط§ط±ط³ Messages...';

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Message_ChatId' AND object_id = OBJECT_ID('Messages'))
    CREATE NONCLUSTERED INDEX IX_Message_ChatId ON Messages(ChatId);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Message_SenderId' AND object_id = OBJECT_ID('Messages'))
    CREATE NONCLUSTERED INDEX IX_Message_SenderId ON Messages(SenderId);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Message_IsRead' AND object_id = OBJECT_ID('Messages'))
    CREATE NONCLUSTERED INDEX IX_Message_IsRead ON Messages(IsRead);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Message_IsDeleted' AND object_id = OBJECT_ID('Messages'))
    CREATE NONCLUSTERED INDEX IX_Message_IsDeleted ON Messages(IsDeleted);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Message_SentAt' AND object_id = OBJECT_ID('Messages'))
    CREATE NONCLUSTERED INDEX IX_Message_SentAt ON Messages(SentAt);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Message_ChatId_IsDeleted_SentAt' AND object_id = OBJECT_ID('Messages'))
    CREATE NONCLUSTERED INDEX IX_Message_ChatId_IsDeleted_SentAt ON Messages(ChatId, IsDeleted, SentAt);

PRINT 'طھظ… ط¥ظ†ط´ط§ط، ظپظ‡ط§ط±ط³ Messages ط¨ظ†ط¬ط§ط­.';
GO

-- =============================================
-- SearchHistory Indexes
-- =============================================
PRINT 'ط¥ظ†ط´ط§ط، ظپظ‡ط§ط±ط³ SearchHistories...';

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SearchHistory_UserId' AND object_id = OBJECT_ID('SearchHistories'))
    CREATE NONCLUSTERED INDEX IX_SearchHistory_UserId ON SearchHistories(UserId);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SearchHistory_QueryText' AND object_id = OBJECT_ID('SearchHistories'))
    CREATE NONCLUSTERED INDEX IX_SearchHistory_QueryText ON SearchHistories(QueryText);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SearchHistory_ExecutedAt' AND object_id = OBJECT_ID('SearchHistories'))
    CREATE NONCLUSTERED INDEX IX_SearchHistory_ExecutedAt ON SearchHistories(ExecutedAt);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SearchHistory_IpAddress' AND object_id = OBJECT_ID('SearchHistories'))
    CREATE NONCLUSTERED INDEX IX_SearchHistory_IpAddress ON SearchHistories(IpAddress);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SearchHistory_UserId_ExecutedAt' AND object_id = OBJECT_ID('SearchHistories'))
    CREATE NONCLUSTERED INDEX IX_SearchHistory_UserId_ExecutedAt ON SearchHistories(UserId, ExecutedAt);

PRINT 'طھظ… ط¥ظ†ط´ط§ط، ظپظ‡ط§ط±ط³ SearchHistories ط¨ظ†ط¬ط§ط­.';
GO

-- =============================================
-- Payment Indexes
-- =============================================
PRINT 'ط¥ظ†ط´ط§ط، ظپظ‡ط§ط±ط³ Payments...';

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Payment_UserId' AND object_id = OBJECT_ID('Payments'))
    CREATE NONCLUSTERED INDEX IX_Payment_UserId ON Payments(UserId);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Payment_Status' AND object_id = OBJECT_ID('Payments'))
    CREATE NONCLUSTERED INDEX IX_Payment_Status ON Payments([Status]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Payment_PaymentDate' AND object_id = OBJECT_ID('Payments'))
    CREATE NONCLUSTERED INDEX IX_Payment_PaymentDate ON Payments(PaymentDate);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Payment_UserId_Status_PaymentDate' AND object_id = OBJECT_ID('Payments'))
    CREATE NONCLUSTERED INDEX IX_Payment_UserId_Status_PaymentDate ON Payments(UserId, [Status], PaymentDate);

PRINT 'طھظ… ط¥ظ†ط´ط§ط، ظپظ‡ط§ط±ط³ Payments ط¨ظ†ط¬ط§ط­.';
GO

-- =============================================
-- Full-Text Indexes
-- =============================================
PRINT 'ط¥ظ†ط´ط§ط، Full-Text Catalog...';

IF NOT EXISTS (SELECT * FROM sys.fulltext_catalogs WHERE name = 'JobMagnetFullTextCatalog')
BEGIN
    CREATE FULLTEXT CATALOG JobMagnetFullTextCatalog AS DEFAULT;
    PRINT 'طھظ… ط¥ظ†ط´ط§ط، Full-Text Catalog ط¨ظ†ط¬ط§ط­.';
END
ELSE
BEGIN
    PRINT 'Full-Text Catalog ظ…ظˆط¬ظˆط¯ ط¨ط§ظ„ظپط¹ظ„.';
END
GO

PRINT 'ط¥ظ†ط´ط§ط، Full-Text Indexes...';

-- Full-Text Index ظ„ظ„ظˆط¸ط§ط¦ظپ
IF NOT EXISTS (SELECT * FROM sys.fulltext_indexes WHERE object_id = OBJECT_ID('Jobs'))
BEGIN
    CREATE FULLTEXT INDEX ON Jobs(Title, Description)
    KEY INDEX PK_Jobs
    ON JobMagnetFullTextCatalog
    WITH CHANGE_TRACKING AUTO;
    PRINT 'طھظ… ط¥ظ†ط´ط§ط، Full-Text Index ظ„ظ€ Jobs.';
END

-- Full-Text Index ظ„ظ„ظ…ط´ط§ط±ظٹط¹
IF NOT EXISTS (SELECT * FROM sys.fulltext_indexes WHERE object_id = OBJECT_ID('Projects'))
BEGIN
    CREATE FULLTEXT INDEX ON Projects(Title, Description)
    KEY INDEX PK_Projects
    ON JobMagnetFullTextCatalog
    WITH CHANGE_TRACKING AUTO;
    PRINT 'طھظ… ط¥ظ†ط´ط§ط، Full-Text Index ظ„ظ€ Projects.';
END

-- Full-Text Index ظ„ظ„ظ…ط³طھظ‚ظ„ظٹظ†
IF NOT EXISTS (SELECT * FROM sys.fulltext_indexes WHERE object_id = OBJECT_ID('Freelancers'))
BEGIN
    CREATE FULLTEXT INDEX ON Freelancers(ProfessionalTitle, Bio)
    KEY INDEX PK_Freelancers
    ON JobMagnetFullTextCatalog
    WITH CHANGE_TRACKING AUTO;
    PRINT 'طھظ… ط¥ظ†ط´ط§ط، Full-Text Index ظ„ظ€ Freelancers.';
END

-- Full-Text Index ظ„ظ„ط´ط±ظƒط§طھ
IF NOT EXISTS (SELECT * FROM sys.fulltext_indexes WHERE object_id = OBJECT_ID('Companies'))
BEGIN
    CREATE FULLTEXT INDEX ON Companies(CompanyName, Description)
    KEY INDEX PK_Companies
    ON JobMagnetFullTextCatalog
    WITH CHANGE_TRACKING AUTO;
    PRINT 'طھظ… ط¥ظ†ط´ط§ط، Full-Text Index ظ„ظ€ Companies.';
END
GO

-- =============================================
-- ط§ظ„طھط­ظ‚ظ‚ ظ…ظ† ط§ظ„ظپظ‡ط§ط±ط³ ط§ظ„ظ…ظڈظ†ط´ط£ط©
-- =============================================
PRINT '==================================';
PRINT 'ظ‚ط§ط¦ظ…ط© ط¨ط¬ظ…ظٹط¹ ط§ظ„ظپظ‡ط§ط±ط³ ط§ظ„ظ…ظڈظ†ط´ط£ط©:';
PRINT '==================================';

SELECT 
    t.name AS TableName,
    i.name AS IndexName,
    i.type_desc AS IndexType,
    CASE WHEN i.is_unique = 1 THEN 'Yes' ELSE 'No' END AS IsUnique
FROM sys.indexes i
INNER JOIN sys.tables t ON i.object_id = t.object_id
WHERE i.name LIKE 'IX_%'
ORDER BY t.name, i.name;
GO

PRINT '==================================';
PRINT 'طھظ… ط§ظ„ط§ظ†طھظ‡ط§ط، ظ…ظ† ط¥ظ†ط´ط§ط، ط¬ظ…ظٹط¹ ط§ظ„ظپظ‡ط§ط±ط³ ط¨ظ†ط¬ط§ط­! âœ…';
PRINT '==================================';
GO
