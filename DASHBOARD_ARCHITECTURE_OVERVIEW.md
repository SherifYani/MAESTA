# MAESTA Dashboard Architecture Overview

## 📊 Dashboard Structure Summary

The MAESTA dashboard is a **role-based, responsive system** that dynamically renders different UX/UI for 5 user types. It uses React Context API for state management and follows a modular component architecture.

---

## 🏗️ Core Architecture

### Entry Point: `Dashboard.jsx`
- **Purpose**: Main router for role-specific dashboards
- **Location**: `src/pages/dashboard/Dashboard.jsx`
- **Function**: Reads `DashboardContext.currentRole` and renders the appropriate dashboard:
  - **`jobseeker`** → `JobseekerDashboard`
  - **`company`** → `CompanyDashboard`
  - **`client`** → `ClientDashboard`
  - **`freelancer`** → `FreelancerDashboard`
  - **`admin`** → `AdminDashboard`

---

## 🎨 Layout System: `DashboardLayout.jsx`

The master layout wraps all dashboards with a responsive, two-pane structure:

```
┌──────────────────────────────────────────────────────┐
│ DashboardLayout                                      │
├──────────────┬──────────────────────────────────────┤
│              │ DashboardHeader                      │
│ Sidebar      ├──────────────────────────────────────┤
│              │ <main>                               │
│ (role nav)   │  <Outlet /> ← renders Dashboard     │
│              │            ← role-specific content  │
│              │</main>                               │
└──────────────┴──────────────────────────────────────┘
```

### Key Features
- **Mobile responsive**: Sidebar collapses on screens < 640px
- **Overlay**: Mobile sidebar triggers overlay click-to-close
- **DashboardContext**: Provides `currentRole`, `toggleSidebar`, `isMobile`
- **Role synchronization**: Auto-syncs with `AuthContext.user.role` after login/onboarding

### State Management
```javascript
const contextValue = {
  currentRole,              // "jobseeker", "company", etc.
  setCurrentRole(role),     // Validates and updates role
  sidebarOpen,              // Boolean
  toggleSidebar,            // Callback to toggle
  isMobile,                 // Boolean (< 640px)
}
```

---

## 🧭 Sidebar Navigation: `DashboardSidebar.jsx`

### Features
- **Role-based menu**: Reads from `ROLE_NAVIGATION` config
- **Active link tracking**: Highlights current page
- **Mobile drawer**: Closes automatically on nav click
- **User profile footer**: Shows user initials, name, and role
- **Responsive**: Icon-only mode on small screens (planned)

### Navigation Config
```javascript
ROLE_NAVIGATION = {
  jobseeker: [
    { id: 'overview', label: 'Overview', path: '/dashboard', icon: Home },
    { id: 'applications', label: 'Applications', path: '/dashboard/applications', icon: Briefcase },
    { id: 'saved-jobs', label: 'Saved Jobs', path: '/dashboard/saved-jobs', icon: Bookmark },
    { id: 'recommended', label: 'Recommended', path: '/dashboard/recommended-jobs', icon: Star },
    { id: 'profile', label: 'Profile', path: '/dashboard/profile', icon: User },
  ],
  company: [ /* hiring-focused items */ ],
  admin: [ /* moderation & stats items */ ],
  // ... etc
}
```

---

## 🎭 Role-Specific Dashboards

### 1️⃣ JobseekerDashboard

**File**: `JobseekerDashboard.jsx`  
**Version**: 7.0.0  
**Data Source**: `useJobseekerLogic` hook

#### Layout Grid
```
┌─────────────────────────────────────────┐
│ JobseekerHeader (Welcome + Quick Actions)
├─────────────────────────────────────────┤
│ ApplicationStats (4 KPI cards)          │
├────────────────┬────────────────────────┤
│ Profile        │ Skills Analysis        │
│ Summary        │ (Progress bars)        │
├─────────────────────────────────────────┤
│ Recent Applications (Widget + full page)│
├─────────────────────────────────────────┤
│ Recommended Jobs                        │
├─────────────────────────────────────────┤
│ Saved Jobs                              │
├────────────────┬────────────────────────┤
│ Pending        │ Recent Activity        │
│ Actions        │                        │
└────────────────┴────────────────────────┘
```

#### Key Components
- **`ApplicationStats`**: 4-column KPI: Total, Interviews, Offers, In Review
- **`ProfileSummaryCard`**: Name, role, verified badge, edit button
- **`SkillsAnalysisCard`**: Skill match bars with assessment button
- **`ApplicationsWidget`**: Latest 3 applications with status badges
- **`RecommendedJobsWidget`**: AI-matched job recommendations
- **`SavedJobsWidget`**: Bookmarked jobs for later
- **`PendingActions`**: Tasks to complete
- **`RecentActivity`**: Timeline of jobseeker interactions

#### Data Flow
```
useJobseekerLogic()
├── dashboardData (structure summary)
├── stats (KPI data)
├── profile (user info)
├── applications (latest 3)
├── savedJobs (bookmarked)
├── skillsAnalysis (match data)
├── recentActivity (timeline)
└── recommendedJobs (AI suggestions)
```

---

### 2️⃣ CompanyDashboard

**File**: `CompanyDashboard.jsx`  
**Version**: 7.0.0  
**Data Sources**: Real API (`jobService`, `dashboardService`)

#### Layout Grid
```
┌──────────────────────────────────────────┐
│ Header: "Company Dashboard" + Refresh/New│
├──────────────────────────────────────────┤
│ Quick Insights Stats Grid                │
├──────────────────────────────────────────┤
│ Company Summary (Full width)              │
├──────────────────────────────────────────┤
│ New Applicants Widget (Full width)        │
├──────────────┬───────────────────────────┤
│ Active Jobs  │ About Company              │
├──────────────┼───────────────────────────┤
│ Hiring Team  │ Quick Stats                │
├──────────────────────────────────────────┤
│ Pending Actions Footer                    │
├──────────────────────────────────────────┤
│ Performance Footer (5 stats columns)      │
└──────────────────────────────────────────┘
```

#### Key Components
- **`CompanySummary`**: Company profile card with description, industry, location
- **`NewApplicantsWidget`**: Recent applications list
- **`PublishedJobsWidget`**: Active job listings
- **`JobMetricsChart`**: Hiring funnel visualization
- **`PerformanceAnalyticsWidget`**: Lightweight analytics preview
- **Quick Stats Footer**: Total jobs, open positions, application rate, hire rate

#### State Management
```javascript
// Live API data
const [publishedJobs, setPublishedJobs] = useState([]);
const [newApplicants, setNewApplicants] = useState([]);
const [stats, setStats] = useState({
  totalJobsPosted: 0,
  openPositions: 0,
  totalApplications: 0,
  hireRate: 0,
  avgTimeToHire: '0 days'
});
```

#### Data Fetching
```javascript
fetchData() async {
  // Fetch dashboard metrics
  dashboardService.getCompanyDashboard()
  
  // Fetch company's posted jobs
  jobService.getCompanyJobs()
  
  // Fetch applications for those jobs
  jobService.getJobApplications(jobId)
}
```

---

### 3️⃣ AdminDashboard

**File**: `AdminDashboard.jsx`  
**Version**: 2.0.0  
**Data Source**: `adminService.getDashboardMetrics()`

#### Layout Grid
```
┌──────────────────────────────────────────┐
│ Header: "Admin Overview" + Export Report  │
├──────────────────────────────────────────┤
│ Key Metrics (4 stat cards):               │
│ - Total Users (+ growth %)                │
│ - Total Revenue (+ growth %)              │
│ - Active Jobs                            │
│ - Pending Moderation                     │
├──────────┬────────────────────────────────┤
│ Left     │ Right Column:                 │
│ Column:  ├────────────────────────────────┤
│          │ Pending Actions               │
│ Recent   ├────────────────────────────────┤
│ Activity │ System Health                  │
│          │ (uptime, db status, etc.)     │
└──────────┴────────────────────────────────┘
```

#### Key Components
- **`StatsGrid`**: 4 KPI cards (users, revenue, jobs, moderation queue)
- **`RecentActivity`**: Admin action log (user signups, job posts, etc.)
- **`PendingActions`**: Admin tasks (flag reviews, appeals, etc.)
- **`SystemHealth`**: Server status, database health

#### Metrics Structure
```javascript
const metrics = {
  totalUsers: 0,
  userGrowth: '+0%',
  totalRevenue: 0,
  revenueGrowth: '+0%',
  activeJobs: 0,
  pendingModeration: 0,
  recentActivity: [],
  pendingActions: [],
  systemHealth: {}
}
```

---

### 4️⃣ ClientDashboard & FreelancerDashboard

**Files**: `ClientDashboard.jsx`, `FreelancerDashboard.jsx`

#### ClientDashboard
- **Purpose**: Project/gig posting and management
- **Components**: `BudgetOverviewWidget`, project listings, active bids
- **Status**: Partial implementation

#### FreelancerDashboard
- **Purpose**: Freelancer portfolio and earnings
- **Components**: `EarningsOverviewWidget`, active projects, proposals
- **Status**: Partial implementation

---

## 🎨 Header: `DashboardHeader.jsx`

### Layout
```
┌────────────────────────────────────────────────────────┐
│ [Menu] Breadcrumb  |  [Search]  Theme  Notifications  │
│                   Dashboard     [User Dropdown ▼]      │
└────────────────────────────────────────────────────────┘
```

### Features
- **Mobile hamburger menu**: Opens sidebar on small screens
- **Breadcrumb**: Shows "Dashboard" + current role badge
- **Search**: Disabled by default (`{false &&`)
- **Theme toggle**: Dark/light mode switcher
- **Notifications**: Bell icon with unread count
- **User dropdown**: Profile menu with logout
  - Profile Settings
  - Account
  - Billing
  - Help & Support
  - Logout

### Data Sources
```javascript
const currentUser = {
  id: "1",
  name: authUser?.name || "Demo User",
  email: authUser?.email || "",
  avatarInitials: computed from name,
  role: authUser?.role || currentRole,
}
```

---

## 🧩 Shared UI Components

### Location: `src/pages/dashboard/components/ui/`

#### 1. **Card.jsx** - Container component
```jsx
<Card 
  title="Title"
  subtitle="Subtitle"
  variant="glass" | "default" | "outline"
  className="custom-class"
  action={<Button />}  // Header action
  header={JSX}         // Custom header override
  footer={JSX}         // Footer content
>
  {children}
</Card>
```

#### 2. **Button.jsx** - Dashboard button
```jsx
<Button 
  variant="primary" | "secondary" | "ghost" | "outline"
  size="small" | "medium" | "large"
  icon={IconComponent}
  loading={boolean}
  onClick={handler}
>
  Label
</Button>
```

#### 3. **Badge.jsx** - Status indicator
```jsx
<Badge variant="success" | "warning" | "danger" | "info" | "primary">
  Text
</Badge>
```

---

## 🎨 UI Widgets (Reusable)

### Jobseeker Widgets
- **`ApplicationsWidget`**: Condensed application list (3-5 rows)
- **`RecommendedJobsWidget`**: AI-matched job suggestions
- **`SavedJobsWidget`**: Bookmarked jobs with unsave button
- **`ProfileSummaryCard`**: User card with edit button
- **`ApplicationStats`**: 4 KPI cards (total, interviews, offers, in review)

### Company Widgets
- **`CompanySummary`**: Company profile overview
- **`NewApplicantsWidget`**: Recent applicant list
- **`PublishedJobsWidget`**: Job listing summary
- **`PerformanceAnalyticsWidget`**: Hiring metrics chart
- **`JobMetricsChart`**: Funnel or trend visualization

### Admin Widgets
- **`AdminDataTable`**: Generic data table (users, jobs, etc.)
- **`AdminStatsCard`**: KPI card with trend indicator
- **`AdminToolbar`**: Filter, search, export buttons

### Shared Widgets
- **`PendingActions`**: Task list with completion tracking
- **`RecentActivity`**: Timeline of events
- **`StatsGrid`**: 4-card KPI layout
- **`RecentJobPosts`**: Job listing preview
- **`StatCard`**: Individual metric card

---

## 📡 Data Flow & Services

### Service Layer: `src/services/`

```javascript
// Job Service
jobService.getCompanyJobs()              // Get jobs posted by company
jobService.getJobApplications(jobId)    // Get applications for a job

// Dashboard Service
dashboardService.getCompanyDashboard()  // Get company metrics
dashboardService.getJobseekerDashboard() // Get jobseeker stats

// Admin Service
adminService.getDashboardMetrics()      // Get admin overview stats

// Auth Service
authService.login(email, password)      // Login, returns JWT
authService.me()                        // Fetch current user profile
```

### State Management Pattern

#### Context API
- **`AuthContext`**: User, role, token, authentication state
- **`DashboardContext`**: Current role, sidebar state, responsive flags
- **`JobContext`**: Selected job, filters, search results (if needed)
- **`ProfileContext`**: User profile data, edit state (if needed)

#### Local State
- Dashboard components manage their own `loading`, `data`, `error` states
- Heavy lifting done in custom hooks (e.g., `useJobseekerLogic`)

---

## 🔄 Routing: Dashboard Sub-Routes

### Via DashboardRoutes.jsx
```
/dashboard                  → Dashboard (role-based renderer)
/dashboard/profile          → RoleBasedProfile (show profile)
/dashboard/profile/edit     → RoleBasedEditProfile (edit profile)
/dashboard/escrow           → EscrowDashboard (payment & withdrawal)

# Jobseeker-specific
/dashboard/applications     → DetailedApplicationsWithData
/dashboard/saved-jobs       → SavedJobsWithData
/dashboard/recommended-jobs → RecommendedJobsWithData

# Company-specific
/dashboard/published-jobs   → PublishedJobsWithData
/dashboard/applicants       → NewApplicantsWithData
/dashboard/performance      → PerformanceAnalyticsWithData

# Admin-specific
/dashboard/users            → UserManagement
/dashboard/jobs             → JobManagement
/dashboard/moderation       → ContentModeration
/dashboard/statistics       → StatisticsDashboard
/dashboard/staff            → StaffManagement
/dashboard/subscriptions    → SubscriptionManagement
```

---

## 🎯 Current State & Issues

### ✅ Implemented
- Layout structure (sidebar + header + main content)
- Role-based dashboard rendering (5 dashboards)
- Responsive design (mobile, tablet, desktop)
- Jobseeker overview with mock data
- Company dashboard with real API data for jobs/applicants
- Admin dashboard with metrics
- DashboardContext for role & sidebar state
- Logout functionality

### ⚠️ Known Issues
1. **Header user mismatch**: Shows generic "John Doe" in some views
2. **KPI wiring**: ApplicationStats shows `0` for interviews/offers (data comes from separate source)
3. **Mock data persistence**: Data resets on page reload
4. **TypeScript coverage**: Only landing page is typed
5. **Mobile sidebar**: No icon-only collapsed mode
6. **Sub-dashboard integration**: Some tab pages not fully wired to dashboard context

### 🚀 Next Steps
1. Wire profile data to header
2. Integrate real API for all dashboard KPIs
3. Add TypeScript to dashboard files
4. Implement sub-dashboard navigation
5. Add animations and transitions
6. Mobile optimization (icon-only sidebar)

---

## 📝 File Tree Reference

```
src/pages/dashboard/
├── Dashboard.jsx                    # Main role router
├── RoleBasedRoutes.jsx              # Profile routes by role
├── dashboard.module.css             # Styles
│
├── layout/
│   ├── DashboardLayout.jsx          # Master layout + context
│   ├── DashboardHeader.jsx          # Top nav bar
│   ├── DashboardSidebar.jsx         # Left nav + user profile
│   └── *.module.css
│
├── config/
│   └── dashboard.config.js          # ROLE_NAVIGATION, ROLE_DISPLAY_NAMES
│
├── hooks/
│   └── useJobseekerLogic.js         # Jobseeker data & actions
│
├── components/
│   ├── ui/
│   │   ├── Card.jsx / Button.jsx / Badge.jsx
│   │   └── *.module.css
│   ├── shared/
│   │   ├── CompactJobCard.jsx
│   │   └── *.module.css
│   ├── PendingActions.jsx
│   ├── RecentActivity.jsx
│   ├── RecentJobPosts.jsx
│   ├── StatsGrid.jsx
│   └── StatCard.jsx
│
└── tabs/
    ├── jobseeker/
    │   ├── JobseekerDashboard.jsx
    │   ├── components/
    │   │   ├── ApplicationStats.jsx
    │   │   ├── JobseekerHeader.jsx
    │   │   ├── ProfileSummaryCard.jsx
    │   │   ├── SkillsAnalysisCard.jsx
    │   │   ├── DetailedApplications/
    │   │   ├── RecommendedJobs/
    │   │   └── SavedJobs/
    │   └── JobseekerDashboard.module.css
    │
    ├── company/
    │   ├── CompanyDashboard.jsx
    │   ├── components/
    │   │   ├── CompanySummary/
    │   │   ├── NewApplicants/
    │   │   ├── PublishedJobs/
    │   │   ├── PerformanceAnalytics/
    │   │   └── shared/
    │   ├── services/
    │   │   └── companyDataService.js
    │   └── CompanyDashboard.module.css
    │
    ├── admin/
    │   ├── AdminDashboard.jsx
    │   ├── components/
    │   │   ├── Overview/
    │   │   │   ├── RecentActivity.jsx
    │   │   │   ├── PendingActions.jsx
    │   │   │   └── SystemHealth.jsx
    │   │   ├── UserManagement/
    │   │   ├── JobManagement/
    │   │   ├── ContentModeration/
    │   │   ├── Statistics/
    │   │   ├── StaffManagement/
    │   │   └── shared/
    │   ├── styles/
    │   │   ├── _admin-design-tokens.css
    │   │   ├── _admin-layout-base.css
    │   │   └── _admin-utilities.css
    │   └── AdminDashboard.module.css
    │
    ├── client/
    │   ├── ClientDashboard.jsx
    │   └── components/
    │
    └── freelancer/
        ├── FreelancerDashboard.jsx
        └── components/
```

---

**Last Updated**: May 23, 2026  
**Maintainer**: Sherif Talaat  
**Status**: Production-Ready
