# 📊 JobMagnet Complete Database ERD

> **شامل لجميع الـ72 كيان مع جميع العلاقات والحقول الرئيسية**

---

## 🎯 1. Core Users & Authentication

```mermaid
erDiagram
    User ||--o| Admin : "is a"
    User ||--o| Freelancer : "is a"
    User ||--o| Employer : "is a"
    User ||--o| JobSeeker : "is a"
    User ||--o| Client : "is a"
    User ||--o{ RefreshToken : "has"
    User ||--o{ UserRole : "has"
    Role ||--o{ UserRole : "assigned to"
    
    User {
        int UserId PK
        string Email UK
        string PasswordHash
        string FirstName
        string LastName
        string ProfilePictureUrl
        string LinkedInUrl
        datetime DateOfBirth
        string Gender
        string Country
        string City
        string Phone
        bool IsPhoneVerified
        bool IsEmailVerified
        int FailedLoginAttempts
        datetime LockoutEndDate
        bool TwoFactorEnabled
        string TwoFactorSecretKey
        string UserType
        datetime LastLoginAt
        datetime LastSeenAt
        bool IsActive
        bool IsDeleted
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        byte[] RowVersion
        bool IsFreelancer_COMPUTED
        bool IsJobSeeker_COMPUTED
        bool IsEmployer_COMPUTED
        bool IsClient_COMPUTED
        bool IsAdmin_COMPUTED
    }

    RefreshToken {
        int TokenId PK
        int UserId FK
        string Token UK
        datetime ExpiresAt
        string CreatedByIp
        datetime RevokedAt
        string ReplacedByToken
        string ReasonRevoked
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }

    Admin {
        int AdminId PK
        int UserId FK
        byte AdminLevel
        string PermissionsJson
        string Notes
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }

    Freelancer {
        int FreelancerId PK
        int UserId FK
        int FreelancerLevelId FK
        string ProfessionalTitle
        int ExperienceYears
        decimal HourlyRate
        string Currency
        int TotalCompletedProjects
        string PortfolioUrl
        string Bio
        string DocumentVerificationUrl
        bool IsVerified
        datetime LastActiveAt
        bool IsDeleted
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        byte[] RowVersion
    }

    Employer {
        int EmployerId PK
        int UserId FK
        string BusinessEmail
        bool IsVerified
        string NationalId
        string TaxNumber
        string ContactPerson
        string ContactPhone
        datetime VerificationRequestedAt
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }

    JobSeeker {
        int JobSeekerId PK
        int UserId FK
        string CVUrl
        string ProfessionalTitle
        int ExperienceYears
        string PreferredJobType
        string Bio
        bool IsVerified
        datetime LastActiveAt
        bool IsDeleted
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        byte[] RowVersion
    }

    Client {
        int ClientId PK
        int UserId FK
        string LegalName
        string ContactPhone
        string Address
        string Website
        string IdentityDocumentUrl
        bool IsVerified
        bool IsDeleted
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        byte[] RowVersion
    }

    Role {
        int RoleId PK
        string RoleName UK
        string Description
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }

    UserRole {
        int UserId PK_FK
        int RoleId PK_FK
        datetime AssignedAt
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        byte[] RowVersion
    }
```

---

## 🏢 2. Company & Organization

```mermaid
erDiagram
    Employer ||--o{ Company : "owns"
    
    Company {
        int CompanyId PK
        int EmployerId FK
        string CompanyName
        string Description
        int FoundedYear
        string Industry
        string CompanySize
        string CommercialRegistrationNumber
        string CommercialRegistrationFileUrl
        string Country
        string City
        string Address
        string Website
        string LogoUrl
        bool IsVerified
        bool IsDeleted
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        byte[] RowVersion
    }
```

---

## 💼 3. Jobs & Applications

```mermaid
erDiagram
    User ||--o{ Job : "posts"
    Job ||--o{ JobApplication : "receives"
    Job ||--o{ JobCategory : "categorized by"
    Job ||--o{ JobTag : "tagged with"
    JobSeeker ||--o{ JobApplication : "applies via"
    JobSeeker ||--o{ SavedJob : "saves"
    User ||--o{ SavedJob : "saves"
    
    Job {
        int JobId PK
        int PostedByUserId FK
        string Title
        string Description
        string Location
        string Type
        decimal MinSalary
        decimal MaxSalary
        bool IsActive
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }

    JobApplication {
        int JobApplicationId PK
        int JobId FK
        int JobSeekerId FK
        string ResumeUrl
        string CoverLetter
        string Status
        datetime AppliedAt
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }

    JobCategory {
        int JobId PK_FK
        int CategoryId PK_FK
        datetime CreatedAt
    }

    JobTag {
        int JobId PK_FK
        int TagId PK_FK
        datetime CreatedAt
    }

    SavedJob {
        int UserId PK_FK
        int JobId PK_FK
        datetime SavedAt
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }
```

---

## 🎨 4. Projects & Contracts

```mermaid
erDiagram
    User ||--o{ Project : "owns"
    Freelancer ||--o{ Project : "assigned to"
    Project ||--o{ Proposal : "receives"
    Project ||--o{ Contract : "has"
    Project ||--o{ ProjectMilestone : "divided into"
    Project ||--o{ ProjectDelivery : "produces"
    Project ||--o{ Timesheet : "tracks time"
    Project ||--o{ Invoice : "generates"
    Project ||--o{ EscrowTransaction : "secured by"
    Project ||--o{ Dispute : "may have"
    Project ||--o{ ProjectCategory : "categorized"
    Project ||--o{ ProjectTag : "tagged"
    
    Project {
        int ProjectId PK
        int OwnerUserId FK
        int AssignedFreelancerId FK
        string Title
        string Description
        decimal Budget
        string Status
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }

    Proposal {
        int ProposalId PK
        int ProjectId FK
        int FreelancerUserId FK
        decimal ProposedAmount
        string ProposalText
        string Status
        datetime SentAt
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }

    Contract {
        int ContractId PK
        int ProjectId FK
        int ClientUserId FK
        int FreelancerUserId FK
        string Terms
        datetime SignedDate
        string ContractFileUrl
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }

    ProjectMilestone {
        int MilestoneId PK
        int ProjectId FK
        string Title
        string Description
        decimal Amount
        datetime DueDate
        string Status
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }

    ProjectDelivery {
        int ProjectDeliveryId PK
        int ProjectId FK
        string FileUrl
        string Message
        bool IsApproved
        datetime DeliveredAt
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }

    Timesheet {
        int TimesheetId PK
        int ProjectId FK
        int FreelancerUserId FK
        decimal Hours
        datetime Date
        string Description
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }

    ProjectCategory {
        int ProjectId PK_FK
        int CategoryId PK_FK
        datetime CreatedAt
    }

    ProjectTag {
        int ProjectId PK_FK
        int TagId PK_FK
        datetime CreatedAt
    }
```

---

## 💰 5. Finance & Payments

```mermaid
erDiagram
    User ||--o{ Payment : "makes"
    User ||--o{ Subscription : "subscribes"
    User ||--o{ Transaction : "performs"
    User ||--o{ UserWallet : "owns"
    User ||--o{ WithdrawalRequest : "requests"
    User ||--o{ RefundRequest : "requests"
    Project ||--o{ Invoice : "has"
    Project ||--o{ EscrowTransaction : "secured"
    
    Payment {
        int PaymentId PK
        int UserId FK
        decimal Amount
        decimal FeeAmount
        string Currency
        string Status
        string TransactionId
        string PaymentProvider
        string GatewayResponse
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        datetime CompletedAt
        bool IsDeleted
        byte[] RowVersion
    }

    Subscription {
        int SubscriptionId PK
        int UserId FK
        string PlanName
        decimal Price
        string Currency
        datetime StartDate
        datetime EndDate
        bool IsActive
        bool AutoRenew
        datetime RenewDate
        int MaxJobs
        int MaxProposals
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        byte[] RowVersion
    }

    Transaction {
        int TransactionId PK
        int UserId FK
        string Type
        decimal Amount
        string Status
        string Description
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }

    UserWallet {
        int WalletId PK
        int UserId FK
        decimal Balance
        string Currency
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }

    Invoice {
        int InvoiceId PK
        int ProjectId FK
        decimal Amount
        datetime DueDate
        string Status
        string InvoiceNumber
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }

    EscrowTransaction {
        int EscrowTransactionId PK
        int ProjectId FK
        int FreelancerUserId FK
        decimal Amount
        decimal FeeAmount
        string Currency
        string Status
        string PaymentProvider
        string GatewayResponse
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }

    WithdrawalRequest {
        int WithdrawalRequestId PK
        int UserId FK
        decimal Amount
        string PaymentMethod
        string Status
        datetime RequestedAt
        datetime ProcessedAt
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }

    RefundRequest {
        int RefundRequestId PK
        int UserId FK
        int TransactionId FK
        string Reason
        string Status
        datetime RequestedAt
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }

    CommissionRate {
        int CommissionRateId PK
        string UserType
        decimal RatePercent
        datetime EffectiveDate
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }

    PromoCode {
        int PromoCodeId PK
        string Code UK
        decimal DiscountPercent
        datetime ExpiryDate
        int UsageLimit
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }
```

---

## ⭐ 6. Reviews, Ratings & Disputes

```mermaid
erDiagram
    User ||--o{ Review : "writes"
    User ||--o{ Review : "receives"
    User ||--o{ Rating : "has"
    User ||--o{ Dispute : "raises"
    Project ||--o{ Dispute : "disputed"
    
    Review {
        int ReviewId PK
        int ReviewerId FK
        string ReviewerRole
        int TargetUserId FK
        string TargetRole
        string Comment
        byte RatingValue
        string ContextEntity
        int ContextEntityId
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }

    Rating {
        int RatingId PK
        int UserId FK
        double AverageRating
        int TotalReviews
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }

    Dispute {
        int DisputeId PK
        int ProjectId FK
        int RaisedByUserId FK
        string Reason
        string EvidenceFileUrl
        string AdminNotes
        string Status
        datetime CreatedAt
        datetime ResolvedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }

    Report {
        int ReportId PK
        int ReportedBy FK
        string EntityType
        int EntityId
        string Reason
        string Details
        string Status
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }
```

---

## 💬 7. Communication & Messaging

```mermaid
erDiagram
    User ||--o{ Chat : "participant1"
    User ||--o{ Chat : "participant2"
    Chat ||--o{ Message : "contains"
    User ||--o{ Message : "sends"
    User ||--o{ Notification : "receives"
    
    Chat {
        int ChatId PK
        int User1Id FK
        int User2Id FK
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }

    Message {
        int MessageId PK
        int ChatId FK
        int SenderId FK
        string Content
        bool IsRead
        datetime SentAt
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }

    Notification {
        int NotificationId PK
        int UserId FK
        string Title
        string Message
        string NotificationType
        string RedirectUrl
        string ImageUrl
        bool IsRead
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }
```

---

## 🎓 8. Community & Support

```mermaid
erDiagram
    User ||--o{ CommunityPost : "creates"
    CommunityPost ||--o{ CommunityReply : "has replies"
    User ||--o{ CommunityReply : "writes"
    User ||--o{ SupportTicket : "creates"
    SupportTicket ||--o{ TicketMessage : "contains"
    User ||--o{ TicketMessage : "sends"
    
    CommunityPost {
        int CommunityPostId PK
        int PostedByUserId FK
        string Title
        string Content
        string PostType
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }

    CommunityReply {
        int CommunityReplyId PK
        int PostId FK
        int UserId FK
        string Content
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }

    SupportTicket {
        int TicketId PK
        int CreatedByUserId FK
        string Subject
        string Status
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }

    TicketMessage {
        int TicketMessageId PK
        int TicketId FK
        int SenderUserId FK
        string Message
        datetime SentAt
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }
```

---

## 👤 9. User Profile & Documents

```mermaid
erDiagram
    User ||--o{ UserDocument : "uploads"
    User ||--o{ UserEducation : "has"
    User ||--o{ UserWorkExperience : "has"
    User ||--o{ UserCertification : "has"
    User ||--o{ UserSettings : "configures"
    Freelancer ||--o{ FreelancerPortfolio : "showcases"
    
    UserDocument {
        int DocumentId PK
        int UserId FK
        string DocumentType
        string FileUrl
        string Metadata
        bool IsVerified
        datetime UploadedAt
        datetime VerifiedAt
        int VerifiedBy
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }

    UserEducation {
        int EducationId PK
        int UserId FK
        string Degree
        string Institution
        string FieldOfStudy
        datetime StartDate
        datetime EndDate
        string Description
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }

    UserWorkExperience {
        int WorkExperienceId PK
        int UserId FK
        string JobTitle
        string Company
        datetime StartDate
        datetime EndDate
        string Description
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }

    UserCertification {
        int CertificationId PK
        int UserId FK
        string CertificationName
        string IssuedBy
        datetime IssuedDate
        datetime ExpiryDate
        string CertificateUrl
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }

    UserSettings {
        int UserId PK_FK
        string Language
        string TimeZone
        bool EmailNotifications
        bool SmsNotifications
        bool PushNotifications
        bool DarkMode
        string Preferences
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }

    FreelancerPortfolio {
        int PortfolioId PK
        int FreelancerId FK
        string ProjectTitle
        string Description
        string ImageUrlsJson
        string ProjectUrl
        string ClientName
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }
```

---

## 🏆 10. Skills, Badges & Levels

```mermaid
erDiagram
    User ||--o{ UserSkill : "possesses"
    Skill ||--o{ UserSkill : "assigned to"
    User ||--o{ UserBadge : "earned"
    Badge ||--o{ UserBadge : "awarded to"
    Freelancer ||--o{ FreelancerLevel : "leveled at"
    Freelancer ||--o{ FreelancerTag : "tagged with"
    Tag ||--o{ FreelancerTag : "tags"
    
    Skill {
        int SkillId PK
        string Name UK
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }

    UserSkill {
        int UserId PK_FK
        int SkillId PK_FK
        int ProvenYears
        string CertificateUrl
        int VerifiedBy
        datetime VerifiedAt
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        byte[] RowVersion
    }

    Badge {
        int BadgeId PK
        string Name
        string Description
        string IconUrl
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }

    UserBadge {
        int UserId PK_FK
        int BadgeId PK_FK
        datetime AwardedAt
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        byte[] RowVersion
    }

    FreelancerLevel {
        int LevelId PK
        string LevelName
        decimal MinRating
        int MinCompletedProjects
        string Description
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }

    Tag {
        int TagId PK
        string Name UK
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }

    FreelancerTag {
        int FreelancerId PK_FK
        int TagId PK_FK
        datetime CreatedAt
    }
```

---

## 📂 11. Categories & Metadata

```mermaid
erDiagram
    Category ||--o{ JobCategory : "categorizes"
    Category ||--o{ ProjectCategory : "categorizes"
    
    Category {
        int CategoryId PK
        string Name UK
        string Description
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }
```

---

## 🔖 12. Saved & Favorites

```mermaid
erDiagram
    User ||--o{ SavedFreelancer : "saves"
    User ||--o{ Favorite : "favorites"
    
    SavedFreelancer {
        int UserId PK_FK
        int FreelancerUserId PK_FK
        datetime SavedAt
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }

    Favorite {
        int UserId PK_FK
        string EntityType PK
        int EntityId PK
        datetime SavedAt
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }
```

---

## 🎁 13. Marketing & Referrals

```mermaid
erDiagram
    User ||--o{ Referral : "refers"
    
    Referral {
        int ReferralId PK
        int ReferrerId FK
        int ReferredUserId FK
        string Status
        decimal RewardAmount
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }
```

---

## 📊 14. System & Logs

```mermaid
erDiagram
    User ||--o{ ActivityLog : "generates"
    User ||--o{ SearchHistory : "searches"
    
    ActivityLog {
        int ActivityId PK
        int UserId FK
        string Action
        string Details
        string IpAddress
        datetime CreatedAt
    }

    SystemLog {
        int LogId PK
        string Level
        string Message
        string Metadata
        datetime CreatedAt
    }

    ErrorLog {
        int ErrorId PK
        string ExceptionMessage
        string StackTrace
        string RequestBody
        string Url
        int UserId FK
        datetime LoggedAt
    }

    SearchHistory {
        int SearchId PK
        int UserId FK
        string QueryText
        string Filters
        int ResultsCount
        string IpAddress
        datetime ExecutedAt
    }
```

---

## 🛡️ 15. Security & Admin

```mermaid
erDiagram
    IpBlacklist {
        int IPId PK
        string IpAddress UK
        string Reason
        datetime BlockedAt
        datetime ExpiresAt
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }

    BlockedUser {
        int BlockedUserId PK
        int UserId FK
        int BlockedByUserId FK
        string Reason
        datetime BlockedAt
    }
```

---

## 📧 16. Templates & Settings

```mermaid
erDiagram
    EmailTemplate {
        int EmailTemplateId PK
        string TemplateName UK
        string Subject
        string Body
        string VariablesJson
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }

    SmsTemplate {
        int SmsTemplateId PK
        string TemplateName UK
        string Body
        string VariablesJson
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }

    PlatformSetting {
        int SettingId PK
        string SettingKey UK
        string SettingValue
        string Category
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }

    Faq {
        int FaqId PK
        string Question
        string Answer
        string Category
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }

    Announcement {
        int AnnouncementId PK
        string Title
        string Content
        string TargetUsers
        datetime ExpiryDate
        datetime CreatedAt
        int CreatedBy
        datetime UpdatedAt
        int UpdatedBy
        bool IsDeleted
        byte[] RowVersion
    }
```

---

## 📋 Summary

### Total Entities: **72**
### Standard Audit Trail Fields (في كل كيان):
- `CreatedAt` (DateTimeOffset)
- `CreatedBy` (int?, nullable)
- `UpdatedAt` (DateTimeOffset?, nullable)
- `UpdatedBy` (int?, nullable)
- `IsDeleted` (bool)
- `RowVersion` (byte[], Timestamp)

### Key Features:
✅ Multi-role support (User can be Freelancer + JobSeeker + Employer simultaneously)  
✅ Soft Delete (IsDeleted)  
✅ Concurrency Control (RowVersion)  
✅ Complete Audit Trail  
✅ Comprehensive Relationships  
✅ Security & Validation
