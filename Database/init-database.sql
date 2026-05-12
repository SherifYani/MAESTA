-- JobMagnet Database Initialization Script
-- Run this script to create the initial database structure

USE master;
GO

-- Create database if it doesn't exist
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'JobMagnetDB')
BEGIN
    CREATE DATABASE JobMagnetDB;
END
GO

USE JobMagnetDB;
GO

-- Example table structure (you can modify based on your needs)
-- Users table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
BEGIN
    CREATE TABLE Users (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Email NVARCHAR(255) NOT NULL UNIQUE,
        FirstName NVARCHAR(100) NOT NULL,
        LastName NVARCHAR(100) NOT NULL,
        CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NULL
    );
END
GO

-- Jobs table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Jobs' AND xtype='U')
BEGIN
    CREATE TABLE Jobs (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Title NVARCHAR(255) NOT NULL,
        Description NVARCHAR(MAX) NULL,
        Company NVARCHAR(255) NOT NULL,
        Location NVARCHAR(255) NULL,
        Salary DECIMAL(18,2) NULL,
        CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NULL
    );
END
GO

-- Create indexes for better performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Users_Email')
BEGIN
    CREATE INDEX IX_Users_Email ON Users(Email);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Jobs_Company')
BEGIN
    CREATE INDEX IX_Jobs_Company ON Jobs(Company);
END
GO

PRINT 'Database initialization completed successfully!';
