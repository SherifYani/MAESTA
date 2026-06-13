# Plan: Fix All Navigation Links, Routes, and Pages

## Overview
This plan fixes all broken navigation links, adds missing routes for existing pages, and creates missing pages referenced in navigation across the MAESTA project.

---

## Phase 1: Fix Broken Links in Header.jsx

**File:** `Frontend/src/components/common/Header.jsx`

### Changes:

#### 1. Fix NAV_GUEST (lines 29-33)
```diff
 const NAV_GUEST = [
   { name: 'Jobs',         path: '/jobs' },
   { name: 'Gigs',         path: '/gigs' },
-  { name: 'AI Assistant', path: '/ai-assistant' },
+  { name: 'AI Tools',     path: '/ai/cv-builder' },
 ];
```

#### 2. Fix NAV_AUTHENTICATED (lines 39-61)
```diff
 const NAV_AUTHENTICATED = {
   jobseeker: [
     { name: 'Dashboard',    path: '/dashboard' },
     { name: 'Jobs',         path: '/jobs' },
-    { name: 'Applications', path: '/applications' },
+    { name: 'Applications', path: '/dashboard/applications' },
     { name: 'Gigs',         path: '/gigs' },
-    { name: 'Messages',     path: '/messages' },
+    { name: 'Messages',     path: '/chat' },
   ],
   freelancer: [
     { name: 'Dashboard', path: '/dashboard' },
     { name: 'Find Gigs', path: '/gigs' },
     { name: 'My Gigs',   path: '/gigs/manage' },
-    { name: 'Proposals', path: '/proposals' },
-    { name: 'Messages',  path: '/messages' },
+    { name: 'Proposals', path: '/gigs/manage' },
+    { name: 'Messages',  path: '/chat' },
   ],
   company: [
     { name: 'Dashboard',       path: '/dashboard' },
     { name: 'Post Job',        path: '/jobs/post' },
-    { name: 'My Jobs',         path: '/jobs/manage' },
-    { name: 'Candidates',      path: '/candidates' },
-    { name: 'Messages',        path: '/messages' },
+    { name: 'My Jobs',         path: '/dashboard/published-jobs' },
+    { name: 'Candidates',      path: '/dashboard/new-applications' },
+    { name: 'Messages',        path: '/chat' },
   ],
+  client: [
+    { name: 'Dashboard',    path: '/dashboard' },
+    { name: 'Gigs',         path: '/gigs' },
+    { name: 'My Projects',  path: '/gigs/manage' },
+    { name: 'Messages',     path: '/chat' },
+  ],
+  admin: [
+    { name: 'Dashboard',       path: '/dashboard' },
+    { name: 'Users',           path: '/dashboard/users' },
+    { name: 'Jobs',            path: '/dashboard/jobs' },
+    { name: 'Moderation',      path: '/dashboard/moderation' },
+  ],
 };
```

#### 3. Fix DROPDOWN_ITEMS (lines 64-68)
```diff
 const DROPDOWN_ITEMS = [
   { icon: <LayoutDashboard size={15} />, label: 'Dashboard', to: '/dashboard' },
   { icon: <User size={15} />,          label: 'Profile',   to: '/dashboard/profile' },
-  { icon: <Settings size={15} />,      label: 'Settings',  to: '/settings' },
+  { icon: <Settings size={15} />,      label: 'Settings',  to: '/notifications/settings' },
 ];
```

---

## Phase 2: Fix Broken Links in Footer.jsx

**File:** `Frontend/src/components/common/Footer.jsx`

### Changes: Update footerSections (lines 29-70)

```diff
 const footerSections = [
     {
         title: 'For Job Seekers',
         links: [
             { label: 'Browse Jobs', href: '/jobs' },
-            { label: 'Pricing', href: '/pricing' },
-            { label: 'Career Guide', href: '/career-guide' },
-            { label: 'Resume Builder', href: '/resume-builder' },
-            { label: 'Interview Prep', href: '/interview-prep' },
+            { label: 'Pricing', href: '/subscription/plans' },
+            { label: 'CV Builder', href: '/ai/cv-builder' },
+            { label: 'Smart Search', href: '/ai/smart-search' },
         ],
     },
     {
         title: 'For Companies',
         links: [
-            { label: 'Start Hiring', href: '/hiring' },
-            { label: 'Pricing', href: '/pricing/employers' },
-            { label: 'Features', href: '/features' },
-            { label: 'Post a Job', href: '/post-job' },
-            { label: 'Contact Sales', href: '/contact-sales' },
+            { label: 'Post a Job', href: '/jobs/post' },
+            { label: 'Dashboard', href: '/dashboard' },
+            { label: 'Pricing', href: '/subscription/plans' },
         ],
     },
     {
         title: 'Company',
         links: [
-            { label: 'About Us', href: '/about' },
-            { label: 'Blog', href: '/blog' },
-            { label: 'Careers', href: '/careers' },
-            { label: 'Press Kit', href: '/press' },
-            { label: 'Brand Guidelines', href: '/brand' },
+            { label: 'About Us', href: '/' },
+            { label: 'Contact', href: '/chat' },
         ],
     },
     {
         title: 'Legal & Support',
         links: [
-            { label: 'Privacy Policy', href: '/privacy' },
-            { label: 'Terms of Service', href: '/terms' },
-            { label: 'Security', href: '/security' },
-            { label: 'Cookie Policy', href: '/cookies' },
-            { label: 'Contact Support', href: '/contact' },
+            { label: 'Help & Support', href: '/chat' },
+            { label: 'Notifications', href: '/notifications' },
         ],
     },
 ];
```

### Update legal links (lines 220-253)
```diff
 <nav className={styles.legalLinks} aria-label="Legal links">
-    <a href="/privacy" className={styles.legalLink}>Privacy Policy</a>
-    <span className={styles.legalSeparator}>•</span>
-    <a href="/terms" className={styles.legalLink}>Terms of Service</a>
-    <span className={styles.legalSeparator}>•</span>
-    <a href="/cookies" className={styles.legalLink}>Cookie Policy</a>
-    <span className={styles.legalSeparator}>•</span>
-    <a href="/accessibility" className={styles.legalLink}>Accessibility</a>
+    <span>© {currentYear} maesta. All rights reserved.</span>
 </nav>
```

---

## Phase 3: Fix Dashboard Navigation (dashboard.config.js)

**File:** `Frontend/src/pages/dashboard/config/dashboard.config.js`

### Changes: Update ROLE_NAVIGATION (lines 1217-1365)

```diff
 export const ROLE_NAVIGATION = {
   [ROLES.CLIENT]: [
     { id: "overview", label: "Overview", icon: Home, path: "/dashboard" },
     { id: "profile", label: "Profile", icon: Users, path: "/dashboard/profile" },
-    { id: "projects", label: "Projects", icon: Briefcase, path: "/dashboard/projects" },
-    { id: "talent", label: "Talent Pool", icon: Users, path: "/dashboard/talent" },
+    { id: "projects", label: "Projects", icon: Briefcase, path: "/gigs/manage" },
     { id: "escrow", label: "Escrow", icon: Shield, path: "/dashboard/escrow" },
-    { id: "messages", label: "Messages", icon: Mail, path: "/dashboard/messages" },
-    { id: "reports", label: "Reports", icon: BarChart, path: "/dashboard/reports" },
+    { id: "messages", label: "Messages", icon: Mail, path: "/chat" },
   ],
   [ROLES.FREELANCER]: [
     { id: "overview", label: "Overview", icon: Home, path: "/dashboard" },
-    { id: "projects", label: "Projects", icon: Briefcase, path: "/dashboard/projects" },
     { id: "my-gigs", label: "My Gigs", icon: Briefcase, path: "/gigs/manage" },
-    { id: "proposals", label: "Proposals", icon: Send, path: "/dashboard/proposals" },
+    { id: "proposals", label: "Proposals", icon: Send, path: "/gigs/manage" },
     { id: "escrow", label: "Escrow", icon: Shield, path: "/dashboard/escrow" },
-    { id: "earnings", label: "Earnings", icon: DollarSign, path: "/dashboard/earnings" },
+    { id: "earnings", label: "Earnings", icon: DollarSign, path: "/dashboard/escrow" },
     { id: "profile", label: "Profile", icon: UserPlus, path: "/dashboard/profile" },
   ],
   [ROLES.COMPANY]: [
     { id: "overview", label: "Overview", icon: Home, path: "/dashboard" },
     { id: "published-jobs", label: "Published Jobs", icon: Briefcase, path: "/dashboard/published-jobs" },
     { id: "new-applications", label: "Applications", icon: Users, path: "/dashboard/new-applications" },
     { id: "performance-analytics", label: "Analytics", icon: BarChart, path: "/dashboard/performance-analytics" },
     { id: "profile", label: "Profile", icon: Building, path: "/dashboard/profile" },
+    { id: "interviews", label: "Interviews", icon: Calendar, path: "/dashboard/interviews" },
+    { id: "export", label: "Export", icon: FileText, path: "/dashboard/export" },
   ],
   [ROLES.JOBSEEKER]: [
     { id: "overview", label: "Overview", icon: Home, path: "/dashboard" },
     { id: "profile", label: "Profile", icon: UserPlus, path: "/dashboard/profile" },
     { id: "saved-jobs", label: "Saved Jobs", icon: Bookmark, path: "/dashboard/saved-jobs" },
     { id: "applications", label: "Applications", icon: FolderOpen, path: "/dashboard/applications" },
     { id: "recommended-jobs", label: "Recommended Jobs", icon: Briefcase, path: "/dashboard/recommended-jobs" },
+    { id: "cv-builder", label: "CV Builder", icon: FileText, path: "/ai/cv-builder" },
   ],
   [ROLES.ADMIN]: [
     { id: "overview", label: "Overview", icon: Home, path: "/dashboard" },
     { id: "users", label: "User Management", icon: Users, path: "/dashboard/users" },
     { id: "jobs", label: "Job Management", icon: Briefcase, path: "/dashboard/jobs" },
     { id: "moderation", label: "Content Moderation", icon: FileText, path: "/dashboard/moderation" },
     { id: "statistics", label: "Statistics & Reports", icon: BarChart, path: "/dashboard/statistics" },
     { id: "staff", label: "Staff Management", icon: UserPlus, path: "/dashboard/staff" },
     { id: "subscriptions", label: "Subscriptions", icon: DollarSign, path: "/dashboard/subscriptions" },
+    { id: "reports", label: "Reports", icon: BarChart, path: "/dashboard/reports" },
+    { id: "activities", label: "Activities", icon: Activity, path: "/dashboard/activities" },
   ],
 };
```

---

## Phase 4: Add Routes for Profile Pages

**File:** `Frontend/src/App.js`

### Add new lazy imports:
```diff
+const JobSeekerProfile = lazy(() => import("./pages/profiles/JobSeekerProfile"));
+const CompanyProfile = lazy(() => import("./pages/profiles/CompanyProfile"));
+const FreelancerProfile = lazy(() => import("./pages/profiles/FreelancerProfile"));
+const ClientProfile = lazy(() => import("./pages/profiles/ClientProfile"));
+const EditJobSeekerProfile = lazy(() => import("./pages/profiles/EditJobSeekerProfile"));
+const EditCompanyProfile = lazy(() => import("./pages/profiles/EditCompanyProfile"));
+const EditClientProfile = lazy(() => import("./pages/profiles/EditClientProfile"));
+const EditFreelancerProfile = lazy(() => import("./pages/profiles/EditFreelancerProfile"));
```

### Add new routes (before the 404 route):
```diff
+        {/* Profile Routes */}
+        <Route path="/profiles/jobseeker/:userId" element={<JobSeekerProfile />} />
+        <Route path="/profiles/company/:userId" element={<CompanyProfile />} />
+        <Route path="/profiles/freelancer/:userId" element={<FreelancerProfile />} />
+        <Route path="/profiles/client/:userId" element={<ClientProfile />} />
+        <Route path="/profiles/edit/jobseeker" element={<ProtectedRoute><EditJobSeekerProfile /></ProtectedRoute>} />
+        <Route path="/profiles/edit/company" element={<ProtectedRoute><EditCompanyProfile /></ProtectedRoute>} />
+        <Route path="/profiles/edit/client" element={<ProtectedRoute><EditClientProfile /></ProtectedRoute>} />
+        <Route path="/profiles/edit/freelancer" element={<ProtectedRoute><EditFreelancerProfile /></ProtectedRoute>} />
```

---

## Phase 5: Add Routes for Onboarding Pages

**File:** `Frontend/src/App.js`

### Add new lazy imports:
```diff
+const JobSeekerOnboarding = lazy(() => import("./pages/onboarding/JobSeekerOnboarding"));
+const CompanyOnBoarding = lazy(() => import("./pages/onboarding/CompanyOnBoarding"));
+const FreelancerOnboarding = lazy(() => import("./pages/onboarding/FreelancerOnboarding"));
+const CompanyMemberOnBoarding = lazy(() => import("./pages/onboarding/CompanyMemberOnBoarding"));
```

### Add new routes:
```diff
+        {/* Onboarding Routes */}
+        <Route path="/onboarding/jobseeker" element={<ProtectedRoute><JobSeekerOnboarding /></ProtectedRoute>} />
+        <Route path="/onboarding/company" element={<ProtectedRoute><CompanyOnBoarding /></ProtectedRoute>} />
+        <Route path="/onboarding/freelancer" element={<ProtectedRoute><FreelancerOnboarding /></ProtectedRoute>} />
+        <Route path="/onboarding/company-member" element={<ProtectedRoute><CompanyMemberOnBoarding /></ProtectedRoute>} />
```

---

## Phase 6: Create Missing Pages

### 6.1 Create ProposalsPage
**File:** `Frontend/src/pages/gigs/ProposalsPage.jsx`

### 6.2 Create EarningsPage
**File:** `Frontend/src/pages/dashboard/tabs/freelancer/EarningsPage.jsx`

### 6.3 Create ProjectsPage
**File:** `Frontend/src/pages/gigs/ProjectsPage.jsx`

### 6.4 Create TalentPoolPage
**File:** `Frontend/src/pages/dashboard/TalentPoolPage.jsx`

---

## Phase 7: Add Routes for New Pages

**File:** `Frontend/src/routes/GigRoutes.jsx`
```diff
+const ProposalsPage = lazy(() => import("../pages/gigs/ProposalsPage"));
+const ProjectsPage = lazy(() => import("../pages/gigs/ProjectsPage"));

 export default function GigRoutes() {
     return (
         <Routes>
             <Route element={<MainLayout />}>
                 <Route index element={<GigListingPage />} />
                 <Route path=":id" element={<GigDetailsPage />} />
                 <Route path="new" element={<GigPostingPage />} />
                 <Route path=":id/bid" element={<GigBiddingPage />} />
                 <Route path="manage" element={<GigManagementPage />} />
                 <Route path=":id/workspace" element={<WorkspacePage />} />
+                <Route path="proposals" element={<ProposalsPage />} />
+                <Route path="projects" element={<ProjectsPage />} />
             </Route>
         </Routes>
     );
 }
```

**File:** `Frontend/src/routes/DashboardRoutes.jsx`
```diff
+const EarningsPage = lazy(() => import("../pages/dashboard/tabs/freelancer/EarningsPage"));
+const TalentPoolPage = lazy(() => import("../pages/dashboard/TalentPoolPage"));

 // Inside the Routes:
+                    <Route path="earnings" element={<ProtectedRoute allowedRoles={['freelancer']}><EarningsPage /></ProtectedRoute>} />
+                    <Route path="talent" element={<ProtectedRoute allowedRoles={['client']}><TalentPoolPage /></ProtectedRoute>} />
```

---

## Phase 8: Verify All Links

After all changes, verify:
1. All Header links point to valid routes
2. All Footer links point to valid routes
3. All Dashboard sidebar links point to valid routes
4. All LandingPage buttons navigate correctly
5. No 404 errors on navigation

---

## Summary of Routes Added

| Route | Component | Auth |
|---|---|---|
| `/profiles/jobseeker/:userId` | JobSeekerProfile | Public |
| `/profiles/company/:userId` | CompanyProfile | Public |
| `/profiles/freelancer/:userId` | FreelancerProfile | Public |
| `/profiles/client/:userId` | ClientProfile | Public |
| `/profiles/edit/jobseeker` | EditJobSeekerProfile | Protected |
| `/profiles/edit/company` | EditCompanyProfile | Protected |
| `/profiles/edit/client` | EditClientProfile | Protected |
| `/profiles/edit/freelancer` | EditFreelancerProfile | Protected |
| `/onboarding/jobseeker` | JobSeekerOnboarding | Protected |
| `/onboarding/company` | CompanyOnBoarding | Protected |
| `/onboarding/freelancer` | FreelancerOnboarding | Protected |
| `/onboarding/company-member` | CompanyMemberOnBoarding | Protected |
| `/gigs/proposals` | ProposalsPage | Protected |
| `/gigs/projects` | ProjectsPage | Protected |
| `/dashboard/earnings` | EarningsPage | Protected |
| `/dashboard/talent` | TalentPoolPage | Protected |

---

## Files to be Modified

1. `Frontend/src/components/common/Header.jsx`
2. `Frontend/src/components/common/Footer.jsx`
3. `Frontend/src/pages/dashboard/config/dashboard.config.js`
4. `Frontend/src/App.js`
5. `Frontend/src/routes/GigRoutes.jsx`
6. `Frontend/src/routes/DashboardRoutes.jsx`

## Files to be Created

1. `Frontend/src/pages/gigs/ProposalsPage.jsx`
2. `Frontend/src/pages/gigs/ProjectsPage.jsx`
3. `Frontend/src/pages/dashboard/tabs/freelancer/EarningsPage.jsx`
4. `Frontend/src/pages/dashboard/TalentPoolPage.jsx`
