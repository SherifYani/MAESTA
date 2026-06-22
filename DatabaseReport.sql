-- =============================================
-- تقرير حالة قاعدة البيانات JobMagnetDB
-- =============================================

USE JobMagnetDB;
GO

PRINT '==========================================';
PRINT 'تقرير حالة قاعدة بيانات JobMagnetDB';
PRINT '==========================================';
PRINT '';

-- 1. عدد الجداول
PRINT '1. عدد الجداول:';
SELECT COUNT(*) AS TotalTables
FROM sys.tables;
GO

-- 2. قائمة بجميع الجداول
PRINT '';
PRINT '2. قائمة الجداول:';
SELECT 
    ROW_NUMBER() OVER (ORDER BY name) AS No,
    name AS TableName,
    create_date AS CreatedDate
FROM sys.tables
ORDER BY name;
GO

-- 3. عدد الفهارس
PRINT '';
PRINT '3. إحصائيات الفهارس:';
SELECT 
    COUNT(*) AS TotalIndexes,
    SUM(CASE WHEN is_unique = 1 THEN 1 ELSE 0 END) AS UniqueIndexes,
    SUM(CASE WHEN is_primary_key = 1 THEN 1 ELSE 0 END) AS PrimaryKeyIndexes,
    SUM(CASE WHEN type_desc = 'NONCLUSTERED' THEN 1 ELSE 0 END) AS NonClusteredIndexes
FROM sys.indexes
WHERE name LIKE 'IX_%' OR name LIKE 'PK_%';
GO

-- 4. الفهارس حسب الجدول
PRINT '';
PRINT '4. عدد الفهارس لكل جدول:';
SELECT 
    t.name AS TableName,
    COUNT(i.index_id) AS IndexCount
FROM sys.tables t
LEFT JOIN sys.indexes i ON t.object_id = i.object_id AND i.name LIKE 'IX_%'
GROUP BY t.name
HAVING COUNT(i.index_id) > 0
ORDER BY COUNT(i.index_id) DESC;
GO

-- 5. Full-Text Catalogs and Indexes
PRINT '';
PRINT '5. Full-Text Catalogs و Indexes:';
SELECT 
    fc.name AS CatalogName,
    COUNT(fi.object_id) AS FullTextIndexCount
FROM sys.fulltext_catalogs fc
LEFT JOIN sys.fulltext_indexes fi ON fc.fulltext_catalog_id = fi.fulltext_catalog_id
GROUP BY fc.name;
GO

-- 6. قائمة Full-Text Indexes
PRINT '';
PRINT '6. قائمة Full-Text Indexes المُنشأة:';
SELECT 
    OBJECT_NAME(object_id) AS TableName,
    CASE WHEN is_enabled = 1 THEN 'Enabled' ELSE 'Disabled' END AS [Status],
    change_tracking_state_desc AS ChangeTracking
FROM sys.fulltext_indexes;
GO

-- 7. حجم قاعدة البيانات
PRINT '';
PRINT '7. حجم قاعدة البيانات:';
SELECT 
    name AS DatabaseName,
    size * 8.0 / 1024 AS SizeMB,
    max_size * 8.0 / 1024 AS MaxSizeMB
FROM sys.database_files;
GO

-- 8. العلاقات الأجنبية (Foreign Keys)
PRINT '';
PRINT '8. عدد العلاقات (Foreign Keys):';
SELECT COUNT(*) AS TotalForeignKeys
FROM sys.foreign_keys;
GO

PRINT '';
PRINT '==========================================';
PRINT 'انتهى التقرير';
PRINT '==========================================';
GO
