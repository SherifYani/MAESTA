USE JobMagnetDB;
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- Clean up existing lists & jobs to avoid duplicates on re-runs
DELETE FROM JobApplications;
DELETE FROM UserSkills;
DELETE FROM UserWorkExperiences;
DELETE FROM UserEducations;
DELETE FROM Jobs;
DELETE FROM Skills;
DELETE FROM Categories;

-- 1. Insert Categories
INSERT INTO Categories (Name, Description, CreatedAt, IsDeleted) VALUES
('Software Development', 'Web, mobile, desktop, and systems programming', SYSDATETIMEOFFSET(), 0),
('Data Science & AI', 'Machine learning, data analytics, and big data', SYSDATETIMEOFFSET(), 0),
('Design & Creative', 'UI/UX design, graphic design, and branding', SYSDATETIMEOFFSET(), 0),
('Marketing & Sales', 'Digital marketing, SEO, and sales campaigns', SYSDATETIMEOFFSET(), 0),
('Writing & Translation', 'Content writing, editing, and professional translation', SYSDATETIMEOFFSET(), 0);

-- 2. Insert Skills
INSERT INTO Skills (Name, CreatedAt, IsDeleted) VALUES
('React', SYSDATETIMEOFFSET(), 0),
('Node.js', SYSDATETIMEOFFSET(), 0),
('C#', SYSDATETIMEOFFSET(), 0),
('.NET Core', SYSDATETIMEOFFSET(), 0),
('SQL Server', SYSDATETIMEOFFSET(), 0),
('Docker', SYSDATETIMEOFFSET(), 0),
('Python', SYSDATETIMEOFFSET(), 0),
('TypeScript', SYSDATETIMEOFFSET(), 0),
('JavaScript', SYSDATETIMEOFFSET(), 0),
('HTML5', SYSDATETIMEOFFSET(), 0),
('CSS3', SYSDATETIMEOFFSET(), 0),
('Git', SYSDATETIMEOFFSET(), 0);

-- 3. Update User Profiles
-- UserId = 2 (aboamin.mo12@gmail.com)
UPDATE Users
SET FirstName = 'Sherif',
    LastName = 'Yani',
    Phone = '+201012345678',
    Country = 'Egypt',
    City = 'Cairo',
    UserType = 'JobSeeker',
    IsActive = 1,
    IsDeleted = 0
WHERE UserId = 2;

-- Ensure JobSeeker record exists for UserId = 2
IF NOT EXISTS (SELECT 1 FROM JobSeekers WHERE UserId = 2)
BEGIN
    INSERT INTO JobSeekers (UserId, ProfessionalTitle, ExperienceYears, PreferredJobType, Bio, IsVerified, CreatedAt, IsDeleted)
    VALUES (2, 'Senior Full-Stack Developer', 5, 'Remote', 'Passionate software engineer with 5+ years of experience building modern web applications using React, .NET Core, and SQL Server.', 1, SYSDATETIMEOFFSET(), 0);
END
ELSE
BEGIN
    UPDATE JobSeekers
    SET ProfessionalTitle = 'Senior Full-Stack Developer',
        ExperienceYears = 5,
        PreferredJobType = 'Remote',
        Bio = 'Passionate software engineer with 5+ years of experience building modern web applications using React, .NET Core, and SQL Server.',
        IsVerified = 1,
        IsDeleted = 0
    WHERE UserId = 2;
END

-- UserId = 3 (testuser@example.com)
UPDATE Users
SET FirstName = 'John',
    LastName = 'Doe',
    Phone = '+15550199',
    Country = 'United States',
    City = 'San Francisco',
    UserType = 'JobSeeker',
    IsActive = 1,
    IsDeleted = 0
WHERE UserId = 3;

-- Ensure JobSeeker record exists for UserId = 3
IF NOT EXISTS (SELECT 1 FROM JobSeekers WHERE UserId = 3)
BEGIN
    INSERT INTO JobSeekers (UserId, ProfessionalTitle, ExperienceYears, PreferredJobType, Bio, IsVerified, CreatedAt, IsDeleted)
    VALUES (3, 'Frontend Engineer', 3, 'Hybrid', 'Frontend specialist focused on creating accessible, high-performance user interfaces with React and TypeScript.', 1, SYSDATETIMEOFFSET(), 0);
END
ELSE
BEGIN
    UPDATE JobSeekers
    SET ProfessionalTitle = 'Frontend Engineer',
        ExperienceYears = 3,
        PreferredJobType = 'Hybrid',
        Bio = 'Frontend specialist focused on creating accessible, high-performance user interfaces with React and TypeScript.',
        IsVerified = 1,
        IsDeleted = 0
    WHERE UserId = 3;
END

-- 4. Seed User Skills (map UserId 2 and 3 to Skills)
DECLARE @ReactId INT = (SELECT SkillId FROM Skills WHERE Name = 'React');
DECLARE @NodeId INT = (SELECT SkillId FROM Skills WHERE Name = 'Node.js');
DECLARE @CsharpId INT = (SELECT SkillId FROM Skills WHERE Name = 'C#');
DECLARE @NetCoreId INT = (SELECT SkillId FROM Skills WHERE Name = '.NET Core');
DECLARE @SqlId INT = (SELECT SkillId FROM Skills WHERE Name = 'SQL Server');
DECLARE @TypeScriptId INT = (SELECT SkillId FROM Skills WHERE Name = 'TypeScript');

-- Sherif (UserId = 2)
INSERT INTO UserSkills (UserId, SkillId, ProvenYears, CreatedAt) VALUES
(2, @ReactId, 4, SYSDATETIMEOFFSET()),
(2, @CsharpId, 5, SYSDATETIMEOFFSET()),
(2, @NetCoreId, 5, SYSDATETIMEOFFSET()),
(2, @SqlId, 5, SYSDATETIMEOFFSET());

-- John (UserId = 3)
INSERT INTO UserSkills (UserId, SkillId, ProvenYears, CreatedAt) VALUES
(3, @ReactId, 3, SYSDATETIMEOFFSET()),
(3, @TypeScriptId, 2, SYSDATETIMEOFFSET());

-- 5. Seed Work Experiences
-- Sherif (UserId = 2)
INSERT INTO UserWorkExperiences (UserId, JobTitle, Company, StartDate, EndDate, Description, CreatedAt, IsDeleted) VALUES
(2, 'Senior Software Engineer', 'Acme Solutions', '2023-01-01 00:00:00 +00:00', NULL, 'Leading development of enterprise portals and microservices using React and .NET Core.', SYSDATETIMEOFFSET(), 0),
(2, 'Full-Stack Developer', 'Global Tech', '2021-03-01 00:00:00 +00:00', '2022-12-31 00:00:00 +00:00', 'Developed and maintained various customer-facing web apps.', SYSDATETIMEOFFSET(), 0);

-- John (UserId = 3)
INSERT INTO UserWorkExperiences (UserId, JobTitle, Company, StartDate, EndDate, Description, CreatedAt, IsDeleted) VALUES
(3, 'Frontend Engineer', 'InnoWave', '2022-06-01 00:00:00 +00:00', NULL, 'Building responsive dashboards using React, Redux, and TailwindCSS.', SYSDATETIMEOFFSET(), 0);

-- 6. Seed Education
-- Sherif (UserId = 2)
INSERT INTO UserEducations (UserId, Degree, Institution, FieldOfStudy, StartDate, EndDate, CreatedAt, IsDeleted) VALUES
(2, 'B.Sc. in Computer Science', 'Cairo University', 'Computer Science and Information Systems', '2016-09-01 00:00:00 +00:00', '2020-06-30 00:00:00 +00:00', SYSDATETIMEOFFSET(), 0);

-- John (UserId = 3)
INSERT INTO UserEducations (UserId, Degree, Institution, FieldOfStudy, StartDate, EndDate, CreatedAt, IsDeleted) VALUES
(3, 'Bachelor of Software Engineering', 'San Jose State University', 'Software Engineering', '2018-09-01 00:00:00 +00:00', '2022-05-30 00:00:00 +00:00', SYSDATETIMEOFFSET(), 0);

-- 7. Seed Jobs posted by Employer (UserId = 1 / 4)
-- Let's make sure Employer / Company profile exists for UserId = 1
IF NOT EXISTS (SELECT 1 FROM Employers WHERE UserId = 1)
BEGIN
    INSERT INTO Employers (UserId, IsVerified, CreatedAt, IsDeleted)
    VALUES (1, 1, SYSDATETIMEOFFSET(), 0);
END
DECLARE @Emp1Id INT = (SELECT EmployerId FROM Employers WHERE UserId = 1);

IF NOT EXISTS (SELECT 1 FROM Companies WHERE EmployerId = @Emp1Id)
BEGIN
    INSERT INTO Companies (EmployerId, CompanyName, Industry, Description, FoundedYear, Country, City, IsVerified, CreatedAt, IsDeleted)
    VALUES (@Emp1Id, 'Local Corp', 'Technology', 'Leading local solutions provider', 2015, 'Egypt', 'Cairo', 1, SYSDATETIMEOFFSET(), 0);
END

-- Seed Jobs
INSERT INTO Jobs (PostedByUserId, Title, Description, Location, Type, MinSalary, MaxSalary, IsActive, IsDeleted, CreatedAt) VALUES
(1, 'Senior .NET Developer', 'We are looking for a Senior .NET Developer with deep knowledge of ASP.NET Core, EF Core, and SQL Server. You will build and scale high-throughput REST APIs.', 'Cairo, Egypt', 'FullTime', 3000, 5000, 1, 0, SYSDATETIMEOFFSET()),
(1, 'React Frontend Engineer', 'Join our team to build next-generation web platforms. Experience with React, modern state management (Zustand/Redux), and custom CSS is required.', 'Remote', 'FullTime', 2500, 4000, 1, 0, SYSDATETIMEOFFSET()),
(1, 'DevOps Specialist (Contract)', 'Looking for an experienced engineer to containerize our apps using Docker and deploy to Kubernetes clusters.', 'Cairo, Egypt (Hybrid)', 'Contract', 4000, 6000, 1, 0, SYSDATETIMEOFFSET());

PRINT 'Database seeded successfully!';
