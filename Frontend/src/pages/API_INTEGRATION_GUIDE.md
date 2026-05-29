# Frontend Pages - API Integration Guide

## Overview
This document provides a comprehensive guide to API integrations for all pages in the MAESTA Frontend application. Each page is organized by category, detailing its purpose, API endpoints, services used, and data flow.

---

## Base API Configuration

### API Service
- **File**: `src/services/ApiService.js`
- **Base URL**: `http://localhost:5024` (or `REACT_APP_API_URL`)
- **Authentication**: Bearer Token (JWT) injected via request interceptor
- **Default Headers**: `Content-Type: application/json`
- **Features**:
  - Auto-logout on 401 (Unauthorized)
  - Global error handling
  - Multipart file upload support

### API Methods
```javascript
ApiService.get(url, config)
ApiService.post(url, data, config)
ApiService.put(url, data, config)
ApiService.patch(url, data, config)
ApiService.delete(url, config)
ApiService.upload(url, formData, config)  // Multipart form data
```

---

## 1. Authentication & Authorization Pages

### 1.1 Login Page (`Login.jsx`)
**Purpose**: User authentication via email/password

**API Integration**:
- **Service**: `authService`
- **Method**: `login(credentials)`
- **Endpoint**: `POST /api/auth/login`
- **Request Body**:
  ```javascript
  {
    email: string,
    password: string
  }
  ```
- **Response**: 
  - `token` (JWT)
  - `user` object with userType, profile info

**Data Flow**:
1. User enters email/password
2. Form validation (email format, password length ≥ 6)
3. `handleSubmit` → `login()` (AuthContext)
4. Token stored in localStorage
5. Navigation to `/dashboard` or redirect target

**Error Handling**:
- Display validation errors inline
- Show API error messages in alert
- Clear errors on input change

---

### 1.2 Registration Pages

#### Registration Page (`registration-page.jsx`)
**Purpose**: Step 1 of user registration - basic account creation

**API Integration**:
- **Service**: `authService`
- **Method**: `registerStep1(data)`
- **Endpoint**: `POST /api/auth/register/step1`
- **Request Body**:
  ```javascript
  {
    email: string,
    password: string,
    confirmPassword: string,
    userType: 'JobSeeker' | 'Company' | 'Freelancer' | 'Client',
    agreeToTerms: boolean
  }
  ```
- **Response**: Confirmation + prompt for Step 2

---

#### JobSeeker Onboarding (`JobSeekerOnboarding.jsx`)
**Purpose**: Step 2 of registration - profile completion for job seekers

**API Integration**:
- **Service**: `authService`
- **Method**: `registerStep2(data)`
- **Endpoint**: `POST /api/auth/register/step2`
- **Request Body** (RegisterStep2Request DTO):
  ```javascript
  {
    userType: "JobSeeker",
    professionalTitle: string,        // e.g., "Civil Engineer"
    experienceYears: number,          // 0-50
    bio: string,                      // 10-2000 characters
    cvUrl: string (optional),         // URL to CV/Resume
    preferredJobType: string,         // FullTime|PartTime|Contract|Internship|Remote|Hybrid
    profilePictureUrl: string,        // Optional
    location: string (optional)
  }
  ```
- **Response**: User profile completion confirmation

**Data Flow**:
1. Fill professional info (required fields)
2. Validate form (character limits, field formats)
3. Upload resume (PDF/DOC/DOCX max 10MB)
4. Upload profile picture (PNG/JPG/SVG max 5MB)
5. Submit → `registerStep2()` → `/dashboard`

---

#### Company Onboarding (`CompanyOnBoarding.jsx`)
**Purpose**: Step 2 of registration for companies

**API Integration**:
- Similar to JobSeeker but different fields
- Endpoint: `POST /api/auth/register/step2`
- Company-specific fields: companyName, industry, companySize, website, etc.

---

#### Freelancer Onboarding (`FreelancerOnboarding.jsx`)
**Purpose**: Step 2 of registration for freelancers

**API Integration**:
- Freelancer-specific fields: skills, hourlyRate, portfolioUrl, etc.

---

#### Client Onboarding (`CompanyMemberOnBoarding.jsx`)
**Purpose**: Step 2 of registration for clients

---

### 1.3 Password Management

#### Forgot Password Page (`ForgetPasswordPage.jsx`)
**API Integration**:
- **Endpoint**: `POST /api/auth/forgot-password`
- **Request**: `{ email: string }`
- **Response**: Confirmation email sent

---

#### Reset Password Page (`ResetPasswordPage.jsx`)
**API Integration**:
- **Endpoint**: `POST /api/auth/reset-password`
- **Request**: `{ token: string, newPassword: string }`

---

#### Email Verification (`VerificationEmailPage.jsx`)
**API Integration**:
- **Endpoint**: `POST /api/auth/verify-email`
- **Request**: `{ token: string }`

---

## 2. Job Pages

### 2.1 Job Search Page (`JobSearchPage.jsx`)
**Purpose**: Browse and search job listings with filters and pagination

**API Integration**:
- **Service**: `jobService`
- **Primary Method**: `searchJobs(searchParams)`
- **Endpoint**: `GET /api/jobs`

**Request Parameters** (JobSearchRequest DTO):
```javascript
{
  keyword: string (optional),
  location: string (optional),
  jobType: string (optional),              // FullTime, PartTime, Contract, etc.
  skills: string[] (optional),             // Array of required skills
  experienceLevel: string (optional),      // Entry, Mid, Senior
  minSalary: number (optional),
  maxSalary: number (optional),
  sortBy: string (optional),               // relevance, date, salary
  pageNumber: number,                      // Starting from 1
  pageSize: number                         // Items per page (default: 10)
}
```

**Response** (PagedJobsResponse DTO):
```javascript
{
  jobs: [
    {
      jobId: string,
      title: string,
      companyName: string,
      location: string,
      jobType: string,
      minSalary: number,
      maxSalary: number,
      isSaved: boolean,
      // ... other fields
    }
  ],
  totalCount: number,
  pageNumber: number,
  pageSize: number
}
```

**Data Flow**:
1. User enters search filters (keyword, location, salary range, etc.)
2. Click "Search" → `fetchJobs()`
3. API call with pagination (page 1, limit 10)
4. Display job cards with save functionality
5. Click pagination to fetch next page

**Child Functions**:
- `handleSearch()`: Update filter and reset to page 1
- `handleFilterChange()`: Apply new filters
- `handlePageChange()`: Navigate to different page
- `handleSaveJob()`: Toggle job bookmark status
- `resetFilters()`: Clear all filters

---

### 2.2 Job Details Page (`JobDetailsPage.jsx`)
**Purpose**: Display full job information, company details, and application options

**API Integration**:
- **Service**: `jobService`
- **Endpoints**:
  - `getJobById(jobId)` → `GET /api/jobs/{jobId}`
  - `getSimilarJobs(jobId)` → (Currently mocked, returns [])
  - `saveJob(jobId)` → `POST /api/jobs/{jobId}/save`
  - `unsaveJob(jobId)` → `DELETE /api/jobs/{jobId}/save`

**Request/Response**:
```javascript
// GET /api/jobs/{jobId}
{
  jobId: string,
  title: string,
  description: string,                // HTML content
  company: {
    name: string,
    logo: string (URL),
    industry: string,
    description: string
  },
  location: string,
  type: string | jobType: string,
  salary: string | minSalary & maxSalary,
  experienceLevel: string,
  requirements: string[],
  responsibilities: string[],
  skills: string[],
  benefits: string[],
  deadline: string (ISO date),
  createdAt: string (ISO date),
  isSaved: boolean
}
```

**Data Flow**:
1. Load job ID from URL params
2. Fetch job details + fetch similar jobs
3. Display job overview in main content
4. Show company info in sidebar
5. Similar jobs carousel at bottom
6. User can save/unsave job
7. Click "Apply Now" → navigate to `/jobs/{jobId}/apply`

---

### 2.3 Job Application Page (`JobApplicationPage.jsx`)
**Purpose**: Apply for a job with custom application form

**API Integration**:
- **Service**: `jobService`
- **Method**: `applyToJob(jobId, applicationData)`
- **Endpoint**: `POST /api/jobs/{jobId}/apply`
- **Request Body**:
  ```javascript
  {
    coverletter: string,
    answers: [                // Answers to job-specific questions
      { questionId: string, answer: string }
    ]
  }
  ```

---

### 2.4 Job Posting Page (`JobPostingPage.jsx`)
**Purpose**: Create and publish new job listings

**API Integration**:
- **Service**: `jobService`
- **Method**: `createJob(jobData)`
- **Endpoint**: `POST /api/jobs`
- **Request Body**:
  ```javascript
  {
    title: string,
    description: string,                // Rich HTML
    location: string,
    jobType: string,                    // FullTime, PartTime, Contract, Internship
    minSalary: number,
    maxSalary: number,
    requiredSkills: string[],
    experienceLevel: string,            // Entry, Mid, Senior
    requirements: string[],
    responsibilities: string[],
    benefits: string[],
    deadline: string (ISO date)
  }
  ```

---

### 2.5 Saved Jobs Page (`SavedJobsPage.jsx`)
**Purpose**: View all bookmarked/saved jobs

**API Integration**:
- **Service**: `jobService`
- **Method**: `getSavedJobs()` (if available) or custom endpoint
- **Endpoint**: `GET /api/jobs/saved` or `GET /api/jobs?saved=true`

---

## 3. Gig/Freelance Pages

### 3.1 Gig Listing Page (`GigListingPage.jsx`)
**Purpose**: Browse and search available gigs/projects for freelancers

**API Integration**:
- **Service**: `useGig()` (Context API + Service)
- **Method**: `fetchGigs(filters, page, limit)`
- **Endpoint**: `GET /api/gigs`

**Request Parameters**:
```javascript
{
  search: string,                      // Project title/description search
  budget: { min: number, max: number },
  type: string,                        // Fixed, Hourly, etc.
  duration: string,                    // Short, Long, Ongoing
  skills: string[],
  experienceLevel: string,
  pageNumber: number,
  pageSize: number
}
```

**Response**:
```javascript
{
  gigs: [
    {
      id | projectId: string,
      title: string,
      description: string,
      budget: number | { min, max },
      duration: string,
      skills: string[],
      proposals: number,
      // ... other fields
    }
  ],
  total: number
}
```

---

### 3.2 Gig Details Page (`GigDetailsPage.jsx`)
**Purpose**: View full gig information and submit proposals

**API Integration**:
- **Endpoint**: `GET /api/gigs/{gigId}`
- **Additional Actions**: View proposals, submit proposal

---

### 3.3 Gig Posting Page (`GigPostingPage.jsx`)
**Purpose**: Create and post new gig/project

**API Integration**:
- **Endpoint**: `POST /api/gigs`
- **Request**: Gig creation data (title, budget, skills, duration, etc.)

---

### 3.4 Gig Bidding Page (`GigBiddingPage.jsx`)
**Purpose**: Submit proposals/bids for available gigs

**API Integration**:
- **Endpoint**: `POST /api/gigs/{gigId}/proposals`
- **Request**: { proposalAmount: number, message: string, timeline: string }

---

### 3.5 Workspace Page (`WorkspacePage.jsx`)
**Purpose**: Freelancer workspace for managing active projects and contracts

---

### 3.6 Gig Management Page (`GigManagementPage.jsx`)
**Purpose**: Manage posted gigs and view applications

**API Integration**:
- **Endpoint**: `GET /api/gigs/my` (Get user's posted gigs)
- **Endpoint**: `GET /api/gigs/{gigId}/proposals` (View proposals for a gig)

---

## 4. Dashboard Pages

### 4.1 Main Dashboard (`Dashboard.jsx`)
**Purpose**: Role-based dashboard entry point

**API Integration**:
- **Service**: `useJobseekerLogic()` or role-specific hook
- **Endpoints** (varies by role):
  - JobSeeker: `GET /api/dashboard/jobseeker`
  - Company: `GET /api/dashboard/company`
  - Freelancer: `GET /api/dashboard/freelancer`
  - Client: `GET /api/dashboard/client`
  - Admin: `GET /api/dashboard/admin`

---

### 4.2 Job Seeker Dashboard (`JobseekerDashboard.jsx`)
**Purpose**: JobSeeker-specific dashboard with applications, saved jobs, and recommendations

**API Integration**:
- **Endpoints**:
  - `GET /api/dashboard/jobseeker/applications` - Application status
  - `GET /api/dashboard/jobseeker/recommended-jobs` - Personalized recommendations
  - `GET /api/dashboard/jobseeker/saved-jobs` - Bookmarked jobs
  - `GET /api/dashboard/jobseeker/stats` - Profile completion, applications count

**Data Displayed**:
- Application statistics
- Recommended jobs
- Saved jobs count
- Profile completion percentage
- Recent activity

---

### 4.3 Company Dashboard (`CompanyDashboard.jsx`)
**Purpose**: Company-specific dashboard for recruiting and job management

**API Integration**:
- **Endpoints**:
  - `GET /api/dashboard/company/jobs` - Posted jobs
  - `GET /api/dashboard/company/applicants` - Job applicants
  - `GET /api/dashboard/company/interviews` - Scheduled interviews
  - `GET /api/dashboard/company/stats` - Hiring metrics

---

### 4.4 Admin Dashboard (`AdminDashboard.jsx`)
**Purpose**: Administrative dashboard for system management

**Components**:
- User Management
- Job Management
- Content Moderation
- Subscription Management
- Staff Management
- Statistics
- Pending Actions
- Recent Activity

**API Integration**:
- `GET /api/admin/users` - List users
- `GET /api/admin/jobs` - Manage jobs
- `GET /api/admin/reports` - Content reports
- `GET /api/admin/subscriptions` - Subscription data
- `GET /api/admin/staff` - Staff members
- `GET /api/admin/statistics` - System stats

---

### 4.5 Freelancer Dashboard (`FreelancerDashboard.jsx`)
**Purpose**: Freelancer-specific dashboard

**API Integration**:
- `GET /api/dashboard/freelancer/projects` - Active projects
- `GET /api/dashboard/freelancer/earnings` - Earnings overview
- `GET /api/dashboard/freelancer/stats` - Freelancer stats

---

## 5. Profile Pages

### 5.1 Job Seeker Profile (`JobSeekerProfile.jsx`)
**Purpose**: Display job seeker profile with experience, education, and applications

**API Integration**:
- **Service**: `useProfile()` (Context API)
- **Data Source**: `jobSeekerData` from ProfileContext

**Data Structure**:
```javascript
{
  fullName: string,
  email: string,
  phoneNumber: string,
  profilePictureUrl: string,
  profile: {
    headline: string,
    location: string,
    summary: string,
    identityVerificationStatus: 'Verified' | 'Pending' | 'NotVerified',
    resumeUrl: string
  },
  skills: [ { name: string, proficiencyLevel: string } ],
  experiences: [ { id, jobTitle, companyName, startDate, endDate, description } ],
  education: [ { id, institutionName, degree, fieldOfStudy, startYear, endYear } ],
  applications: [ { id, jobTitle, company, status, appliedAt, matchScore } ],
  isEmailVerified: boolean
}
```

---

### 5.2 Company Profile (`CompanyProfile.jsx`)
**Purpose**: Display company profile information

---

### 5.3 Freelancer Profile (`FreelancerProfile.jsx`)
**Purpose**: Display freelancer profile with portfolio and ratings

---

### 5.4 Client Profile (`ClientProfile.jsx`)
**Purpose**: Display client profile

---

### 5.5 Edit Profiles

#### Edit Job Seeker Profile (`EditJobSeekerProfile.jsx`)
- **API**: `PUT /api/profiles/jobseeker` - Update profile
- **Request**: Updated profile data

#### Edit Company Profile (`EditCompanyProfile.jsx`)
- **API**: `PUT /api/profiles/company` - Update company info

#### Edit Freelancer Profile (`EditFreelancerProfile.jsx`)
- **API**: `PUT /api/profiles/freelancer` - Update freelancer info

#### Edit Client Profile (`EditClientProfile.jsx`)
- **API**: `PUT /api/profiles/client` - Update client info

---

## 6. Notification Pages

### 6.1 Notifications Center (`NotificationsCenterPage.jsx`)
**Purpose**: Comprehensive notification management with filters and bulk actions

**API Integration**:
- **Service**: `useNotifications()` (Context API)
- **Endpoints**:
  - `GET /api/notifications` - Get all notifications
  - `PATCH /api/notifications/read` - Mark as read
  - `DELETE /api/notifications/{id}` - Delete notification

**Features**:
- Filter by category (Jobs, Applications, Messages, System, etc.)
- Search notifications
- Mark all as read
- Bulk delete
- Group by date
- Unread badge count

**Data Structure**:
```javascript
{
  id: string,
  title: string,
  message: string,
  category: string,              // Jobs | Applications | Messages | System
  type: string,                  // JobPosted | ApplicationReceived | MessageNew | etc.
  isRead: boolean,
  createdAt: string (ISO date),
  data: {
    jobId?: string,
    projectId?: string,
    conversationId?: string,
    userId?: string
  }
}
```

---

### 6.2 Notification Settings (`NotificationSettingsPage.jsx`)
**Purpose**: Configure notification preferences

**API Integration**:
- **Endpoint**: `GET /api/notifications/settings` - Get user preferences
- **Endpoint**: `PUT /api/notifications/settings` - Update preferences

**Settings**:
- Email notifications (enabled/disabled by category)
- In-app notifications (enabled/disabled by category)
- Notification frequency
- Quiet hours

---

## 7. Subscription & Payment Pages

### 7.1 Subscription Plans Page (`SubscriptionPlansPage.jsx`)
**Purpose**: Display available subscription plans and pricing

**API Integration**:
- **Service**: `useSubscription()` (Context API)
- **Endpoint**: `GET /api/subscriptions/plans`
- **Response**:
  ```javascript
  [
    {
      id: string,
      name: string,              // Starter, Professional, Enterprise
      price: number,
      billingPeriod: 'monthly' | 'yearly',
      features: string[],
      limitations: string[],
      currentPlan: boolean
    }
  ]
  ```

---

### 7.2 Payment Page (`PaymentPage.jsx`)
**Purpose**: Payment processing and checkout

**API Integration**:
- **Service**: `useSubscription()`
- **Method**: `subscribeToPlan(planId, billingPeriod, paymentDetails)`
- **Endpoint**: `POST /api/subscriptions/subscribe`
- **Request**:
  ```javascript
  {
    planId: string,
    billingPeriod: 'monthly' | 'yearly',
    paymentDetails: {
      cardNumber: string,
      expiryDate: string,
      cvv: string,
      billingAddress: string
    }
  }
  ```

**Response**:
```javascript
{
  success: boolean,
  message: string,
  subscriptionId: string,
  activeUntil: string (ISO date)
}
```

**Data Flow**:
1. Select plan → View pricing
2. Click subscribe → Payment page
3. Enter payment details
4. Submit → API call
5. Success → Redirect to dashboard
6. Error → Display error message

---

## 8. Chat/Messaging Page

### 8.1 Chat Page (`ChatPage.jsx`)
**Purpose**: Real-time messaging interface

**API Integration**:
- **Endpoint**: `GET /api/conversations` - Get conversation list
- **Endpoint**: `GET /api/conversations/{conversationId}/messages` - Get messages
- **Endpoint**: `POST /api/messages` - Send message
- **WebSocket**: Real-time message updates (if implemented)

**Data Structure**:
```javascript
Conversation: {
  id: string,
  participants: [ { id, name, avatar } ],
  lastMessage: { text, timestamp, senderId },
  unreadCount: number
}

Message: {
  id: string,
  conversationId: string,
  senderId: string,
  text: string,
  timestamp: string (ISO date),
  isRead: boolean
}
```

---

## 9. Error Handling Strategy

### Global Error Handling
```javascript
// ApiService auto-handles:
- 401 Unauthorized → Auto-logout, redirect to /login
- Network errors → Log and reject
- Response errors → Reject with error details

// Page-level handling:
- Catch errors in try-catch blocks
- Display user-friendly error messages
- Provide retry or fallback options
```

### Common Error Responses
```javascript
{
  status: number,
  data: {
    message: string,
    errors: { field: string, message: string }[]
  }
}
```

---

## 10. Context & State Management

### Key Context Providers

1. **AuthContext** (`src/context/AuthContext.js`)
   - Methods: `login()`, `logout()`, `registerStep1()`, `checkAuth()`
   - Stores: auth token, user data, auth status

2. **ProfileContext** (`src/context/ProfileContext.js`)
   - Stores: jobSeekerData, companyData, freelancerData
   - Methods: `updateProfile()`, `fetchProfile()`

3. **NotificationContext** (`src/context/NotificationContext.js`)
   - Methods: `markAllAsRead()`, `deleteNotification()`
   - Stores: notifications[], unreadCount

4. **SubscriptionContext** (`src/context/SubscriptionContext.js`)
   - Methods: `subscribeToPlan()`, `fetchPlans()`
   - Stores: plans[], currentSubscription

5. **GigContext** (`src/context/GigContext.js`)
   - Methods: `fetchGigs()`, `fetchGigById()`
   - Stores: gigs[], currentGig

---

## 11. Environment Variables

```env
REACT_APP_API_URL=http://localhost:5024
REACT_APP_API_TIMEOUT=30000
REACT_APP_LOG_LEVEL=debug
```

---

## 12. Authentication Flow

```
┌─────────────┐
│   Login     │
└──────┬──────┘
       │ POST /api/auth/login
       ▼
┌─────────────────┐
│  Get JWT Token  │
└──────┬──────────┘
       │ Store in localStorage
       ▼
┌──────────────────────┐
│ Attach to every      │
│ request via Bearer   │
└──────┬───────────────┘
       │
       ▼
┌──────────────┐
│  API Calls   │
└──────┬───────┘
       │
       ├─401──────────┐
       │              │
       ▼              ▼
    Success      Auto-logout
                 Redirect /login
```

---

## 13. Common API Request Patterns

### Pagination Pattern
```javascript
const [pagination, setPagination] = useState({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
});

const params = {
  pageNumber: pagination.page,
  pageSize: pagination.limit
};

const response = await service.search(params);
setPagination(prev => ({
  ...prev,
  total: response.totalCount,
  totalPages: Math.ceil(response.totalCount / pagination.limit)
}));
```

### Filter Pattern
```javascript
const [filters, setFilters] = useState({
  keyword: '',
  location: '',
  salary: { min: '', max: '' }
});

const handleFilterChange = (newFilters) => {
  setFilters(prev => ({ ...prev, ...newFilters }));
  setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1
};

const fetchData = () => {
  const params = {
    ...filters,
    pageNumber: pagination.page,
    pageSize: pagination.limit
  };
  service.search(params);
};
```

### Search Pattern
```javascript
const handleSearch = (searchParams) => {
  setFilters(prev => ({ ...prev, ...searchParams }));
  setPagination(prev => ({ ...prev, page: 1 }));
  fetchData();
};
```

---

## 14. Quick Reference - Service Methods

| Service | Method | Endpoint | Purpose |
|---------|--------|----------|---------|
| jobService | searchJobs() | GET /api/jobs | Search jobs |
| jobService | getJobById() | GET /api/jobs/{id} | Get job details |
| jobService | createJob() | POST /api/jobs | Post new job |
| jobService | applyToJob() | POST /api/jobs/{id}/apply | Apply for job |
| jobService | saveJob() | POST /api/jobs/{id}/save | Save job |
| jobService | unsaveJob() | DELETE /api/jobs/{id}/save | Unsave job |
| authService | login() | POST /api/auth/login | User login |
| authService | registerStep1() | POST /api/auth/register/step1 | Registration step 1 |
| authService | registerStep2() | POST /api/auth/register/step2 | Registration step 2 |
| gigService | fetchGigs() | GET /api/gigs | Search gigs |
| subscriptionService | subscribeToPlan() | POST /api/subscriptions/subscribe | Subscribe to plan |

---

## 15. Notes & Considerations

1. **Mock Data**: Some endpoints (like `getSimilarJobs`) are currently mocked and return empty arrays
2. **File Uploads**: Use `ApiService.upload()` for multipart form data
3. **Token Expiry**: 401 responses trigger auto-logout
4. **Pagination**: Always reset page to 1 when filters change
5. **Error Messages**: Show user-friendly messages, not raw API errors
6. **Loading States**: Implement loading spinners during API calls
7. **Empty States**: Handle "no results" gracefully
8. **Caching**: Some contexts cache data to reduce API calls
9. **Validation**: Client-side validation before API calls
10. **CORS**: Configured with `withCredentials: true` for cookie support

---

**Last Updated**: 2026-05-27  
**Generated For**: MAESTA Frontend Application  
**API Version**: 2.0.0
