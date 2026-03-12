# DB vs Backend vs Frontend — Differences Report

## Scope
This report lists mismatches between:
- **Domain Entities** (C# classes in repo root, e.g. `User.cs`, `Payment.cs`)
- **EF Core DbContext / Index configuration** (`JobMagnetDbContext.cs`, `DatabaseIndexesConfiguration.cs`)
- **Index Migration script** (`AddDatabaseIndexes_Migration.cs`)
- **Frontend expectations** (registration + onboarding flows in `Frontend/src`)

## 1) Auth / Registration Contract (Backend API vs Frontend)

### 1.1 Endpoints & contracts
- **Backend**: `JobMagnet.API/Controllers/AuthController.cs`
  - `POST /api/Auth/register/step1`
    - Request: `RegisterStep1Request { email, password, firstName, lastName, phone? }`
    - Response: `AuthResponse { userId, email, userType, registrationStatus, accessToken, accessTokenExpiresAt, refreshToken, refreshTokenExpiresAt }`
    - Behavior: creates user with:
      - `UserType = null`
      - `RegistrationStatus = "PendingStep2"`
  - `POST /api/Auth/register/step2` (requires policy `PendingStep2Only`)
    - Request: `RegisterStep2Request`
      - Required: `userType` in: `Freelancer|Employer|JobSeeker|Client`
      - Optional: `professionalTitle`, `experienceYears`, `hourlyRate`, `currency`, `portfolioUrl`, `bio`, `documentVerificationUrl`,
        `businessEmail`, `nationalId`, `taxNumber`, `contactPerson`, `contactPhone`,
        `cvUrl`, `preferredJobType`,
        `legalName`, `address`, `website`, `identityDocumentUrl`
    - Response: `{ message, userId, userType, registrationStatus }`
    - Behavior:
      - sets `User.UserType = request.UserType`
      - sets `User.RegistrationStatus = "PendingApproval"`
      - inserts into one of: `Freelancers`, `Employers`, `JobSeekers`, `Clients`
  - `POST /api/Auth/login`
    - Response: `AuthResponse` (same shape)
  - `POST /api/Auth/refresh`
    - Response: `AuthResponse` (same shape)
  - `POST /api/Auth/logout` (requires policy `AnyAuthenticated`)
    - Request: `RefreshRequest { refreshToken }`

### 1.2 Frontend current implementation
- **Frontend**:
  - `Frontend/src/context/AuthContext.jsx`
    - expects auth responses to include `accessToken` and stores it under localStorage key `token`.
  - `Frontend/src/services/ApiService.js`
    - hits `/Auth/*` endpoints and uses refresh flow calling `/Auth/refresh`.
  - `Frontend/src/components/forms/RegisterForm.jsx`
    - Step1 request payload matches backend: `{ email, password, firstName, lastName, phone }`.
    - Stores `userRole` (lowercase: `jobseeker`, `employer`) and `onboardingPreFill` (client-side only).
  - `Frontend/src/pages/onboarding/*`
    - Step2 forms contain some fields that are **not in backend request** (ex: file uploads), and may be missing some backend-supported fields.

### 1.3 Key mismatches / risks
- **[Mismatch] Employer onboarding data**
  - Backend `RegisterStep2Request` supports employer fields:
    - `businessEmail`, `contactPerson`, `contactPhone`, `nationalId`, `taxNumber`
  - Current `RegisterForm.jsx` stores employer “company prefill” fields (companyName, description, industry, size, foundedYear, website, etc.) but **backend step2 does not accept companyName/etc** in `RegisterStep2Request`.
  - Backend `RegisterStep2` for Employer inserts **Employer** entity only (not `Company`), so company details in frontend currently have no backend target.

- **[Mismatch] JobSeeker onboarding CV handling**
  - Backend expects `cvUrl` string (URL) and optional `preferredJobType`.
  - Current JobSeeker onboarding includes **file upload** (`resume`) and treats it as required for completion.

- **[Note] RegistrationStatus flow**
  - Backend statuses are `PendingStep2`, `PendingApproval`, `Approved` (see `User.cs` and `AuthController.cs`).
  - Frontend routing uses `PendingStep2` to force onboarding before dashboard.

## 2) Entity vs Index Configuration vs Migration mismatches (DB layer)

### 2.1 CommunityReply
- **Entity**: `CommunityReply.cs`
  - Fields: `PostId`, `UserId`
- **DbContext foreign keys**: `JobMagnetDbContext.ConfigureForeignKeys`
  - Uses `cr.PostId` and `cr.UserId`
- **Indexes config**: `DatabaseIndexesConfiguration.ConfigureCommunityPostIndexes`
  - Uses `cr.PostId` and `cr.UserId`
- **Migration**: `AddDatabaseIndexes_Migration.cs`
  - Creates indexes on columns: `CommunityPostId`, `RepliedByUserId`
- **Result**: migration expects columns that do not exist in entity/table.

### 2.2 Proposal
- **Entity**: `Proposal.cs`
  - Fields: `FreelancerUserId`, `SentAt`
- **Indexes config**: `DatabaseIndexesConfiguration.ConfigureProposalIndexes`
  - Uses `FreelancerUserId`, `SentAt`
- **Migration**: `AddDatabaseIndexes_Migration.cs`
  - Creates indexes on: `FreelancerId`, `SubmittedAt`
- **Result**: migration expects columns that do not exist in entity/table.

### 2.3 Payment
- **Entity**: `Payment.cs`
  - Fields: `PaymentProvider`, `CreatedAt`, `CompletedAt`, `TransactionId`, etc.
  - Does **NOT** have: `PaymentType`, `PaymentMethod`, `PaymentDate`
- **Indexes config**: `DatabaseIndexesConfiguration.ConfigurePaymentIndexes`
  - Indexes: `PaymentProvider`, `Currency`, `CreatedAt`, etc. (matches entity)
- **Migration**: `AddDatabaseIndexes_Migration.cs`
  - Creates indexes on: `PaymentType`, `PaymentMethod`, `PaymentDate`
- **Result**: migration expects columns that do not exist in entity/table.

### 2.4 Transaction
- **Entity**: `Transaction.cs`
  - Fields: `Type`, `CreatedAt`
  - Does **NOT** have: `TransactionType`, `TransactionDate`
- **Indexes config**: `DatabaseIndexesConfiguration.ConfigurePaymentIndexes` (Transaction section)
  - Indexes: `Type`, `CreatedAt` (matches entity)
- **Migration**: `AddDatabaseIndexes_Migration.cs`
  - Creates indexes on: `TransactionType`, `TransactionDate`
- **Result**: migration expects columns that do not exist in entity/table.

### 2.5 Invoice
- **Entity**: `Invoice.cs`
  - Has: `ProjectId`, `CreatedAt`, `DueDate`
  - Does **NOT** have: `UserId`, `IssueDate`
- **Indexes config**: `DatabaseIndexesConfiguration.ConfigurePaymentIndexes` (Invoice section)
  - Indexes: `ProjectId`, `Status`, `CreatedAt`, `DueDate`
- **Migration**: `AddDatabaseIndexes_Migration.cs`
  - Creates indexes on: `UserId`, `IssueDate`, and composite `UserId + Status`
- **Result**: migration expects columns that do not exist in entity/table.

### 2.6 Review
- **Entity**: `Review.cs`
  - Has: `ReviewerId`, `TargetUserId`, `RatingValue`, `ContextEntityId`
  - Does **NOT** have: `RevieweeId`, `ProjectId`, `Rating`
- **Migration**: `AddDatabaseIndexes_Migration.cs`
  - Creates indexes on: `RevieweeId`, `ProjectId`, `Rating`
- **Result**: migration expects columns that do not exist in entity/table.

### 2.7 Rating
- **Entity**: `Rating.cs`
  - Has: `UserId`, `AverageRating`, `TotalReviews`
  - Does **NOT** have: `RaterId`, `RatedUserId`, `RatingValue`
- **Migration**: `AddDatabaseIndexes_Migration.cs`
  - Creates indexes on: `RaterId`, `RatedUserId`, `RatingValue`
- **Result**: migration expects columns that do not exist in entity/table.

### 2.8 UserSkill
- **Entity**: `UserSkill.cs`
  - Has: `ProvenYears`
  - Does **NOT** have: `ProficiencyLevel`
- **Indexes config**: `DatabaseIndexesConfiguration.ConfigureFreelancerIndexes` (UserSkill section)
  - Indexes `ProvenYears`
- **Migration**: `AddDatabaseIndexes_Migration.cs`
  - Creates index `IX_UserSkill_ProficiencyLevel`
- **Result**: migration expects column that does not exist.

## 3) Observations
- The **index configuration in `DatabaseIndexesConfiguration.cs` matches the actual Entities** in multiple places.
- The **`AddDatabaseIndexes_Migration.cs` file contains many column names that do not match the Entities**.
- Therefore, applying that migration as-is will likely fail on a fresh DB generated from Entities.

## 4) Recommended resolution strategy (pick one)

### Option A (recommended): Fix the migration/index script to match Entities
- Update `AddDatabaseIndexes_Migration.cs` to use correct columns:
  - `CommunityReplies`: `PostId`, `UserId`
  - `Proposals`: `FreelancerUserId`, `SentAt`
  - `Payments`: `PaymentProvider`, `CreatedAt`
  - `Transactions`: `Type`, `CreatedAt`
  - `Invoices`: `ProjectId`, `CreatedAt` (remove `UserId`, `IssueDate` indexes unless entity is updated)
  - `Reviews`: `TargetUserId`, `RatingValue`, `ContextEntityId`
  - `Ratings`: `UserId`, `AverageRating`
  - `UserSkills`: `ProvenYears`

### Option B: Rename / add missing fields in Entities to match migration
- This is riskier because it changes the canonical domain model and requires re-checking all services/controllers.

## 5) Frontend alignment items (before “update DB and frontend”)
- Align Employer onboarding:
  - Decide: do you want a `Company` table row created during step2?
    - If yes: backend `RegisterStep2Request` and controller must accept company fields OR new endpoint.
  - Otherwise: remove company-only fields from step2 submission and store them for later.

- Align JobSeeker onboarding:
  - If backend expects `cvUrl` (URL), either:
    - change UI to accept URL only, OR
    - implement upload endpoint to get URL then send `cvUrl`.

- Ensure role labels match exactly:
  - Backend expects: `Employer|JobSeeker|Freelancer|Client`.
  - Frontend stores local `userRole`: `employer|jobseeker` and maps to backend values during submission.

