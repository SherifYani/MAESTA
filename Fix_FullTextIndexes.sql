-- =============================================
-- إصلاح وإنشاء Full-Text Indexes
-- =============================================

USE JobMagnetDB;
GO

PRINT 'إنشاء Full-Text Indexes (محسّنة)...';
GO

-- إنشاء Unique Indexes للمفاتيح الأساسية لدعم Full-Text Search
-- (هذه الخطوة ضرورية فقط إذا لم يكن المفتاح الأساسي unique و non-nullable)

-- Full-Text Index للوظائف (Jobs)
IF NOT EXISTS (SELECT * FROM sys.fulltext_indexes WHERE object_id = OBJECT_ID('Jobs'))
BEGIN
    CREATE FULLTEXT INDEX ON Jobs(Title LANGUAGE 1025, Description LANGUAGE 1025)
    KEY INDEX PK__Jobs__056690C2D3BD1A50 -- سيتم تعديله للمفتاح الفعلي
    ON JobMagnetFullTextCatalog
    WITH CHANGE_TRACKING AUTO;
    PRINT 'تم إنشاء Full-Text Index لـ Jobs.';
END
ELSE
BEGIN
    PRINT 'Full-Text Index لـ Jobs موجود بالفعل.';
END
GO

-- Full-Text Index للمشاريع (Projects)
IF NOT EXISTS (SELECT * FROM sys.fulltext_indexes WHERE object_id = OBJECT_ID('Projects'))
BEGIN
    -- نحتاج لمعرفة اسم Primary Key الفعلي
    DECLARE @PKName NVARCHAR(200);
    SELECT @PKName = name 
    FROM sys.indexes 
    WHERE object_id = OBJECT_ID('Projects') AND is_primary_key = 1;
    
    DECLARE @SQL NVARCHAR(MAX) = '
    CREATE FULLTEXT INDEX ON Projects(Title LANGUAGE 1025, Description LANGUAGE 1025)
    KEY INDEX ' + @PKName + '
    ON JobMagnetFullTextCatalog
    WITH CHANGE_TRACKING AUTO;';
    
    EXEC sp_executesql @SQL;
    PRINT 'تم إنشاء Full-Text Index لـ Projects.';
END
ELSE
BEGIN
    PRINT 'Full-Text Index لـ Projects موجود بالفعل.';
END
GO

-- Full-Text Index للمستقلين (Freelancers)
IF NOT EXISTS (SELECT * FROM sys.fulltext_indexes WHERE object_id = OBJECT_ID('Freelancers'))
BEGIN
    DECLARE @PKName NVARCHAR(200);
    SELECT @PKName = name 
    FROM sys.indexes 
    WHERE object_id = OBJECT_ID('Freelancers') AND is_primary_key = 1;
    
    DECLARE @SQL NVARCHAR(MAX) = '
    CREATE FULLTEXT INDEX ON Freelancers(ProfessionalTitle LANGUAGE 1025, Bio LANGUAGE 1025)
    KEY INDEX ' + @PKName + '
    ON JobMagnetFullTextCatalog
    WITH CHANGE_TRACKING AUTO;';
    
    EXEC sp_executesql @SQL;
    PRINT 'تم إنشاء Full-Text Index لـ Freelancers.';
END
ELSE
BEGIN
    PRINT 'Full-Text Index لـ Freelancers موجود بالفعل.';
END
GO

-- Full-Text Index للشركات (Companies)
IF NOT EXISTS (SELECT * FROM sys.fulltext_indexes WHERE object_id = OBJECT_ID('Companies'))
BEGIN
    DECLARE @PKName NVARCHAR(200);
    SELECT @PKName = name 
    FROM sys.indexes 
    WHERE object_id = OBJECT_ID('Companies') AND is_primary_key = 1;
    
    DECLARE @SQL NVARCHAR(MAX) = '
    CREATE FULLTEXT INDEX ON Companies(CompanyName LANGUAGE 1025, Description LANGUAGE 1025)
    KEY INDEX ' + @PKName + '
    ON JobMagnetFullTextCatalog
    WITH CHANGE_TRACKING AUTO;';
    
    EXEC sp_executesql @SQL;
    PRINT 'تم إنشاء Full-Text Index لـ Companies.';
END
ELSE
BEGIN
    PRINT 'Full-Text Index لـ Companies موجود بالفعل.';
END
GO

-- التحقق من Full-Text Indexes
PRINT '====================================';
PRINT 'قائمة Full-Text Indexes المُنشأة:';
PRINT '====================================';

SELECT 
    OBJECT_NAME(object_id) AS TableName,
    name AS IndexName,
    is_enabled AS IsEnabled
FROM sys.fulltext_indexes
WHERE object_id IN (
    OBJECT_ID('Jobs'),
    OBJECT_ID('Projects'),
    OBJECT_ID('Freelancers'),
    OBJECT_ID('Companies')
);
GO

PRINT 'تم الانتهاء من إنشاء Full-Text Indexes!';
GO
