# Frontend Architecture Report

**Date:** 2026-05-04  
**Purpose:** Document the file structure and architecture of the MAESTA frontend application for AI development reference

---

## Table of Contents
1. [Project Root Structure](#project-root-structure)
2. [Source Directory Structure](#source-directory-structure)
3. [Pages Directory Structure](#pages-directory-structure)
4. [Components Directory Structure](#components-directory-structure)
5. [Styles Directory Structure](#styles-directory-structure)
6. [Services Directory Structure](#services-directory-structure)
7. [File Naming Conventions](#file-naming-conventions)
8. [Missing Pages File Locations](#missing-pages-file-locations)
9. [Import Path Patterns](#import-path-patterns)

---

## Project Root Structure

```
d:\MAESTA\Frontend\
├── public/                 # Static assets (favicons, etc.)
├── src/                    # Source code
├── build/                  # Build output (generated)
├── node_modules/           # Dependencies (generated)
├── MAESTA/                 # Additional resources
└── Configuration files     # package.json, etc.
```

---

## Source Directory Structure

```
d:\MAESTA\Frontend\src\
├── App.js                 # Main React application component
├── index.js               # React entry point
├── assets/                # Static assets (images, icons)
├── components/            # Reusable UI components
├── context/               # React Context providers
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
├── mocks/                 # Mock data for development
├── pages/                 # Page components
├── routes/                # Route configuration
├── services/              # API service layer
├── styles/                # Global styles and CSS variables
└── utils/                 # Utility functions
```

---

## Pages Directory Structure

```
d:\MAESTA\Frontend\src\pages\
├── ErrorPage.jsx                 # 404/Error page
├── ErrorPage.module.css
├── LandingPage.jsx               # Landing page
├── Login.jsx                      # Login page
├── PaymentPage.jsx               # Payment page
├── PaymentPage.module.css
├── SubscriptionPlansPage.jsx      # Subscription plans
├── SubscriptionPlansPage.module.css
├── ai-assistant/                  # AI Assistant pages
├── auth/                          # Authentication pages
├── chat/                          # Chat pages
├── dashboard/                     # Dashboard pages (main focus)
├── gigs/                          # Gigs pages
├── jobs/                          # Jobs pages
├── notifications/                 # Notification pages
├── onboarding/                    # Onboarding pages
└── profiles/                      # Profile pages
```

### Dashboard Directory Structure

```
d:\MAESTA\Frontend\src\pages\dashboard\
├── Dashboard.jsx                  # Main dashboard wrapper
├── RoleBasedRoutes.jsx            # Role-based routing logic
├── dashboard.module.css
├── components/                    # Dashboard-specific components
├── config/                        # Dashboard configuration
├── hooks/                         # Dashboard-specific hooks
├── layout/                        # Dashboard layout components
└── tabs/                          # Role-specific dashboard tabs
    ├── admin/                     # Admin dashboard
    ├── client/                    # Client dashboard
    ├── company/                   # Company dashboard
    ├── freelancer/                # Freelancer dashboard
    ├── jobseeker/                 # Jobseeker dashboard
    └── shared/                    # Shared dashboard components
```

### Admin Dashboard Structure

```
d:\MAESTA\Frontend\src\pages\dashboard\tabs\admin\
├── AdminDashboard.jsx             # Admin dashboard main component
├── AdminDashboard.module.css
├── components/                    # Admin dashboard components
│   ├── Overview/                  # Overview widgets
│   │   ├── PendingActions.jsx
│   │   ├── RecentActivity.jsx
│   │   └── SystemHealth.jsx
│   └── [other admin components]
├── config/                        # Admin configuration
│   └── adminMockData.js
└── styles/                        # Admin-specific styles
```

### Company Dashboard Structure

```
d:\MAESTA\Frontend\src\pages\dashboard\tabs\company\
├── CompanyDashboard.jsx           # Company dashboard main component
├── CompanyDashboard.module.css
├── components/                    # Company dashboard components
└── services/                      # Company-specific services
```

---

## Components Directory Structure

```
d:\MAESTA\Frontend\src\components\
├── EnhancedBubble.jsx             # Enhanced bubble component
├── ai-assistant/                   # AI Assistant components
├── chat/                          # Chat components
├── common/                        # Common/reusable components
│   ├── Alert.jsx
│   ├── Button.jsx
│   ├── Common.module.css
│   ├── Footer.jsx
│   ├── Footer.module.css
│   ├── GeneralSelect.jsx
│   ├── GeneralSelect.module.css
│   ├── Header.jsx
│   ├── Header.module.css
│   ├── Input.jsx
│   ├── LoadingSpinner.jsx
│   ├── ProtectedRoute.jsx
│   ├── Skeleton/                  # Skeleton loading components
│   ├── SkipToContent.jsx
│   ├── SkipToContent.module.css
│   ├── ThemeToggle.jsx
│   ├── ThemeToggle.module.css
│   └── index.js
├── forms/                         # Form components
├── gigs/                          # Gigs-related components
├── jobs/                          # Jobs-related components
├── layout/                        # Layout components
├── notifications/                 # Notification components
├── payment/                       # Payment components
├── subscription/                  # Subscription components
└── video/                         # Video call components
```

---

## Styles Directory Structure

```
d:\MAESTA\Frontend\src\styles\
├── App.css                        # App-specific styles
├── animations.css                 # CSS animations
├── auth-pages.css                 # Authentication page styles
├── components/                    # Component-specific styles
├── edit-profile.css               # Edit profile styles
├── globals.css                    # Global CSS variables and theme system
├── index.css                      # Entry point styles
├── landing-page.css               # Landing page styles
├── login.css                      # Login page styles
├── pages/                         # Page-specific styles
├── profile.css                    # Profile page styles
└── shared/                        # Shared utility styles
```

### Global CSS Variables (globals.css)

The `globals.css` file contains:
- Typography system (font sizes, line heights, font weights)
- Spacing system (8px base unit)
- Border radius system
- Multi-theme system (Sand, Rose, Forest, Slate, Ink)
- Core UI colors (theme-dependent)
- Sidebar colors (theme-dependent)
- Custom Job Magnet accent colors (theme-dependent)
- Radial gradients (theme-dependent)
- Interactive states (theme-dependent)
- Translucent overlays (theme-dependent)

---

## Services Directory Structure

```
d:\MAESTA\Frontend\src\services\
├── ApiService.js                  # Base API service with configuration
├── aiAssistantService.js          # AI Assistant API calls
├── authService.js                 # Authentication API calls
├── chatService.js                 # Chat API calls
├── gigService.js                  # Gigs API calls
├── jobService.js                  # Jobs API calls
├── notificationService.js          # Notification API calls
├── paymentService.js              # Payment API calls
└── profileService.js              # Profile API calls
```

### API Service Pattern

All services follow this pattern:
- Import base `ApiService` for HTTP client configuration
- Export functions for specific API endpoints
- Use async/await for API calls
- Handle errors consistently
- Return data in standardized format

---

## File Naming Conventions

### React Components
- **PascalCase** for component names: `UserProfile.jsx`
- **CamelCase** for component files: `userProfile.jsx` (if using lowercase convention)
- **CSS Modules:** Same name as component with `.module.css` suffix
  - Example: `UserProfile.jsx` → `UserProfile.module.css`

### CSS Files
- **kebab-case** for standalone CSS files: `landing-page.css`
- **camelCase** for CSS module files: `UserProfile.module.css`

### JavaScript/JSX Files
- **PascalCase** for React components: `Dashboard.jsx`
- **camelCase** for utilities/services: `apiService.js`
- **kebab-case** for configuration: `admin-config.js`

### Directory Names
- **kebab-case** for directories: `ai-assistant/`, `job-seeker/`
- **camelCase** for some directories: `components/`, `services/` (existing convention)

---

## Missing Pages File Locations

Based on the missing pages identified in `MISSING_PAGES_REPORT.md`, here are the recommended file locations:

### Admin Dashboard Pages

**1. Admin Reports Page**
```
d:\MAESTA\Frontend\src\pages\dashboard\tabs\admin\
├── AdminReports.jsx
└── AdminReports.module.css
```

**2. Admin Pending Actions Detail Page**
```
d:\MAESTA\Frontend\src\pages\dashboard\tabs\admin\
├── AdminPendingActions.jsx
└── AdminPendingActions.module.css
```

**3. Admin Resolve Action Page**
```
d:\MAESTA\Frontend\src\pages\dashboard\tabs\admin\
├── AdminResolveAction.jsx
└── AdminResolveAction.module.css
```

**4. Admin Activities Page**
```
d:\MAESTA\Frontend\src\pages\dashboard\tabs\admin\
├── AdminActivities.jsx
└── AdminActivities.module.css
```

**5. Admin Users Management Page**
```
d:\MAESTA\Frontend\src\pages\dashboard\tabs\admin\
├── AdminUsersManagement.jsx
└── AdminUsersManagement.module.css
```

**6. Admin Jobs Moderation Page**
```
d:\MAESTA\Frontend\src\pages\dashboard\tabs\admin\
├── AdminJobsModeration.jsx
└── AdminJobsModeration.module.css
```

### Company Dashboard Pages

**7. Interview Scheduling Page**
```
d:\MAESTA\Frontend\src\pages\dashboard\tabs\company\
├── InterviewScheduling.jsx
└── InterviewScheduling.module.css
```

**8. Company Export Page**
```
d:\MAESTA\Frontend\src\pages\dashboard\tabs\company\
├── CompanyExport.jsx
└── CompanyExport.module.css
```

**9. Company Interviews Management Page**
```
d:\MAESTA\Frontend\src\pages\dashboard\tabs\company\
├── CompanyInterviews.jsx
└── CompanyInterviews.module.css
```

**10. Company Applicants Management Page**
```
d:\MAESTA\Frontend\src\pages\dashboard\tabs\company\
├── CompanyApplicants.jsx
└── CompanyApplicants.module.css
```

### Shared Components (to be created)

**Reusable Components for Missing Pages**
```
d:\MAESTA\Frontend\src\components\common\
├── DataTable.jsx                    # Reusable data table component
├── DataTable.module.css
├── DatePicker.jsx                   # Date picker component
├── DatePicker.module.css
├── Modal.jsx                        # Modal component
├── Modal.module.css
├── Pagination.jsx                   # Pagination component
├── Pagination.module.css
├── FilterPanel.jsx                  # Filter panel component
├── FilterPanel.module.css
└── Badge.jsx                        # Badge component
    └── Badge.module.css
```

### API Services (to be created)

**Services for Missing Pages**
```
d:\MAESTA\Frontend\src\services\
├── adminService.js                 # Admin-specific API calls
├── interviewService.js             # Interview API calls
└── exportService.js                # Export API calls
```

---

## Import Path Patterns

### Importing Components
```javascript
// From common components
import Button from 'components/common/Button';
import Modal from 'components/common/Modal';

// From dashboard components
import PendingActions from 'pages/dashboard/tabs/admin/components/Overview/PendingActions';

// From services
import { getAdminReports } from 'services/adminService';
```

### Importing Styles
```javascript
// CSS Modules
import styles from './AdminReports.module.css';

// Global styles
import 'styles/globals.css';
```

### Importing Utilities
```javascript
// From utils
import { formatDate } from 'utils/dateUtils';

// From hooks
import { useAuth } from 'hooks/useAuth';
```

---

## Route Configuration

Routes are configured in:
```
d:\MAESTA\Frontend\src\routes\
```

### Missing Pages Routes

Add these routes to the route configuration:

```javascript
// Admin Dashboard Routes
{
  path: '/dashboard/admin/reports',
  element: <AdminReports />,
  roles: ['admin']
},
{
  path: '/dashboard/admin/pending/:actionId',
  element: <AdminPendingActions />,
  roles: ['admin']
},
{
  path: '/dashboard/admin/resolve/:actionId',
  element: <AdminResolveAction />,
  roles: ['admin']
},
{
  path: '/dashboard/admin/activities',
  element: <AdminActivities />,
  roles: ['admin']
},
{
  path: '/dashboard/admin/users',
  element: <AdminUsersManagement />,
  roles: ['admin']
},
{
  path: '/dashboard/admin/jobs/moderation',
  element: <AdminJobsModeration />,
  roles: ['admin']
},

// Company Dashboard Routes
{
  path: '/dashboard/interviews/schedule',
  element: <InterviewScheduling />,
  roles: ['company']
},
{
  path: '/dashboard/export',
  element: <CompanyExport />,
  roles: ['company']
},
{
  path: '/dashboard/interviews',
  element: <CompanyInterviews />,
  roles: ['company']
},
{
  path: '/dashboard/applicants',
  element: <CompanyApplicants />,
  roles: ['company']
}
```

---

## Component Architecture Patterns

### Page Component Structure
```javascript
/**
 * @file PageName.jsx
 * @description Description of the page
 * @author [Author Name]
 * @date [Date]
 *
 * @last-modified-by [Modifier Name]
 * @last-modified-date [Modification Date]
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PageName.module.css';
import { apiFunction } from 'services/serviceName';

/**
 * PageName Component
 * @param {Object} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const PageName = ({ prop1, prop2 }) => {
  // State
  const [state, setState] = useState(null);
  const navigate = useNavigate();

  // Effects
  useEffect(() => {
    // Initialization logic
  }, []);

  // Handlers
  const handleAction = () => {
    // Action logic
  };

  // Render
  return (
    <div className={styles.pageContainer}>
      {/* Page content */}
    </div>
  );
};

export default PageName;
```

### CSS Module Structure
```css
/**
 * @file PageName.module.css
 * @description Styles for PageName component
 */

.pageContainer {
  /* Container styles */
}
```

---

## API Service Pattern

```javascript
/**
 * @file serviceName.js
 * @description API service for [feature]
 * @author [Author Name]
 * @date [Date]
 */

import ApiService from './ApiService';

/**
 * Get data from API
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} API response
 */
export const getData = async (params) => {
  try {
    const response = await ApiService.get('/api/endpoint', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

/**
 * Create data via API
 * @param {Object} data - Data to create
 * @returns {Promise<Object>} API response
 */
export const createData = async (data) => {
  try {
    const response = await ApiService.post('/api/endpoint', data);
    return response.data;
  } catch (error) {
    console.error('Error creating data:', error);
    throw error;
  }
};
```

---

## Summary

### Key Architectural Principles

1. **Separation of Concerns:**
   - Pages in `src/pages/`
   - Reusable components in `src/components/`
   - API logic in `src/services/`
   - Styles in `src/styles/` or as CSS modules

2. **CSS Modules:**
   - Component-specific styles use CSS Modules
   - Global styles in `src/styles/`
   - Theme variables in `src/styles/globals.css`

3. **Service Layer:**
   - All API calls centralized in `src/services/`
   - Base `ApiService` for HTTP configuration
   - Consistent error handling

4. **Role-Based Routing:**
   - Dashboard tabs organized by role (admin, company, jobseeker, etc.)
   - Route protection via `RoleBasedRoutes.jsx`

5. **File Organization:**
   - Co-locate related files (component + CSS module)
   - Use descriptive directory names
   - Follow existing naming conventions

### Development Workflow

1. Create page component in appropriate `src/pages/dashboard/tabs/[role]/` directory
2. Create corresponding CSS module file
3. Add API service functions in `src/services/` if needed
4. Add route configuration in `src/routes/`
5. Import and use existing components from `src/components/common/`
6. Use CSS variables from `src/styles/globals.css` for theming
