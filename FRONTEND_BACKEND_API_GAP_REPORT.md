# تقرير ربط الفرونت مع الباك (Frontend ↔ Backend) - الفروقات والناقص

## 1) ملاحظات حرجة قبل أي Integration (لازم تتظبط)

### 1.1) مشكلة تكرار `/api`
- في `Frontend/MAESTA/Frontend/src/services/ApiService.js`:
  - `API_BASE_URL = https://localhost:7000/api`
- بينما أغلب الاستدعاءات في services بتستخدم مسارات تبدأ بـ `/api/...` مثل:
  - `ApiService.post('/api/auth/login', ...)`

ده بيخلي الـ URL النهائي يطلع غالبًا:
- `https://localhost:7000/api/api/auth/login`

وده **غلط**.

**لازم تحسموا واحدة من الاتنين:**
- **اختيار A (مفضل):**
  - خلي `API_BASE_URL = https://localhost:7000`
  - وسيب المسارات زي ما هي `/api/...`
- **اختيار B:**
  - سيب `API_BASE_URL = https://localhost:7000/api`
  - وعدّل كل المسارات داخل الـ services من `/api/...` إلى `...` (مثال: `/auth/login`)

### 1.2) مشكلة `response.data` بسبب interceptor
في `ApiService.js`:
- axios response interceptor بيرجع `response.data` مباشرة.

لكن في باقي الـ services معمول:
- `const response = await ApiService.get(...)`
- ثم `return response.data;`

ده ممكن يؤدي لنتيجة غلط (لأن `response` أصلاً هو `data`).

**الحل**: توحيد شكل الرجوع.
- إما ترجع `response` بدون `.data` داخل services
- أو تلغي interceptor اللي بيرجع `response.data`

---

## 2) وضع الباك اند في الريبو حاليًا
- موجود مشاريع:
  - `JobMagnet.Application`
  - `JobMagnet.Core`
  - `JobMagnet.Infrastructure`
- ملف الحل `JobMagnet.sln` فيه مشروع اسمه `JobMagnet.API` **لكن فولدره غير موجود داخل الريبو الحالي**.

**النتيجة:**
- مفيش مكان واضح للـ `Controllers` أو `Program.cs` أو Minimal APIs ضمن الملفات الموجودة.
- بالتالي حتى لو في Services داخل `JobMagnet.Application`، فمش هتلاقي Endpoints منشورة للفرونت.

---

## 3) الموجود فعليًا داخل `JobMagnet.Application`

### 3.1) Auth
- `IAuthService` + `AuthService` وفيهم:
  - `RegisterStep1Async`
  - `RegisterStep2Async`
  - `LoginAsync`
  - `RefreshTokenAsync`
  - `LogoutAsync`
  - `LogoutAllAsync`
  - `GetCurrentUserProfileAsync`

### 3.2) Profile
- `IProfileService.GetUserProfileAsync(userId)` فقط

### 3.3) Admin
- `GetPendingApprovalsAsync`
- `ApproveUserAsync`

### 3.4) Dashboard
- `GetUserDashboardSummaryAsync`

### 3.5) JWT
- `JwtTokenService` موجود

### 3.6) غير موجود في Application layer (ناقص)
مفيش Services/Handlers كاملة لـ:
- Jobs / Applications
- Gigs / Proposals / Contracts / Milestones
- Payments / Escrow / Wallet
- Notifications
- Chat
- AI Assistant
- Uploads/Attachments كـ features كاملة

---

## 4) الـ Endpoints المطلوبة من الفرونت (كما هي في `src/services/*`)

> ملحوظة: القائمة دي بتعكس ما الفرونت بيناديه فعليًا. بعض صفحات البحث/القوائم عليها mock، لكن باقي الوظائف متوقع لها API.

### 4.1) Auth (`authService.js`)
- **POST** `/api/auth/register`
- **POST** `/api/auth/login`
- **POST** `/api/auth/forgot-password`
- **POST** `/api/auth/reset-password`
- **GET** `/api/auth/verify-email/{token}`
- **POST** `/api/auth/resend-verification`
- **POST** `/api/auth/google-login`
- **POST** `/api/auth/linkedin-login`
- **GET** `/api/auth/me`
- **GET** `/api/auth/validate-token`
- **PUT** `/api/auth/change-password`
- **POST** `/api/auth/enable-2fa`
- **POST** `/api/auth/disable-2fa`
- **POST** `/api/auth/verify-2fa`

### 4.2) Profile + Roles (`profileService.js`)
#### General
- **GET** `/api/profile/me`
- **GET** `/api/profile/{userId}`
- **PUT** `/api/profile/me`
- **POST** `/api/profile/picture` *(multipart)*
- **DELETE** `/api/profile/picture`
- **PUT** `/api/profile/visibility`
- **PUT** `/api/profile/notifications`
- **POST** `/api/profile/deactivate`
- **DELETE** `/api/profile/delete` *(body: `{ password }`)*

#### Jobseeker
- **GET** `/api/jobseekers/me`
- **GET** `/api/jobseekers/{userId}`
- **PUT** `/api/jobseekers/me`
- **POST** `/api/jobseekers/resume` *(multipart)*
- **POST** `/api/jobseekers/experience`
- **PUT** `/api/jobseekers/experience/{experienceId}`
- **DELETE** `/api/jobseekers/experience/{experienceId}`
- **POST** `/api/jobseekers/education`
- **PUT** `/api/jobseekers/education/{educationId}`
- **DELETE** `/api/jobseekers/education/{educationId}`
- **PUT** `/api/jobseekers/skills` *(body: `{ skills }`)*

#### Freelancer
- **GET** `/api/freelancers/me`
- **GET** `/api/freelancers/{userId}`
- **PUT** `/api/freelancers/me`
- **POST** `/api/freelancers/portfolio`
- **PUT** `/api/freelancers/portfolio/{portfolioId}`
- **DELETE** `/api/freelancers/portfolio/{portfolioId}`
- **PUT** `/api/freelancers/rate` *(body: `{ hourlyRate }`)*

#### Company
- **GET** `/api/companies/me`
- **GET** `/api/companies/{companyId}`
- **PUT** `/api/companies/me`
- **POST** `/api/companies/logo` *(multipart)*
- **POST** `/api/companies/team`
- **DELETE** `/api/companies/team/{memberId}`

#### Client
- **GET** `/api/clients/me`
- **GET** `/api/clients/{clientId}`
- **PUT** `/api/clients/me`

### 4.3) Jobs + Applications (`jobService.js`)
#### Jobs
- **POST** `/api/jobs`
- **PUT** `/api/jobs/{jobId}`
- **DELETE** `/api/jobs/{jobId}`
- **GET** `/api/jobs/{jobId}/similar`
- **GET** `/api/jobs/category/{categoryId}`

#### Applications
- **POST** `/api/jobs/{jobId}/apply`
- **GET** `/api/jobs/applications/my`
- **GET** `/api/jobs/{jobId}/applications`
- **PUT** `/api/applications/{applicationId}/status`
- **DELETE** `/api/applications/{applicationId}`

#### Saved
- **POST** `/api/jobs/{jobId}/save`
- **DELETE** `/api/jobs/{jobId}/save`
- **GET** `/api/jobs/saved`

#### Company Job Management
- **GET** `/api/jobs/my-postings`
- **GET** `/api/companies/{companyId}/jobs`
- **PUT** `/api/jobs/{jobId}/status` *(body: `{ isPublished }`)*
- **GET** `/api/jobs/{jobId}/statistics`

### 4.4) Gigs/Proposals/Contracts/Milestones (`gigService.js`)
#### Gigs
- **POST** `/api/gigs`
- **PUT** `/api/gigs/{gigId}`
- **DELETE** `/api/gigs/{gigId}`
- **GET** `/api/gigs/category/{categoryId}`
- **GET** `/api/gigs/my-postings`
- **GET** `/api/gigs/{gigId}/statistics`
- **GET** `/api/gigs/{gigId}/workspace`

#### Proposals
- **POST** `/api/gigs/{gigId}/proposals`
- **GET** `/api/proposals/my`
- **GET** `/api/gigs/{gigId}/proposals`
- **PUT** `/api/proposals/{proposalId}`
- **DELETE** `/api/proposals/{proposalId}`
- **POST** `/api/proposals/{proposalId}/accept`
- **POST** `/api/proposals/{proposalId}/reject`
- **POST** `/api/proposals/{proposalId}/contract`

#### Contracts
- **GET** `/api/contracts/my`
- **GET** `/api/contracts/{contractId}`
- **PUT** `/api/contracts/{contractId}/status` *(body: `{ status }`)*
- **POST** `/api/contracts/{contractId}/milestones`

#### Milestones
- **PUT** `/api/milestones/{milestoneId}`
- **POST** `/api/milestones/{milestoneId}/complete`
- **POST** `/api/milestones/{milestoneId}/approve`

### 4.5) Payments (`paymentService.js`)
- **GET** `/api/payments/methods`
- **POST** `/api/payments/methods`
- **DELETE** `/api/payments/methods/{methodId}`
- **GET** `/api/payments/transactions?{filters}`
- **GET** `/api/payments/balance`
- **GET** `/api/payments/earnings?period={period}`
- **POST** `/api/payments/deposit`
- **POST** `/api/payments/withdraw`
- **POST** `/api/payments/escrow`
- **POST** `/api/payments/escrow/{escrowId}/release`
- **GET** `/api/payments/invoices`
- **POST** `/api/payments/refund`
- **POST** `/api/payments/bank-accounts`
- **GET** `/api/payments/calculate-fee?amount={amount}&type={type}`

### 4.6) Notifications (`notificationService.js`)
- **GET** `/api/notifications?page={page}&limit={limit}`
- **GET** `/api/notifications/unread-count`
- **PUT** `/api/notifications/{notificationId}/read`
- **PUT** `/api/notifications/read-all`
- **DELETE** `/api/notifications/{notificationId}`
- **GET** `/api/notifications/preferences`
- **PUT** `/api/notifications/preferences`
- **POST** `/api/notifications/subscribe`
- **DELETE** `/api/notifications/subscribe`
- **GET** `/api/notifications/type/{type}`

### 4.7) Chat (`chatService.js`)
#### Conversations
- **GET** `/api/chat/conversations`
- **GET** `/api/chat/conversations/{conversationId}`
- **POST** `/api/chat/conversations` *(body: `{ recipientId, message? }`)*
- **DELETE** `/api/chat/conversations/{conversationId}`
- **POST** `/api/chat/conversations/{conversationId}/archive`
- **POST** `/api/chat/conversations/{conversationId}/unarchive`
- **GET** `/api/chat/conversations/archived`

#### Messages
- **GET** `/api/chat/conversations/{conversationId}/messages?page={page}&limit={limit}`
- **POST** `/api/chat/conversations/{conversationId}/messages` *(json or multipart)*
- **PUT** `/api/chat/messages/{messageId}`
- **DELETE** `/api/chat/messages/{messageId}`
- **POST** `/api/chat/conversations/{conversationId}/read`
- **POST** `/api/chat/conversations/{conversationId}/typing`

#### Search/Moderation
- **GET** `/api/chat/search?q={query}`
- **GET** `/api/chat/conversations/{conversationId}/search?q={query}`
- **POST** `/api/chat/block/{userId}`
- **DELETE** `/api/chat/block/{userId}`
- **GET** `/api/chat/blocked`
- **GET** `/api/chat/unread-count`
- **POST** `/api/chat/messages/{messageId}/report`
- **POST** `/api/chat/conversations/{conversationId}/report`

### 4.8) AI (`aiAssistantService.js`)
- **GET** `/api/ai/candidate-recommendations/{jobId}`
- **POST** `/api/ai/generate-cover-letter`
- **POST** `/api/ai/improve-text`
- **POST** `/api/ai/salary-insights`
- **POST** `/api/ai/skill-gap`
- **POST** `/api/ai/generate-job-description`
- **GET** `/api/ai/interview-tips/{jobId}`

---

## 5) Controllers/Services المقترحة (اللي لازم تكون موجودة في الباك)

### 5.1) Controllers (Web API)
- `AuthController`
- `ProfileController`
- `JobSeekersController`
- `FreelancersController`
- `CompaniesController`
- `ClientsController`
- `JobsController`
- `ApplicationsController`
- `GigsController`
- `ProposalsController`
- `ContractsController`
- `MilestonesController`
- `PaymentsController`
- `NotificationsController`
- `ChatController`
- `AiController`

### 5.2) Application Services / Use Cases
لكل Controller فوق محتاج:
- `I<Feature>Service`
- `<Feature>Service`
- DTOs + Validation + Authorization

---

## 6) سؤال لازم يتحسم عشان نكمل Diff دقيق (الموجود vs الناقص)

**فين مشروع الـ API Host؟**
- في `JobMagnet.sln` مذكور `JobMagnet.API`، لكن فولدره مش موجود داخل الملفات الحالية.

السيناريوهات:
- المشروع موجود عندك لكن مش متسحب/مش موجود داخل نفس المسار
- أو المشروع اتشال وعايزين نعمل API host جديد

---

## 7) حالة التقدم
- تم استخراج كل endpoints المطلوبة من الفرونت.
- جاري تحديد مكان مشروع الـ API host لتحديد endpoints الموجودة فعليًا ومين الناقص بالظبط.
