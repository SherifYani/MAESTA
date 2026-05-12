-- =============================================
-- Script: إنشاء جميع الفهارس (Indexes) لقاعدة بيانات JobMagnet
-- الوصف: هذا السكريبت ينشئ جميع الفهارس اللازمة لتحسين أداء البحث والاستعلام
-- التاريخ: 2025-12-14
-- الإصدار: 1.0.0
-- =============================================

USE [JobMagnetDB]; -- غيّر اسم قاعدة البيانات حسب الحاجة
GO

PRINT 'بدء إنشاء الفهارس...';
GO

-- =============================================
-- User Indexes
-- =============================================
PRINT 'إنشاء فهارس Users...';

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

PRINT 'تم إنشاء فهارس Users بنجاح.';
GO

-- =============================================
-- Job Indexes
-- =============================================
PRINT 'إنشاء فهارس Jobs...';

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

PRINT 'تم إنشاء فهارس Jobs بنجاح.';
GO

-- =============================================
-- Project Indexes
-- =============================================
PRINT 'إنشاء فهارس Projects...';

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

PRINT 'تم إنشاء فهارس Projects بنجاح.';
GO

-- =============================================
-- Freelancer Indexes
-- =============================================
PRINT 'إنشاء فهارس Freelancers...';

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

PRINT 'تم إنشاء فهارس Freelancers بنجاح.';
GO

-- =============================================
-- Company Indexes
-- =============================================
PRINT 'إنشاء فهارس Companies...';

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

PRINT 'تم إنشاء فهارس Companies بنجاح.';
GO

-- =============================================
-- Notification Indexes
-- =============================================
PRINT 'إنشاء فهارس Notifications...';

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

PRINT 'تم إنشاء فهارس Notifications بنجاح.';
GO

-- =============================================
-- Message Indexes
-- =============================================
PRINT 'إنشاء فهارس Messages...';

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

PRINT 'تم إنشاء فهارس Messages بنجاح.';
GO

-- =============================================
-- SearchHistory Indexes
-- =============================================
PRINT 'إنشاء فهارس SearchHistories...';

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

PRINT 'تم إنشاء فهارس SearchHistories بنجاح.';
GO

-- =============================================
-- Payment Indexes
-- =============================================
PRINT 'إنشاء فهارس Payments...';

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Payment_UserId' AND object_id = OBJECT_ID('Payments'))
    CREATE NONCLUSTERED INDEX IX_Payment_UserId ON Payments(UserId);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Payment_Status' AND object_id = OBJECT_ID('Payments'))
    CREATE NONCLUSTERED INDEX IX_Payment_Status ON Payments([Status]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Payment_PaymentDate' AND object_id = OBJECT_ID('Payments'))
    CREATE NONCLUSTERED INDEX IX_Payment_PaymentDate ON Payments(PaymentDate);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Payment_UserId_Status_PaymentDate' AND object_id = OBJECT_ID('Payments'))
    CREATE NONCLUSTERED INDEX IX_Payment_UserId_Status_PaymentDate ON Payments(UserId, [Status], PaymentDate);

PRINT 'تم إنشاء فهارس Payments بنجاح.';
GO

-- =============================================
-- Full-Text Indexes
-- =============================================
PRINT 'إنشاء Full-Text Catalog...';

IF NOT EXISTS (SELECT * FROM sys.fulltext_catalogs WHERE name = 'JobMagnetFullTextCatalog')
BEGIN
    CREATE FULLTEXT CATALOG JobMagnetFullTextCatalog AS DEFAULT;
    PRINT 'تم إنشاء Full-Text Catalog بنجاح.';
END
ELSE
BEGIN
    PRINT 'Full-Text Catalog موجود بالفعل.';
END
GO

PRINT 'إنشاء Full-Text Indexes...';

-- Full-Text Index للوظائف
IF NOT EXISTS (SELECT * FROM sys.fulltext_indexes WHERE object_id = OBJECT_ID('Jobs'))
BEGIN
    CREATE FULLTEXT INDEX ON Jobs(Title, Description)
    KEY INDEX PK_Jobs
    ON JobMagnetFullTextCatalog
    WITH CHANGE_TRACKING AUTO;
    PRINT 'تم إنشاء Full-Text Index لـ Jobs.';
END

-- Full-Text Index للمشاريع
IF NOT EXISTS (SELECT * FROM sys.fulltext_indexes WHERE object_id = OBJECT_ID('Projects'))
BEGIN
    CREATE FULLTEXT INDEX ON Projects(Title, Description)
    KEY INDEX PK_Projects
    ON JobMagnetFullTextCatalog
    WITH CHANGE_TRACKING AUTO;
    PRINT 'تم إنشاء Full-Text Index لـ Projects.';
END

-- Full-Text Index للمستقلين
IF NOT EXISTS (SELECT * FROM sys.fulltext_indexes WHERE object_id = OBJECT_ID('Freelancers'))
BEGIN
    CREATE FULLTEXT INDEX ON Freelancers(ProfessionalTitle, Bio)
    KEY INDEX PK_Freelancers
    ON JobMagnetFullTextCatalog
    WITH CHANGE_TRACKING AUTO;
    PRINT 'تم إنشاء Full-Text Index لـ Freelancers.';
END

-- Full-Text Index للشركات
IF NOT EXISTS (SELECT * FROM sys.fulltext_indexes WHERE object_id = OBJECT_ID('Companies'))
BEGIN
    CREATE FULLTEXT INDEX ON Companies(CompanyName, Description)
    KEY INDEX PK_Companies
    ON JobMagnetFullTextCatalog
    WITH CHANGE_TRACKING AUTO;
    PRINT 'تم إنشاء Full-Text Index لـ Companies.';
END
GO

-- =============================================
-- التحقق من الفهارس المُنشأة
-- =============================================
PRINT '==================================';
PRINT 'قائمة بجميع الفهارس المُنشأة:';
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
PRINT 'تم الانتهاء من إنشاء جميع الفهارس بنجاح! ✅';
PRINT '==================================';
GO
