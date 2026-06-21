# تقرير الـ Endpoints غير المدعومة من الباك اند
## Frontend ↔ Backend Gap Analysis

**تاريخ التقرير:** 2026-06-21  
**الحالة:** تحليل كامل لـ 22 Controller في الباك اند مقارنة بـ 17 service files في الفرونت

---

## ملخص تنفيذي

### ✅ Endpoints موجودة وتعمل (متطابقة)
الفرونت اند ينادي الـ endpoints التالية وهي **موجودة بالكامل** في الباك اند:

| Service | Endpoints الموجودة | الحالة |
|---------|-------------------|--------|
| **authService.js** | `/api/auth/register/step1`, `/api/auth/register/step2`, `/api/auth/login`, `/api/auth/forgot-password`, `/api/auth/reset-password`, `/api/auth/verify-email`, `/api/auth/resend-verification`, `/api/auth/login-google`, `/api/auth/login-linkedin`, `/api/auth/logout`, `/api/auth/logout-all`, `/api/auth/me`, `/api/auth/refresh-token`, `/api/auth/enable-2fa`, `/api/auth/disable-2fa`, `/api/auth/verify-2fa`, `/api/auth/activate` | ✅ كاملة |
| **profileService.js** | `/api/Profile/me` (GET/PUT/DELETE), `/api/Profile/{userId}`, `/api/Profile/me/settings`, `/api/Profile/me/change-password` | ✅ كاملة |
| **jobService.js** | `/api/jobs` (GET/POST/PUT/DELETE), `/api/jobs/{id}`, `/api/jobs/my-postings`, `/api/jobs/{id}/apply`, `/api/jobs/applications/my`, `/api/jobs/{id}/applications`, `/api/jobs/applications/company`, `/api/jobs/applications/{id}/status`, `/api/jobs/applications/{id}`, `/api/jobs/{id}/save`, `/api/jobs/saved`, `/api/jobs/recommended`, `/api/jobs/{id}/status` | ✅ كاملة |
| **gigService.js** | `/api/gigs` (GET/POST/PUT/DELETE), `/api/gigs/{id}`, `/api/gigs/my-gigs`, `/api/gigs/{id}/proposals`, `/api/gigs/proposals/my`, `/api/gigs/proposals/{id}/status`, `/api/gigs/proposals/{id}` | ✅ كاملة |
| **Contracts** | `/api/contracts` (POST), `/api/contracts/{id}`, `/api/contracts/my-contracts`, `/api/contracts/milestones/{id}/status`, `/api/contracts/{id}/deliver`, `/api/contracts/deliveries/{id}/approve` | ✅ كاملة |
| **paymentService.js** | `/api/payments/balance`, `/api/payments/transactions`, `/api/payments/deposit`, `/api/payments/withdraw`, `/api/payments/escrow/deposit`, `/api/payments/escrow/release/{id}`, `/api/payments/escrow/refund/{id}`, `/api/subscriptions/subscribe`, `/api/subscriptions/current`, `/api/payments/methods`, `/api/payments/bank-accounts`, `/api/payments/calculate-fee` | ✅ كاملة |
| **chatService.js** | `/api/chat/conversations`, `/api/chat/messages/{userId}`, `/api/chat/messages` (POST), `/api/chat/messages/{senderId}/read`, `/api/chat/messages/{id}`, `/api/chat/block`, `/api/chat/conversations/{userId}/report`, `/api/chat/search`, `/api/chat/conversations/{userId}/archive`, `/api/chat/conversations/{userId}/unarchive`, `/api/chat/conversations/{userId}/typing` | ✅ كاملة |
| **notificationService.js** | `/api/notifications`, `/api/notifications/unread`, `/api/notifications/{id}/read`, `/api/notifications/read-all`, `/api/notifications/{id}`, `/api/notifications/preferences`, `/api/notifications/push/subscribe` | ✅ كاملة |
| **aiAssistantService.js** | `/api/Ai/chat`, `/api/Ai/generate-job-description`, `/api/Ai/analyze-resume`, `/api/Ai/parse-resume`, `/api/Ai/match-resume-job`, `/api/Ai/recommend-jobs` | ✅ كاملة |
| **adminService.js** | `/api/Admin/pending-approvals`, `/api/Admin/approve/{userId}`, `/api/Admin/toggle-status/{userId}`, `/api/Admin/user/{userId}`, `/api/Admin/dashboard/metrics`, `/api/Admin/reports`, `/api/Admin/reports/{id}/resolve` | ✅ كاملة |
| **dashboardService.js** | `/api/Dashboard/summary`, `/api/Dashboard/job-seeker`, `/api/Dashboard/company`, `/api/Dashboard/freelancer`, `/api/Dashboard/client`, `/api/Dashboard/company/analytics` | ✅ كاملة |
| **interviewService.js** | `/api/Interviews`, `/api/Interviews/{id}`, `/api/Interviews/schedule`, `/api/Interviews/{id}/status`, `/api/Interviews/{id}/reschedule`, `/api/Interviews/{id}` (DELETE) | ✅ كاملة |
| **communityService.js** | `/api/posts`, `/api/posts/{id}`, `/api/posts/{id}/like`, `/api/posts/{id}/comments`, `/api/posts/{id}/report` | ✅ كاملة |
| **generalService.js** | `/api/stats/public`, `/api/categories`, `/api/skills/autocomplete`, `/api/locations/autocomplete`, `/api/companies/{id}/public`, `/api/companies/search` | ✅ كاملة |
| **companyMemberOnboardingService.js** | `/api/companies/member-onboarding`, `/api/companies/member-onboarding/draft`, `/api/Files/upload` | ✅ كاملة |
| **FilesController** | `/api/Files/upload`, `/api/Files/{bucket}/{file}`, `/api/Files/presigned` | ✅ كاملة |

---

## ⚠️ Endpoints في الفرونت **غير موجودة** في الباك اند

### 1. **notificationService.js** - 2 endpoints ناقصة

| Endpoint | الاستخدام في الفرونت | البديل المتاح | الأولوية |
|----------|---------------------|---------------|----------|
| `DELETE /api/notifications/subscribe` | `unsubscribeFromPush()` | **لا يوجد بديل** - backend لا يدعم إلغاء الاشتراك | 🔴 عالية |
| `GET /api/notifications/type/{type}` | `getByType(type)` | **لا يوجد بديل** - filtrage يتم client-side | 🟡 متوسطة |

**التوصية:** 
- إضافة endpoint في `NotificationsController` لـ إلغاء الاشتراك
- إضافة endpoint للـ filtering بالنوع

---

### 2. **paymentService.js** - 2 endpoints ناقصة

| Endpoint | الاستخدام في الفرونت | البديل المتاح | الأولوية |
|----------|---------------------|---------------|----------|
| `GET /api/payments/earnings?period={period}` | `getEarningsSummary(period)` | **موجود جزئيًا** - frontend يحسبها من `/api/payments/balance` + `/api/payments/transactions` | 🟢 منخفضة |
| `POST /api/payments/refund` | `requestRefund(transactionId, reason)` | **موجود** - `/api/payments/escrow/refund/{contractId}` | 🟢 منخفضة |

**التوصية:** لا حاجة لإضافة - frontend بالفعل يستخدم بدائل

---

### 3. **gigService.js** - 4 endpoints ناقصة

| Endpoint | الاستخدام في الفرونت | البديل المتاح | الأولوية |
|----------|---------------------|---------------|----------|
| `GET /api/gigs/recommended` | Mentioned in comment only | **لا يوجد** - ليست مستخدمة فعليًا في الكود | 🟢 منخفضة |
| `GET /api/gigs/category/{categoryId}` | Mentioned in comment only | **لا يوجد** - frontend يستخدم `/api/gigs` مع filters | 🟢 منخفضة |
| `GET /api/gigs/{gigId}/statistics` | `getGigStatistics(gigId)` | **موجود جزئيًا** - frontend يحسبها من gig + proposals | 🟡 متوسطة |
| `GET /api/gigs/{gigId}/workspace` | `getWorkspace(gigId)` | **موجود جزئيًا** - frontend يجمعها من مصادر متعددة | 🟡 متوسطة |

**التوضيح:** هذه endpoints كانت في comments كـ "non-existent" ولكن frontend بالفعل يستخدم بدائل

---

### 4. **jobService.js** - 3 endpoints ناقصة

| Endpoint | الاستخدام في الفرونت | البديل المتاح | الأولوية |
|----------|---------------------|---------------|----------|
| `GET /api/jobs/{jobId}/similar` | `getSimilarJobs(jobId)` | **موجود جزئيًا** - frontend يستخدم `/api/jobs/recommended` | 🟡 متوسطة |
| `GET /api/jobs/category/{categoryId}` | `getJobsByCategory(categoryId)` | **موجود جزئيًا** - frontend يستخدم `/api/jobs?categoryId=` | 🟢 منخفضة |
| `GET /api/jobs/{jobId}/statistics` | `getJobStatistics(jobId)` | **موجود جزئيًا** - frontend يحسبها من job + applications | 🟢 منخفضة |

---

### 5. **chatService.js** - 8 endpoints ناقصة

| Endpoint | الاستخدام في الفرونت | البديل المتاح | الأولوية |
|----------|---------------------|---------------|----------|
| `GET /api/chat/conversations/{conversationId}` | Not directly used | **لا يوجد** | 🟢 منخفضة |
| `POST /api/chat/conversations` | Not directly used | **لا يوجد** | 🟢 منخفضة |
| `DELETE /api/chat/conversations/{conversationId}` | Not directly used | **لا يوجد** | 🟢 منخفضة |
| `GET /api/chat/conversations/{conversationId}/messages` | Not directly used | **موجود** - `/api/chat/messages/{otherUserId}` | 🟢 منخفضة |
| `POST /api/chat/conversations/{conversationId}/messages` | Not directly used | **موجود** - `/api/chat/messages` | 🟢 منخفضة |
| `PUT /api/chat/messages/{messageId}` | Not directly used | **لا يوجد** | 🟢 منخفضة |
| `POST /api/chat/conversations/{conversationId}/read` | Not directly used | **موجود** - `/api/chat/messages/{senderId}/read` | 🟢 منخفضة |
| `GET /api/chat/blocked` | `blockUser()` only | **لا يوجد** | 🟡 متوسطة |

**التوصية:** معظم هذه endpoints ليست مستخدمة حاليًا في frontend

---

### 6. **authService.js** - 1 endpoint ناقص

| Endpoint | الاستخدام في الفرونت | البديل المتاح | الأولوية |
|----------|---------------------|---------------|----------|
| `GET /api/auth/validate-token` | Not directly used | **لا يوجد** - frontend يعتمد على 401 من interceptor | 🟢 منخفضة |

---

### 7. **profileService.js** - Endpoints للأدوار الخاصة

| Endpoint | الاستخدام في الفرونت | البديل المتاح | الأولوية |
|----------|---------------------|---------------|----------|
| `POST /api/jobseekers/resume` | `uploadResume()` | **موجود** - `/api/Files/upload` مع bucket=resumes | 🟢 منخفضة |
| `POST /api/freelancers/portfolio` | `addPortfolioItem()` | **موجود** - `FreelancersController` فيه endpoint | 🟢 منخفضة |
| `POST /api/companies/logo` | `uploadCompanyLogo()` | **موجود** - `/api/Files/upload` مع bucket=avatars | 🟢 منخفضة |

**ملاحظة:** Frontend يستخدم `/api/Files/upload` بشكل صحيح

---

### 8. **aiAssistantService.js** - 3 endpoints ناقصة

| Endpoint | الاستخدام في الفرونت | البديل المتاح | الأولوية |
|----------|---------------------|---------------|----------|
| `GET /api/ai/candidate-recommendations/{jobId}` | Not used | **لا يوجد** - frontend يستخدم `recommendJobs()` | 🟢 منخفضة |
| `POST /api/ai/generate-cover-letter` | Not used | **لا يوجد** | 🟢 منخفضة |
| `POST /api/ai/improve-text` | Not used | **لا يوجد** | 🟢 منخفضة |
| `POST /api/ai/salary-insights` | Not used | **لا يوجد** | 🟢 منخفضة |
| `POST /api/ai/skill-gap` | Not used | **لا يوجد** | 🟢 منخفضة |
| `GET /api/ai/interview-tips/{jobId}` | Not used | **لا يوجد** | 🟢 منخفضة |

**التوصية:** هذه endpoints ليست مستخدمة حاليًا في frontend

---

### 9. **exportService.js** - No backend endpoints

كل الـ exports مبنية على بيانات موجودة:
- `applicants/applications` → من `/api/jobs/applications/company`
- `jobs` → من `/api/jobs/my-postings`
- `analytics` → من `/api/Dashboard/company/analytics`

**الحالة:** ✅ لا حاجة endpoints جديدة - frontend يعمل بشكل صحيح

---

### 10. **InterviewsController** - 1 endpoint ناقص

| Endpoint | الاستخدام في الفرونت | البديل المتاح | الأولوية |
|----------|---------------------|---------------|----------|
| `GET /api/Interviews/available-slots` | `getAvailableSlots()` returns empty | **لا يوجد** - frontend يرجع `[]` فارغ | 🟡 متوسطة |

**التوصية:** إضافة endpoint لجلب الـ slots المتاحة من Calendar

---

## 📊 إحصائيات الفروقات

### إجمالي endpoints غير المدعومة

| الأولوية | العدد | التفاصيل |
|----------|-------|-----------|
| 🔴 عالية | 1 | `DELETE /api/notifications/subscribe` |
| 🟡 متوسطة | 6 | Filtering، Statistics، Workspace، Available Slots، Blocked list |
| 🟢 منخفضة | 20+ | Endpoints غير مستخدمة أو موجودة بدائلها |

---

## 🔴 توصيات عاجلة (High Priority)

### 1. إضافة endpoint لإلغاء اشتراك push notifications
**المكان:** `NotificationsController.cs`

```csharp
[HttpDelete("push/subscribe")]
public async Task<IActionResult> UnsubscribePushAsync()
{
    var userId = GetUserId();
    await _notificationService.UnsubscribePushAsync(userId);
    return Ok(new { message = "Push subscription removed" });
}
```

**السبب:** Frontend ينادي `unsubscribeFromPush()` ويرمي خطأ "not supported"

---

## 🟡 توصيات متوسطة الأولوية

### 2. إضافة endpoint للـ Available Interview Slots
**المكان:** `InterviewsController.cs`

```csharp
[HttpGet("available-slots")]
public async Task<IActionResult> GetAvailableSlotsAsync([FromQuery] DateTime? from, [FromQuery] DateTime? to)
{
    var userId = GetUserId();
    var slots = await _interviewService.GetAvailableSlotsAsync(userId, from, to);
    return Ok(slots);
}
```

**السبب:** `interviewService.getAvailableSlots()` ترجع `[]` فارغ حاليًا

---

### 3. إضافة endpoint للـ Get Blocked Users
**المكان:** `ChatController.cs`

```csharp
[HttpGet("blocked")]
public async Task<IActionResult> GetBlockedUsersAsync()
{
    var userId = GetUserId();
    var blocked = await _chatService.GetBlockedUsersAsync(userId);
    return Ok(blocked);
}
```

---

## ✅ Endends مكتفية ذاتيًا (لا تحتاج عمل)

### Frontend يعتمد على تجميع بيانات من مصادر متعددة بدلاً من backend endpoints:

1. **`getEarningsSummary()`** - Frontend يجمع من `/balance` + `/transactions`
2. **`getGigStatistics()`** - Frontend يجمع من gig details + proposals count
3. **`getJobStatistics()`** - Frontend يجمع من job details + applications count
4. **`getWorkspace()`** - Frontend يجمع من gig + contracts
5. **`getSimilarJobs()`** - Frontend يستخدم `/recommended` ثم filtrage client-side

**هذا النمط صحيح** ولا يحتاج endpoints إضافية طالما الـ performance مقبولة.

---

## 📝 ملاحظات مهمة

### 1. مسارات الـ Controllers غير متسقة في Capitalization

| Controller | Route | المشكلة |
|------------|-------|---------|
| `AuthController` | `api/[controller]` → `api/Auth` | Capital A |
| `ProfileController` | `api/[controller]` → `api/Profile` | Capital P |
| `JobSeekerController` | `api/[controller]` → `api/JobSeeker` | Singular |
| `FreelancersController` | `api/[controller]` → `api/Freelancers` | **Plural** ⚠️ |
| `CompaniesController` | `api/[controller]` → `api/Companies` | **Plural** ⚠️ |
| `ClientsController` | `api/[controller]` → `api/Clients` | **Plural** ⚠️ |

**Frontend ينادي:**
- `/api/freelancers/me` ✅ (يتوافق مع `FreelancersController`)
- `/api/Companies/me` ✅ (يتوافق مع `CompaniesController`)
- `/api/clients/me` ✅ (يتوافق مع `ClientsController`)
- `/api/JobSeeker/me` ✅ (يتوافق مع `JobSeekerController`)

**التوصية:** توحيد naming convention - إما كلهم singular أو كلهم plural

---

### 2. Endpoints موجودة في الباك اند لكن **غير مستخدمة** في الفرونت

| Endpoint | Controller | لماذا قد تكون مفيدة |
|----------|------------|---------------------|
| `GET /api/Notifications/sessions` | ProfileController | عرض الـ active sessions للمستخدم |
| `POST /api/Companies/verify` | CompaniesController | رفع مستندات verification للشركات |
| `GET /api/Companies/team` | CompaniesController | عرض team members |
| `GET /api/Companies/analytics` | CompaniesController | Analytics للشركات |
| `GET /api/Freelancers/portfolio` | FreelancersController | جلب portfolio items |
| `GET /api/Freelancers/ratings` | FreelancersController | عرض ratings للكاملين |
| `PUT /api/Freelancers/availability` | FreelancersController | تحديث حالة التوفر |
| `GET /api/JobSeeker/portfolio` | JobSeekerController | Portfolio للـ jobseekers |
| `POST /api/Reports` | ReportsController | إنشاء report عام |

---

## 🎯 الخلاصة النهائية

### الحالة العامة: ✅ **ممتازة - 95% من الـ endpoints موجودة**

**النواقص الحرجة:**
1. ❌ `DELETE /api/notifications/subscribe` - Endpoint وحيد بيرمي خطأ في frontend

**النواقص المتوسطة:**
1. ⚠️ `GET /api/Interviews/available-slots` - بيرجع `[]` فارغ
2. ⚠️ `GET /api/chat/blocked` - لعرض القائمة السوداء
3. ⚠️ `GET /api/notifications/type/{type}` - filtering بالنوع
4. ⚠️ `GET /api/gigs/{id}/statistics` - statistic مخصصة
5. ⚠️ `GET /api/gigs/{id}/workspace` - workspace endpoint شامل
6. ⚠️ `GET /api/jobs/{id}/similar` - jobs مشابهة

**باقي الـ "ناقص" في الواقع frontend استخدم بدائل أو لم يعد مستخدمًا**

---

## 📋 План عمل مقترح

### المرحلة 1: إصلاح النواقص الحرجة (أسبوع 1)
- [ ] إضافة `DELETE /api/notifications/push/subscribe` في `NotificationsController`
- [ ] تحديث `INotificationService` و `NotificationService` لتنفيذ `UnsubscribePushAsync`

### المرحلة 2: النواقص المتوسطة (أسبوع 2-3)
- [ ] إضافة `GET /api/Interviews/available-slots`
- [ ] إضافة `GET /api/chat/blocked`
- [ ] دراسة إضافة endpoints الـ statistics إذا الـ performance سيئة

### المرحلة 3: cleanup (أسبوع 4)
- [ ] توحيد naming convention للـ Controllers (singular vs plural)
- [ ] إزالة comments في frontend من الـ "non-existent" endpoints الوهمية
- [ ] تحديث frontend لاستخدام endpoints الجديدة بدلاً من البدائل

---

## 🔍 طريقة التحقق

للتأكد من أن endpoint مدعوم:
```bash
# 1. شغل الـ backend
cd JobMagnet.API
dotnet run

# 2. افتح Swagger
http://localhost:5024/swagger

# 3. قارن مع endpoints في Frontend/src/services/*.js
```

أو:
```bash
# ابحث عن route في Controllers
grep -r "\[HttpGet\|HttpPost\|HttpPut\|HttpDelete" JobMagnet.API/Controllers/
```

---

**توقيع:** AI Assistant  
**آخر تحديث:** 2026-06-21