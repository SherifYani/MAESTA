# MAESTA — Project Documentation

> **Type:** Graduation Project (Frontend Demo)  
> **Authors:** Mohamed Amin, Sherif Talaat, Shahd Mohay  
> **Stack:** React 18, React Router v6, Context API, CSS Modules  
> **Status:** Demo-ready (mock data, no live backend)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Folder Structure](#3-folder-structure)
4. [Routing Architecture](#4-routing-architecture)
5. [Pages & Features](#5-pages--features)
   - 5.1 [Public Pages](#51-public-pages)
   - 5.2 [Authentication Flow](#52-authentication-flow)
   - 5.3 [Job Seeker Dashboard](#53-job-seeker-dashboard)
   - 5.4 [Company Dashboard](#54-company-dashboard)
   - 5.5 [Admin Dashboard](#55-admin-dashboard)
   - 5.6 [Jobs Module](#56-jobs-module)
   - 5.7 [Gigs Module](#57-gigs-module)
   - 5.8 [AI Tools Module](#58-ai-tools-module)
   - 5.9 [Payment & Escrow](#59-payment--escrow)
   - 5.10 [Common Modules](#510-common-modules)
6. [Component Library](#6-component-library)
7. [State Management & Context API](#7-state-management--context-api)
8. [Services Layer](#8-services-layer)
9. [Design System](#9-design-system)
10. [Mock Data Strategy](#10-mock-data-strategy)
11. [Performance Architecture](#11-performance-architecture)
12. [Known Limitations & Gaps](#12-known-limitations--gaps)

---

## 1. Project Overview

**MAESTA** is a comprehensive **job marketplace platform** designed to connect job seekers, companies, and freelancers. It supports three distinct user roles, each with a dedicated dashboard experience, and includes a gigs marketplace, an AI-powered toolset, a real-time chat system, a payment/escrow flow, and a full administrative backend.

### Core Value Propositions

| Feature | Description |
|---|---|
| **Smart Job Matching** | Skill-based match percentage shown on every application |
| **Gigs Marketplace** | Post and bid on freelance projects with workspace management |
| **AI Assistant Suite** | AI posting, CV builder, candidate analysis, smart search |
| **Escrow Payments** | Secure payment flow with withdrawal management |
| **Role-Based Dashboards** | Completely different UX per user role (Job Seeker / Company / Admin) |
| **Real-Time Chat** | Chat context with persistent conversation state |

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | React 18 | UI rendering library |
| **Routing** | React Router v6 | SPA navigation, nested routes, protected routes |
| **State Management** | Context API (7 contexts) | Auth, Chat, Jobs, Gigs, Profile, Notifications, Subscriptions |
| **Styling** | CSS Modules + globals.css | Scoped component styles + global design token system |
| **Typed Page** | TypeScript (landing-page.tsx) | Landing page is typed |
| **Icons** | Lucide React | Consistent SVG icon library |
| **Performance** | React.lazy + Suspense | Code-split all route modules and heavy components |
| **Mocking** | Custom mock data files | Simulates backend API responses |

---

## 3. Folder Structure

```
d:\MAESTA\Frontend\src\
│
├── App.js                          # Root router — mounts all route modules
├── index.js                        # React DOM entry point
│
├── routes/                         # Modular route groups (all lazy-loaded)
│   ├── AuthRoutes.jsx
│   ├── DashboardRoutes.jsx         # Largest — all /dashboard/* sub-routes
│   ├── JobRoutes.jsx
│   ├── GigRoutes.jsx
│   ├── AiRoutes.jsx
│   └── CommonRoutes.jsx
│
├── pages/
│   ├── landing-page.tsx            # TypeScript landing page
│   ├── Login.jsx                   # Sign in form
│   ├── ErrorPage.jsx               # 404 / error boundary
│   ├── PaymentPage.jsx             # Payment form (Stripe-style)
│   ├── SubscriptionPlansPage.jsx   # Plans comparison (stub)
│   │
│   ├── auth/
│   │   ├── MockLoginPage.jsx       # Dev tool: role-based demo login (no credentials)
│   │   ├── registration-page.jsx
│   │   ├── ForgetPasswordPage.jsx
│   │   ├── ResetPasswordPage.jsx
│   │   └── VerificationEmailPage.jsx
│   │
│   ├── onboarding/
│   │   └── OnboardingPage.jsx      # Post-registration wizard
│   │
│   ├── jobs/
│   │   ├── JobSearchPage.jsx       # Browse/search job listings
│   │   ├── JobDetailsPage.jsx      # Single job detail view
│   │   ├── JobApplicationPage.jsx  # Apply to a job (multi-step form)
│   │   ├── JobPostingPage.jsx      # Company: create a new job listing
│   │   └── SavedJobsPage.jsx       # Saved/bookmarked jobs
│   │
│   ├── gigs/
│   │   ├── GigListingPage.jsx      # Browse all gigs
│   │   ├── GigDetailsPage.jsx      # Single gig view with bid form
│   │   ├── GigPostingPage.jsx      # Post a new gig/project
│   │   ├── GigManagementPage.jsx   # Manage your posted gigs
│   │   ├── GigBiddingPage.jsx      # Place a bid on a gig
│   │   └── WorkspacePage.jsx       # Active gig collaboration workspace
│   │
│   ├── ai-assistant/
│   │   ├── AIPostingPage.jsx       # AI-enhanced job description generator
│   │   ├── CVBuilderPage.jsx       # AI-powered CV/Resume builder
│   │   ├── CandidateAnalysisPage.jsx  # AI analysis of applicants vs job
│   │   └── SmartSearchPage.jsx     # Natural language AI job search
│   │
│   ├── chat/                       # Real-time chat UI components/pages
│   ├── notifications/              # Notification center
│   ├── profiles/                   # Public user/company profile views
│   │
│   └── dashboard/
│       ├── Dashboard.jsx           # Role router — renders correct tab view
│       ├── RoleBasedRoutes.jsx     # Profile/EditProfile per role
│       │
│       ├── layout/
│       │   ├── DashboardLayout.jsx     # Master layout (sidebar + header + outlet)
│       │   ├── DashboardHeader.jsx     # Top nav bar, user menu, notifications
│       │   └── DashboardSidebar.jsx    # Left nav, role-based menu items
│       │
│       ├── config/
│       │   └── dashboard.config.js    # Mock data constants (applications, saved jobs, recommended jobs)
│       │
│       ├── hooks/
│       │   └── useJobseekerLogic.js   # Data + action hook for jobseeker dashboard
│       │
│       ├── components/ui/
│       │   ├── Card.jsx / Card.module.css       # Glass, default, outline variants
│       │   ├── Button.jsx / Button.module.css   # Dashboard button system
│       │   └── Badge.jsx / Badge.module.css     # Status badges
│       │
│       └── tabs/
│           ├── jobseeker/
│           │   ├── JobseekerDashboard.jsx
│           │   └── components/
│           │       ├── ApplicationStats.jsx       # 4-column KPI cards
│           │       ├── JobseekerHeader.jsx         # Welcome banner + quick actions
│           │       ├── ProfileSummaryCard.jsx      # Avatar + info summary widget
│           │       ├── SkillsAnalysisCard.jsx      # Skill match progress bars
│           │       ├── RecommendedJobs/            # Full recommended jobs tab + widget
│           │       ├── SavedJobs/                  # Saved jobs tab + widget
│           │       └── DetailedApplications/       # Applications tracker tab + widget
│           │
│           ├── company/
│           │   ├── CompanyDashboard.jsx
│           │   └── components/
│           │       ├── CompanySummary/             # Company KPI overview cards
│           │       ├── NewApplicants/              # Review new applicants per job
│           │       ├── PublishedJobs/              # Manage all job listings
│           │       └── PerformanceAnalytics/       # Hiring funnel charts + stats
│           │
│           └── admin/
│               ├── AdminDashboard.jsx
│               └── components/
│                   ├── UserManagement/             # CRUD for all platform users
│                   ├── JobManagement/              # Moderate/manage all job posts
│                   ├── ContentModeration/          # Flag and resolve reports
│                   ├── Statistics/                 # Platform-wide analytics
│                   ├── StaffManagement/            # Internal admin team
│                   └── SubscriptionManagement/     # Plans and billing overview
│
├── components/
│   ├── EnhancedBubble.jsx          # Animated decorative background element
│   │
│   ├── ai-assistant/               # Global floating AI chat (always rendered)
│   │   ├── FloatingAssistantIcon.jsx   # Pulse-animated trigger button
│   │   ├── ChatWindow.jsx              # Slide-in chat panel
│   │   ├── ChatInput.jsx               # Message input with voice
│   │   ├── ChatMessage.jsx             # Individual message bubble
│   │   ├── VoicePlayer.jsx             # TTS audio playback
│   │   ├── VoiceRecorder.jsx           # Microphone recording
│   │   └── AssistantSettings.jsx       # AI settings panel
│   │
│   ├── payment/                    # Escrow and payment UI
│   │   ├── EscrowDashboard.jsx         # Escrow balance overview
│   │   ├── TransactionList.jsx         # Transaction history table
│   │   └── WithdrawForm.jsx            # Withdrawal request form
│   │
│   └── common/
│       ├── LandingHeader.jsx           # Public nav with mega-dropdowns
│       ├── AuthHeader.jsx              # Minimal header for auth pages
│       ├── Footer.jsx                  # Global footer with links/socials
│       ├── ProtectedRoute.jsx          # Auth guard HOC
│       ├── ThemeToggle.jsx             # Multi-theme + dark/light popover
│       ├── GeneralSelect.jsx           # Custom styled dropdown
│       ├── Button.jsx                  # Site-wide button primitive
│       ├── Input.jsx                   # Controlled input wrapper
│       ├── Alert.jsx                   # Info/error/success alert banners
│       ├── LoadingSpinner.jsx          # Centered spinner
│       ├── SkipToContent.jsx           # Accessibility skip link
│       └── Skeleton/
│           └── TableSkeleton.jsx       # Skeleton loader matching table layout
│
├── context/
│   ├── AuthContext.jsx             # user, role, token, isAuthenticated
│   ├── ChatContext.jsx             # conversations, messages, online status
│   ├── GigContext.jsx              # gigs, bids, workspace state
│   ├── JobContext.jsx              # jobs, filters, selected job
│   ├── NotificationContext.jsx     # notifications, unreadCount
│   ├── ProfileContext.jsx          # profile data, editing state
│   └── SubscriptionContext.jsx     # plan, billing, feature flags
│
├── services/
│   ├── ApiService.js               # Base HTTP client (fetch wrapper + auth headers)
│   ├── authService.js              # login, register, refresh, verify, reset
│   ├── jobService.js               # getJobs, searchJobs, postJob, applyToJob
│   ├── gigService.js               # getGigs, createGig, placeBid, workspace
│   ├── chatService.js              # conversations, messages, sendMessage
│   ├── profileService.js           # getProfile, updateProfile, uploadAvatar
│   ├── paymentService.js           # payments, escrow, withdrawals
│   ├── notificationService.js      # feed, markRead, clearAll
│   └── aiAssistantService.js       # AI prompt/response, CV generation
│
├── hooks/
│   ├── useRole.js                  # Returns current user's role from AuthContext
│   └── useResendTimer.js           # Countdown timer for OTP/email resend
│
├── mocks/
│   ├── notifications.json          # Sample notification objects
│   └── subscriptionData.js         # Subscription plans with pricing + features
│
├── utils/                          # Shared utility helpers
├── lib/                            # Shared library functions
├── assets/                         # Images, SVGs, static files
│
└── styles/
    ├── globals.css                 # ★ Design system core (51KB) — all CSS tokens
    ├── animations.css              # Shared keyframe animation library
    ├── auth-pages.css              # Auth page global styles
    ├── landing-page.css            # Landing page section styles (22KB)
    ├── login.css                   # Login/register form styles
    ├── profile.css                 # Profile page global styles
    ├── edit-profile.css            # Edit profile form styles
    ├── App.css                     # App root styles
    └── index.css                   # Global resets and base
```

---

## 4. Routing Architecture

### Top-Level Routes (`App.js`)

| Path | Component | Auth Guard |
|---|---|---|
| `/` | `LandingPage` | Public |
| `/login` | `LoginForm` | Public |
| `/register` | `RegistrationPage` | Public |
| `/forgotpassword` | `ForgetPasswordPage` | Public |
| `/resetpassword` | `ResetPasswordPage` | Public |
| `/verify` | `VerificationEmailPage` | Public |
| `/register/onboarding` | `OnboardingPage` | Public |
| `/mock-login` | `MockLoginPage` | Public (dev tool) |
| `/jobs/*` | `JobRoutes` | Protected |
| `/gigs/*` | `GigRoutes` | Protected |
| `/ai/*` | `AiRoutes` | Protected |
| `/dashboard/*` | `DashboardRoutes` | Protected (inside module) |
| `/chat/*` | `CommonRoutes` | Protected |
| `/notifications/*` | `CommonRoutes` | Protected |
| `/subscription/*` | `CommonRoutes` | Protected |
| `/404` | `ErrorPage` | Public |
| `*` | `→ /404` | — |

### Dashboard Sub-Routes (`/dashboard/*`)

| Path | Component | Role |
|---|---|---|
| `/dashboard` | `Dashboard` (role-based renderer) | All |
| `/dashboard/profile` | `RoleBasedProfile` | All |
| `/dashboard/profile/edit` | `RoleBasedEditProfile` | All |
| `/dashboard/escrow` | `EscrowDashboard` | All |
| `/dashboard/applications` | `DetailedApplicationsWithData` | Job Seeker |
| `/dashboard/saved-jobs` | `SavedJobsWithData` | Job Seeker |
| `/dashboard/recommended-jobs` | `RecommendedJobsWithData` | Job Seeker |
| `/dashboard/published-jobs` | `PublishedJobsWithData` | Company |
| `/dashboard/new-applications` | `NewApplicantsWithData` | Company |
| `/dashboard/performance-analytics` | `PerformanceAnalyticsWithData` | Company |
| `/dashboard/users` | `UserManagement` | Admin |
| `/dashboard/jobs` | `JobManagement` | Admin |
| `/dashboard/moderation` | `ContentModeration` | Admin |
| `/dashboard/statistics` | `StatisticsDashboard` | Admin |
| `/dashboard/staff` | `StaffManagement` | Admin |
| `/dashboard/subscriptions` | `SubscriptionManagement` | Admin |

---

## 5. Pages & Features

### 5.1 Public Pages

#### Landing Page (`/`)
- Built in TypeScript (`.tsx`)
- Hero with animated dark background, gradient text heading "Find Your Dream Job"
- Stats bar: 50K+ Active Jobs · 1000+ Companies · 95% Success Rate
- Sections: Hero → Stats → Features → How It Works → Testimonials → CTA
- Public nav (`LandingHeader`) with mega-dropdowns for Jobs, Gigs, AI, Plans

#### Error Page (`/404`)
- Animated custom 404 design, back-to-home navigation link

---

### 5.2 Authentication Flow

| Page | Path | Features |
|---|---|---|
| **Login** | `/login` | Email + password, Google OAuth button, LinkedIn OAuth button, Remember me, Forgot password link, Sign up link |
| **Register** | `/register` | Multi-field registration form |
| **Onboarding** | `/register/onboarding` | Role selection and profile setup wizard |
| **Forgot Password** | `/forgotpassword` | Email input to trigger reset link |
| **Reset Password** | `/resetpassword` | New password + confirmation with strength validation |
| **Email Verification** | `/verify` | OTP or magic link verification, resend button with `useResendTimer` countdown |
| **Mock Login** | `/mock-login` | Developer tool — pick Job Seeker / Company / Admin, one click to enter demo, no credentials |

**Auth guard:** `ProtectedRoute` HOC wraps all private routes. Reads `isAuthenticated` from `AuthContext`.

---

### 5.3 Job Seeker Dashboard

**Route:** `/dashboard` (role = `jobseeker`)  
**Main file:** `JobseekerDashboard.jsx`  
**Logic hook:** `useJobseekerLogic.js`

#### Overview Sections

| Section | Component | Description |
|---|---|---|
| Welcome Banner | `JobseekerHeader` | "Welcome back, [Name]!" + Refresh, Search Jobs, Set Alerts actions |
| Application Metrics | `ApplicationStats` | 4 KPI cards: Total Applications, Interviews, Offers, In Review — each with icon, value, sub-label |
| Profile Summary | `ProfileSummaryCard` | Initials avatar, name, role, email, location, Verified Profile badge, Edit Profile button |
| Skills Match Analysis | `SkillsAnalysisCard` | Progress bars per skill with percentages, Take Skill Assessment button |
| Recent Applications | `ApplicationsWidget` | Latest 3 applications with REVIEW/INTERVIEW/OFFER status badges and match % |
| Recommended For You | `RecommendedJobsWidget` | Latest 3 recommended jobs with match scores |
| Saved Jobs | `SavedJobsWidget` | Quick view of latest 3 saved jobs |

#### Dashboard Sub-Pages (Jobseeker)

- **`/dashboard/applications`** — Full application tracker: filter by status/date/match score, sort by date/company/match, paginated list, expandable rows showing timeline, salary, feedback, notes, withdraw action, export
- **`/dashboard/recommended-jobs`** — Full recommended jobs with job type / location / match score filters, expandable details, save + apply actions
- **`/dashboard/saved-jobs`** — All bookmarked jobs with unsave and direct apply
- **`/dashboard/profile`** — Complete profile: avatar, professional bio, skills list, work experience, education, portfolio, contact info, verified badges

---

### 5.4 Company Dashboard

**Route:** `/dashboard` (role = `company`)  
**Main file:** `CompanyDashboard.jsx`

#### Overview Sections
- Company summary card (active listings, total applicants, hired this month)
- Quick actions: Post Job, View Applicants, View Analytics

#### Sub-Pages

| Path | Component | Description |
|---|---|---|
| `/dashboard/published-jobs` | `PublishedJobs` | All job listings with status toggle (Active/Paused/Closed), edit, delete, bulk actions, pagination, statistics per listing |
| `/dashboard/new-applications` | `NewApplicants` | Review applicants per job with profile preview, Shortlist / Reject / Schedule Interview actions, bulk operations, export |
| `/dashboard/performance-analytics` | `PerformanceAnalytics` | Hiring funnel: views → applications → shortlisted → hired conversion rates, time period selector, trend charts, AI insights |
| `/dashboard/profile` | `RoleBasedProfile` | Company profile: logo, description, industry, size, locations, social links, job activity |

---

### 5.5 Admin Dashboard

**Route:** `/dashboard` (role = `admin`)  
**Main file:** `AdminDashboard.jsx`

| Path | Component | Description |
|---|---|---|
| `/dashboard/users` | `UserManagement` | Search, filter, view, edit roles, suspend/activate all platform users across all roles |
| `/dashboard/jobs` | `JobManagement` | Review all posted jobs, approve, reject, remove inappropriate listings |
| `/dashboard/moderation` | `ContentModeration` | Reported content queue: flag, resolve, remove items |
| `/dashboard/statistics` | `StatisticsDashboard` | Platform KPIs: user growth, job activity, gig activity, revenue metrics, charts |
| `/dashboard/staff` | `StaffManagement` | Manage internal staff and sub-admin accounts |
| `/dashboard/subscriptions` | `SubscriptionManagement` | Subscription plan management, billing overview, feature flag controls |

---

### 5.6 Jobs Module

**Base path:** `/jobs`

| Path | Component | Description |
|---|---|---|
| `/jobs` | `JobSearchPage` | Search bar, location filter, sort dropdown, paginated job cards with salary range, job type badge, save (star) button |
| `/jobs/:id` | `JobDetailsPage` | Full job: description, responsibilities, requirements, salary, company info, similar jobs sidebar, Apply button |
| `/jobs/:id/apply` | `JobApplicationPage` | Multi-step application: resume upload/select, cover letter editor, screening questions |
| `/jobs/post` | `JobPostingPage` | Company: rich job creation form — title, type, location, salary, skills, description, requirements |
| `/jobs/saved` | `SavedJobsPage` | All bookmarked jobs with apply and remove controls |

---

### 5.7 Gigs Module

**Base path:** `/gigs`

| Path | Component | Description |
|---|---|---|
| `/gigs` | `GigListingPage` | 2-column card grid: search, filters, gig cards with poster rating, bid count, budget, description preview |
| `/gigs/:id` | `GigDetailsPage` | Full gig: description, skills needed, budget, timeline, poster profile, bid submission form |
| `/gigs/:id/bid` | `GigBiddingPage` | Submit bid: proposed price, delivery time, proposal message |
| `/gigs/post` | `GigPostingPage` | Post a new gig/project for freelancers to bid on |
| `/gigs/manage` | `GigManagementPage` | Manage your own posted gigs: edit, close, view bids |
| `/gigs/:id/workspace` | `WorkspacePage` | Per-contract workspace: file sharing, messaging, milestone tracking |

---

### 5.8 AI Tools Module

**Base path:** `/ai`

| Path | Component | Description |
|---|---|---|
| `/ai/post` | `AIPostingPage` | Company: AI-guided job description generator — title → AI generates full posting |
| `/ai/cv-builder` | `CVBuilderPage` | Jobseeker: AI-assisted CV builder with section-by-section templates, export to PDF |
| `/ai/candidate-analysis` | `CandidateAnalysisPage` | Company: analyze candidates against job requirements with AI scoring |
| `/ai/smart-search` | `SmartSearchPage` | Natural language job search — describe ideal job → find matches |

#### Global AI Widget (present on every page)
- `FloatingAssistantIcon` — pulse-animated button, bottom-right corner
- `ChatWindow` — slide-in chat panel with full message history
- `ChatInput` — text input with voice recording capability
- `ChatMessage` — individual message bubble (user vs assistant)
- `VoicePlayer` — plays text-to-speech AI responses
- `VoiceRecorder` — microphone input for voice queries
- `AssistantSettings` — configure AI persona and preferences

---

### 5.9 Payment & Escrow

**Route:** `/dashboard/escrow`

| Component | Description |
|---|---|
| `EscrowDashboard` | Overview of held escrow balance, funds in dispute, released amounts |
| `TransactionList` | Full paginated transaction history with status filters (Pending, Completed, Disputed), date range picker, export |
| `WithdrawForm` | Request withdrawal: amount, payment method (bank/PayPal/card), form validation with fee preview |

**Payment Page** (`/payment`):
- Card number, expiry, CVV, billing name, plan selection summary, Pay button

---

### 5.10 Common Modules

| Path | Context | Description |
|---|---|---|
| `/chat/*` | `ChatContext` | Conversation list sidebar + message thread, online indicators, read receipts |
| `/notifications/*` | `NotificationContext` | Scrollable notification feed, mark read, clear all, filter by type |
| `/subscription/*` | `SubscriptionContext` | Current plan overview, feature comparison table, upgrade/downgrade flow, billing history |

---

## 6. Component Library

### Dashboard UI Layer (`src/pages/dashboard/components/ui/`)

#### `Card`
| Prop | Type | Description |
|---|---|---|
| `variant` | `'default' \| 'glass' \| 'outline'` | Visual style |
| `title` | string | Card heading |
| `subtitle` | string | Card subheading |
| `action` | ReactNode | Header action (button, badge) |
| `header` | ReactNode | Full custom header override |
| `footer` | ReactNode | Footer content |
| `padding` | boolean | Toggle content padding |
| `onClick` | function | Makes card interactive |

#### `Badge`
Status badges with semantic colors: `success`, `warning`, `danger`, `info`, `primary`, `secondary`

#### `Button`
Dashboard-scoped button with `variant`, `size`, `loading`, `icon` props

### Common Layer (`src/components/common/`)

| Component | Description |
|---|---|
| `LandingHeader` | Public nav with mega-dropdowns |
| `AuthHeader` | Minimal header for auth pages |
| `Footer` | Global footer with links |
| `ProtectedRoute` | Auth guard: redirects to `/login` if not authenticated |
| `ThemeToggle` | Popover for theme selection + dark/light mode |
| `GeneralSelect` | Custom dropdown replacing native `<select>` |
| `Button` | Primary site-wide button primitive |
| `Input` | Controlled input wrapper with label support |
| `Alert` | Info / error / success / warning banner |
| `LoadingSpinner` | Centered CSS spinner |
| `SkipToContent` | WCAG skip navigation link (accessibility) |
| `TableSkeleton` | Configurable table skeleton: `rows` and `columns` props |

---

## 7. State Management & Context API

| Context | Key State | Key Actions |
|---|---|---|
| `AuthContext` | `user`, `role`, `token`, `isAuthenticated` | `login()`, `logout()`, `refreshToken()`, `setUser()` |
| `ProfileContext` | `profile`, `loading`, `isEditing` | `fetchProfile()`, `updateProfile()`, `uploadAvatar()` |
| `JobContext` | `jobs`, `filters`, `selectedJob`, `savedJobs` | `searchJobs()`, `postJob()`, `saveJob()`, `applyToJob()` |
| `GigContext` | `gigs`, `myBids`, `workspace`, `activeBid` | `fetchGigs()`, `createGig()`, `placeBid()`, `updateWorkspace()` |
| `ChatContext` | `conversations`, `activeChat`, `messages`, `onlineUsers` | `sendMessage()`, `openConversation()`, `markRead()` |
| `NotificationContext` | `notifications`, `unreadCount` | `markRead()`, `markAllRead()`, `clearAll()`, `fetchNotifications()` |
| `SubscriptionContext` | `plan`, `billing`, `features`, `isLoading` | `upgradePlan()`, `cancelPlan()`, `fetchBilling()` |

All contexts follow the Provider pattern and are composed at the root `index.js` level.

---

## 8. Services Layer

All services in `src/services/` follow the same pattern — functions that call `ApiService.js` and return structured responses. Swapping mock data for a real endpoint requires only changing the service function body.

```js
// Example service pattern
const jobService = {
  getJobs: async (filters) => { /* returns { success, data, error } */ },
  getJobById: async (id) => { ... },
  postJob: async (data) => { ... },
};
```

| Service | Size | Key Methods |
|---|---|---|
| `authService.js` | 6.6 KB | `login`, `register`, `forgotPassword`, `resetPassword`, `verifyEmail`, `refreshToken` |
| `jobService.js` | 11.8 KB | `getJobs`, `getJobById`, `searchJobs`, `postJob`, `applyToJob`, `saveJob`, `getSavedJobs` |
| `gigService.js` | 13.3 KB | `getGigs`, `getGigById`, `createGig`, `placeBid`, `acceptBid`, `getWorkspace` |
| `profileService.js` | 12.1 KB | `getProfile`, `updateProfile`, `uploadAvatar`, `getPublicProfile`, `getSkills` |
| `chatService.js` | 8.6 KB | `getConversations`, `getMessages`, `sendMessage`, `createConversation`, `markRead` |
| `notificationService.js` | 6.1 KB | `getNotifications`, `markRead`, `markAllRead`, `deleteNotification` |
| `paymentService.js` | 4.9 KB | `initiatePayment`, `getEscrowBalance`, `getTransactions`, `requestWithdrawal` |
| `aiAssistantService.js` | 3.9 KB | `sendMessage`, `generateJobPost`, `buildCV`, `analyzeCandidate`, `smartSearch` |
| `ApiService.js` | 1.3 KB | Base `fetch` wrapper with auth token headers, error normalization |

---

## 9. Design System

The entire visual identity is controlled by `src/styles/globals.css` (51 KB).

### Color Tokens

```css
/* Base */
--color-background          /* Page background */
--color-foreground          /* Primary text */
--color-card                /* Card background surface */
--color-border              /* Borders and dividers */
--color-muted               /* Muted surface (inputs, tags) */
--color-muted-foreground    /* Secondary / placeholder text */

/* Brand */
--color-primary             /* Brand green */
--color-primary-foreground  /* Text on primary backgrounds */
--color-accent-pink         /* Accent / highlight color */
--color-vivid-pink          /* Gradient end stop */
--color-shadow-pink         /* Glow shadow for pink elements */

/* Semantics */
--color-success / --color-warning / --color-danger / --color-info

/* Glassmorphism Kit */
--color-radial-pink-1/2/3       /* Background radial glow layers */
--color-translucent-white-1/2   /* Frosted glass overlay tints */

/* Charts */
--color-chart-1 through --color-chart-5
```

### Spacing Scale
`--space-1` (4px) through `--space-12` (48px)

### Typography
```css
--font-size-2xs / xs / sm / base / lg / xl / 2xl / 3xl
--font-weight-normal / medium / semibold / bold
--line-height-tight (1.2) / normal (1.5) / relaxed (1.75)
```

### Border Radius
`--radius-sm / md / lg / xl / 2xl / full`

### Theme System
`ThemeToggle` applies `[data-theme="..."]` on `<html>`. Supports multiple themes + dark/light mode variants using CSS variable overrides.

### Animations Library
| Name | Type | Used On |
|---|---|---|
| `fadeInUp` | Entry | Page sections |
| `slideDown` | Entry | Dashboard header |
| `slideUp` | Entry | Metrics section |
| `cardAppear` | Entry | Content grid items |
| `float` | Loop | Background gradient layer |
| `shimmer` | Loop | Skill progress bar fill |
| `shimmerSlide` | Loop | Header gradient border sweep |
| `pulseGlow` | Loop | Active status badges |
| `sparkle` | Loop | Title icons |
| `spin` | Loop | Refresh/loading icons |

---

## 10. Mock Data Strategy

This is a frontend-only demo — all data is mocked locally with no backend connection.

| Source | Contents |
|---|---|
| `src/mocks/notifications.json` | Array of notification objects with type, title, message, timestamp |
| `src/mocks/subscriptionData.js` | Plan objects with tier, price, features list |
| `src/pages/dashboard/config/dashboard.config.js` | `JOB_SEEKER_APPLICATIONS`, `JOB_SEEKER_SAVED_JOBS`, `JOB_SEEKER_RECOMMENDED_JOBS` arrays |
| `src/pages/dashboard/tabs/company/services/companyDataService.js` | Functions returning mock company dashboard data |

**WithData Wrapper Pattern:**  
Dashboard routes use `*WithData` wrapper components that call mock service functions and inject data into purely presentational components. This cleanly separates data concerns from rendering, making the transition to a real API straightforward — only the service call body needs to change.

```jsx
// Example
const PublishedJobsWithData = () => {
  const data = getPublishedJobsData(); // <-- swap this for real API call
  if (!data.success) return <ErrorState />;
  return <PublishedJobs {...data.data} />;
};
```

---

## 11. Performance Architecture

| Technique | Implementation |
|---|---|
| **Route code splitting** | Every route module wrapped in `React.lazy()` — dashboard, jobs, gigs, AI, common all separate chunks |
| **Suspense fallbacks** | `TableSkeleton` renders while heavy chunks load; prevents layout shift |
| **Named export lazy loading** | `.then(m => ({ default: m.NamedExport }))` pattern for named module exports |
| **useMemo for derived data** | `RecommendedJobs` and `DetailedApplications` filters + sorts memoized |
| **Context isolation** | 7 separate contexts prevent cross-feature re-renders |
| **CSS Modules** | Scoped styles eliminate global class collisions; dead CSS tree-shaken in production build |
| **Skeleton loaders** | `TableSkeleton` with configurable `rows` and `columns` shown on all data-heavy route loads |

---

## 12. Known Limitations & Gaps

| # | Area | Description |
|---|---|---|
| 1 | **No backend** | All data is mocked — no real API, no database, nothing persists between page reloads |
| 2 | **Theme split** | Dashboard = dark glassmorphism. Jobs / Gigs = light beige. Two visual identities in one app |
| 3 | **Header user mismatch** | DashboardHeader shows "John Doe" regardless of which mock login role is selected |
| 4 | **KPI wiring** | `ApplicationStats` receives `stats.interviews` and `stats.offers` which are always `0`; applications page shows the correct counts from separate mock data |
| 5 | **SubscriptionPlansPage** | File is 607 bytes — effectively an empty stub with no content |
| 6 | **OAuth buttons** | Google and LinkedIn sign-in buttons exist in UI but have no OAuth provider configured |
| 7 | **AI tools** | Pages have full UI but no real AI model or API integration — responses would need to be wired to OpenAI / Gemini |
| 8 | **Real-time chat** | `ChatContext` and chat UI exist but use mock data — no WebSocket connection |
| 9 | **Gig posteravatars** | Avatar circles on gig listing cards are empty — no initials or fallback icon |
| 10 | **Mobile sidebar** | Dashboard sidebar lacks icon-only collapsed mode for small screens |
| 11 | **TypeScript coverage** | Only `landing-page.tsx` is typed; rest of the codebase is plain JavaScript |

---

*Documentation written: March 2026 · MAESTA Frontend · React 18 + React Router v6*
