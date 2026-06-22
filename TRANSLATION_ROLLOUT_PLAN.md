# MAESTA Internationalization (i18n) Rollout Plan

This document outlines the systematic, module-by-module strategy for translating the entire MAESTA React frontend. By breaking the application into logical modules, we ensure zero downtime, prevent merge conflicts, and maintain high code quality during the transition.

## The 3-Step Translation Loop
For every module listed below, we will execute the following loop:
1. **Code Modification**: Traverse the module's JSX files, importing `useTranslation` and replacing all hardcoded English strings with `t('namespace:key', 'Fallback')`.
2. **Automated Extraction**: Run `npm run i18n:extract` to automatically scrape the newly added keys and populate the English JSON locale files.
3. **AI Translation**: Instantly translate the newly extracted JSON payload into `fr` (French) and `ar` (Arabic) and sync them into the `public/locales/` directory.

---

## 🗺️ Module Rollout Roadmap

### Phase 1: Authentication & Onboarding (🟢 In Progress)
*The critical entry points for all users.*

- [x] `Login.jsx`
- [x] `registration-page.jsx`
- [x] `RegisterForm.jsx`
- [x] `ForgetPasswordPage.jsx`
- [ ] **Pending Auth:** `ResetPasswordPage.jsx`, `VerificationEmailPage.jsx`
- [x] **Onboarding:** `JobSeekerOnboarding.jsx`, `CompanyOnBoarding.jsx`, `FreelancerOnboarding.jsx`, `CompanyMemberOnBoarding.jsx`

### Phase 2: Common Components & Core UI (🟡 Up Next)
*Shared interface elements used across the entire platform.*

- [x] `Header.jsx` & `LanguageSwitcher.jsx`
- [x] `Footer.jsx` & Navigation Sidebars
- [x] **Forms & Inputs:** Date pickers, select dropdowns, custom file uploaders
- [x] **Feedback UI:** Modals, Toast notifications, Error boundaries, and Empty States (`ErrorPage.jsx`)
- [x] **Static Pages:** `LandingPage.jsx`, Pricing/Subscription Plans

### Phase 3: Core Entities (Jobs & Gigs) (🟢 Completed)
*The primary marketplace modules.*

- [x] **Jobs Module:** `JobSearchPage.jsx`, `JobDetailsPage.jsx`, `JobPostingPage.jsx`, `SavedJobsPage.jsx`, `JobApplicationPage.jsx`
- [x] **Gigs Module:** Gig Search, Gig Details, Proposal Submission, `WorkspacePage.jsx`
- [x] **Namespaces to populate:** `jobs.json`, `gigs.json`, `common.json`

### Phase 4: Role-Based Dashboards (🟢 Completed)
*The authenticated user experience.*

- [x] **Jobseeker Dashboard:** Applications tracking, Recommended Jobs, Saved Jobs widgets.
- [x] **Company Dashboard:** Applicant Tracking System (ATS) tables, Published Jobs, Interviews, Analytics.
- [x] **Freelancer Dashboard:** Active Gigs, Proposal tracking.
- [x] **Client Dashboard:** Budget overview, Active job posts, KPIs, Quick actions.
- [x] **Admin Dashboard:** System statistics, User management, Moderation queues.

### Phase 5: Profiles & Communications (⚪ Pending)
*User identity and interaction modules.*

- [ ] **Profiles:** View/Edit pages for `JobSeekerProfile`, `CompanyProfile`, `FreelancerProfile`, `ClientProfile`.
- [ ] **Chat/Messages:** Chat UI, message timestamps, conversation list.
- [ ] **Notifications:** `NotificationsCenterPage.jsx`, `NotificationSettingsPage.jsx`.

### Phase 6: Dynamic Content & Formatting (⚪ Final Polish)
*Ensuring data types and APIs respect the locale.*

- [ ] **Dates & Times:** Apply `useFormattedDate` hook to all timestamps (e.g., job posted dates, message timestamps).
- [ ] **Numbers & Currency:** Apply `useFormattedNumber` hook to salaries, gig budgets, and analytics metrics.
- [ ] **API Errors:** Map standard backend error codes to i18n translation keys so error toasts are localized.

---

## 🛠️ Execution Guidelines

1. **Strict Namespacing**: Always categorize strings appropriately (e.g., `auth`, `validation`, `jobs`, `dashboard`, `common`) to keep JSON files small and fast to load.
2. **Contextual Fallbacks**: Always provide an English fallback in the code: `t('common:submit', 'Submit')` to ensure the UI never breaks if a JSON file fails to load.
3. **Pluralization & Interpolation**: Use i18next pluralization for dynamic text like `{{count}} jobs found` instead of string concatenation.
4. **RTL Validation**: After translating a module to Arabic, we must visually verify that the UI components correctly adhere to the `dir="rtl"` layout changes triggered by our `useLanguageDirection` hook.
5. **Fallback Safety**: Always provide English fallbacks in code to prevent blank text if translation files fail to load.

---

## 📁 File Structure & Organization

### Translation File Hierarchy
```
public/locales/
├── en/
│   ├── common.json
│   ├── auth.json
│   ├── validation.json
│   ├── dashboard.json
│   ├── jobs.json
│   ├── gigs.json
│   ├── profile.json
│   ├── chat.json
│   └── errors.json
├── ar/
│   ├── common.json
│   ├── auth.json
│   ├── validation.json
│   ├── dashboard.json
│   ├── jobs.json
│   ├── gigs.json
│   ├── profile.json
│   ├── chat.json
│   └── errors.json
└── fr/
    ├── common.json
    ├── auth.json
    ├── validation.json
    ├── dashboard.json
    ├── jobs.json
    ├── gigs.json
    ├── profile.json
    ├── chat.json
    └── errors.json
```

### Key Naming Convention
- **Pattern**: `namespace:specificContext.key`
- **Examples**: 
  - `auth:login.title` → Login page title
  - `jobs:search.noResults` → No jobs found message
  - `validation:email.invalid` → Invalid email error
  - `common:buttons.submit` → Submit button text

---

## 🔧 Detailed Implementation Steps

### Phase 1: Authentication & Onboarding (Continued)

#### Pending Auth Pages

**ResetPasswordPage.jsx**
```jsx
// Before
<h1>Reset Your Password</h1>
<p>Enter your new password below</p>

// After
<h1>{t('auth:resetPassword.title')}</h1>
<p>{t('auth:resetPassword.description')}</p>
```

**Translation Keys to Add:**
```json
{
  "resetPassword": {
    "title": "Reset Your Password",
    "description": "Enter your new password below",
    "newPassword": "New Password",
    "confirmPassword": "Confirm New Password",
    "submit": "Reset Password",
    "success": "Password reset successfully",
    "error": "Failed to reset password"
  }
}
```

**VerificationEmailPage.jsx**
```jsx
// Translation Keys
{
  "verificationEmail": {
    "title": "Verify Your Email",
    "description": "We've sent a verification link to {{email}}",
    "resend": "Resend Verification Email",
    "verified": "Email verified successfully",
    "expired": "Verification link has expired"
  }
}
```

#### Onboarding Pages

**JobSeekerOnboarding.jsx**
```json
{
  "onboarding": {
    "jobseeker": {
      "title": "Complete Your Profile",
      "step1": "Personal Information",
      "step2": "Skills & Experience",
      "step3": "Preferences",
      "fullName": "Full Name",
      "phone": "Phone Number",
      "location": "Location",
      "skills": "Skills",
      "experience": "Work Experience",
      "education": "Education",
      "preferences": "Job Preferences",
      "submit": "Complete Profile"
    }
  }
}
```

**CompanyOnBoarding.jsx**
```json
{
  "onboarding": {
    "company": {
      "title": "Company Setup",
      "companyName": "Company Name",
      "industry": "Industry",
      "companySize": "Company Size",
      "website": "Website",
      "description": "Company Description",
      "logo": "Company Logo",
      "submit": "Complete Setup"
    }
  }
}
```

**FreelancerOnboarding.jsx**
```json
{
  "onboarding": {
    "freelancer": {
      "title": "Freelancer Profile",
      "portfolio": "Portfolio URL",
      "hourlyRate": "Hourly Rate",
      "availability": "Availability",
      "skills": "Core Skills",
      "bio": "Professional Bio",
      "submit": "Start Earning"
    }
  }
}
```

### Phase 2: Common Components & Core UI

#### Footer Component
```jsx
// Footer.jsx translation keys
{
  "footer": {
    "about": "About MAESTA",
    "contact": "Contact Us",
    "terms": "Terms of Service",
    "privacy": "Privacy Policy",
    "help": "Help Center",
    "copyright": "© 2026 MAESTA. All rights reserved."
  }
}
```

#### Navigation Sidebars
```json
{
  "sidebar": {
    "dashboard": "Dashboard",
    "jobs": "Jobs",
    "gigs": "Gigs",
    "messages": "Messages",
    "notifications": "Notifications",
    "profile": "Profile",
    "settings": "Settings",
    "logout": "Logout"
  }
}
```

#### Forms & Inputs
```json
{
  "forms": {
    "required": "This field is required",
    "invalidEmail": "Please enter a valid email",
    "minLength": "Minimum {{count}} characters required",
    "maxLength": "Maximum {{count}} characters allowed",
    "passwordMismatch": "Passwords do not match",
    "selectOption": "Select an option",
    "uploadFile": "Upload File",
    "dragDrop": "Drag and drop files here",
    "browse": "Browse"
  }
}
```

#### Feedback UI
```json
{
  "feedback": {
    "modal": {
      "close": "Close",
      "confirm": "Confirm",
      "cancel": "Cancel"
    },
    "toast": {
      "success": "Success",
      "error": "Error",
      "warning": "Warning",
      "info": "Information"
    },
    "emptyState": {
      "title": "No data found",
      "description": "There's nothing to show here yet",
      "action": "Get started"
    }
  }
}
```

#### Static Pages
```json
{
  "landing": {
    "hero": {
      "title": "Find Your Dream Job or Hire Top Talent",
      "subtitle": "The #1 platform connecting job seekers with employers worldwide",
      "searchPlaceholder": "Search for jobs, companies, or skills",
      "searchButton": "Search"
    },
    "features": {
      "title": "Why Choose MAESTA?",
      "feature1": "Smart Matching",
      "feature2": "Real-time Communication",
      "feature3": "Secure Payments"
    }
  },
  "pricing": {
    "title": "Choose Your Plan",
    "free": "Free Plan",
    "premium": "Premium Plan",
    "enterprise": "Enterprise Plan",
    "perMonth": "/month",
    "features": "Features",
    "subscribe": "Subscribe"
  }
}
```

### Phase 3: Core Entities (Jobs & Gigs)

#### Jobs Module
```json
{
  "jobs": {
    "search": {
      "title": "Search Jobs",
      "placeholder": "Job title, keywords, or company",
      "location": "Location",
      "salary": "Salary Range",
      "experience": "Experience Level",
      "employmentType": "Employment Type",
      "remote": "Remote",
      "onsite": "On-site",
      "hybrid": "Hybrid",
      "search": "Search Jobs",
      "filters": "Filters",
      "clearFilters": "Clear Filters",
      "noResults": "No jobs found matching your criteria",
      "tryDifferent": "Try adjusting your search filters"
    },
    "details": {
      "title": "Job Details",
      "apply": "Apply Now",
      "save": "Save Job",
      "share": "Share Job",
      "description": "Job Description",
      "requirements": "Requirements",
      "benefits": "Benefits",
      "company": "Company",
      "location": "Location",
      "posted": "Posted {{time}} ago",
      "applicants": "{{count}} applicants",
      "deadline": "Application Deadline"
    },
    "application": {
      "title": "Apply for {{jobTitle}}",
      "coverLetter": "Cover Letter",
      "resume": "Resume/CV",
      "portfolio": "Portfolio (Optional)",
      "submit": "Submit Application",
      "success": "Application submitted successfully",
      "error": "Failed to submit application"
    },
    "saved": {
      "title": "Saved Jobs",
      "empty": "You haven't saved any jobs yet",
      "remove": "Remove from saved",
      "apply": "Apply"
    }
  }
}
```

#### Gigs Module
```json
{
  "gigs": {
    "search": {
      "title": "Find Gigs",
      "placeholder": "Search for freelance projects",
      "category": "Category",
      "budget": "Budget Range",
      "duration": "Project Duration",
      "search": "Search Gigs"
    },
    "details": {
      "title": "Gig Details",
      "submitProposal": "Submit Proposal",
      "description": "Project Description",
      "requirements": "Requirements",
      "budget": "Budget",
      "deadline": "Project Deadline",
      "client": "Client",
      "proposals": "{{count}} proposals"
    },
    "proposal": {
      "title": "Submit Proposal",
      "coverLetter": "Cover Letter",
      "bidAmount": "Your Bid",
      "estimatedTime": "Estimated Time",
      "submit": "Submit Proposal",
      "success": "Proposal submitted successfully"
    },
    "workspace": {
      "title": "Project Workspace",
      "messages": "Messages",
      "files": "Files",
      "milestones": "Milestones",
      "deliverables": "Deliverables"
    }
  }
}
```

### Phase 4: Role-Based Dashboards

#### Jobseeker Dashboard
```json
{
  "dashboard": {
    "jobseeker": {
      "title": "Jobseeker Dashboard",
      "overview": "Overview",
      "applications": "My Applications",
      "savedJobs": "Saved Jobs",
      "recommended": "Recommended Jobs",
      "profile": "My Profile",
      "settings": "Account Settings",
      "stats": {
        "totalApplications": "Total Applications",
        "interviews": "Interviews Scheduled",
        "offers": "Job Offers",
        "profileViews": "Profile Views"
      },
      "applications": {
        "title": "My Applications",
        "status": "Status",
        "appliedOn": "Applied On",
        "viewDetails": "View Details",
        "withdraw": "Withdraw Application",
        "status": {
          "pending": "Pending",
          "reviewed": "Under Review",
          "shortlisted": "Shortlisted",
          "rejected": "Rejected",
          "interview": "Interview Scheduled",
          "offered": "Offer Extended",
          "accepted": "Offer Accepted",
          "declined": "Offer Declined"
        }
      },
      "recommended": {
        "title": "Recommended for You",
        "basedOn": "Based on your profile and preferences",
        "apply": "Apply",
        "save": "Save"
      }
    }
  }
}
```

#### Company Dashboard
```json
{
  "dashboard": {
    "company": {
      "title": "Company Dashboard",
      "overview": "Overview",
      "myJobs": "My Jobs",
      "candidates": "Candidates",
      "interviews": "Interviews",
      "analytics": "Analytics",
      "stats": {
        "activeJobs": "Active Jobs",
        "totalApplications": "Total Applications",
        "interviewsScheduled": "Interviews Scheduled",
        "hires": "Hires Made"
      },
      "jobs": {
        "title": "My Jobs",
        "postJob": "Post New Job",
        "edit": "Edit",
        "pause": "Pause",
        "close": "Close",
        "delete": "Delete",
        "applications": "{{count}} applications",
        "views": "{{count}} views",
        "status": {
          "active": "Active",
          "paused": "Paused",
          "closed": "Closed",
          "draft": "Draft"
        }
      },
      "candidates": {
        "title": "Candidates",
        "filter": "Filter Candidates",
        "sortBy": "Sort By",
        "viewProfile": "View Profile",
        "scheduleInterview": "Schedule Interview",
        "sendOffer": "Send Offer",
        "reject": "Reject",
        "shortlist": "Shortlist"
      },
      "interviews": {
        "title": "Interviews",
        "schedule": "Schedule Interview",
        "upcoming": "Upcoming",
        "completed": "Completed",
        "cancelled": "Cancelled",
        "reschedule": "Reschedule",
        "cancel": "Cancel"
      }
    }
  }
}
```

#### Freelancer Dashboard
```json
{
  "dashboard": {
    "freelancer": {
      "title": "Freelancer Dashboard",
      "overview": "Overview",
      "activeGigs": "Active Gigs",
      "proposals": "My Proposals",
      "earnings": "Earnings",
      "stats": {
        "activeProjects": "Active Projects",
        "proposalsSent": "Proposals Sent",
        "totalEarnings": "Total Earnings",
        "clientRating": "Client Rating"
      },
      "gigs": {
        "title": "Active Gigs",
        "viewProject": "View Project",
        "submitDeliverable": "Submit Deliverable",
        "messageClient": "Message Client"
      },
      "proposals": {
        "title": "My Proposals",
        "status": "Status",
        "submittedOn": "Submitted On",
        "viewDetails": "View Details",
        "status": {
          "pending": "Pending",
          "accepted": "Accepted",
          "rejected": "Rejected",
          "withdrawn": "Withdrawn"
        }
      }
    }
  }
}
```

#### Admin Dashboard
```json
{
  "dashboard": {
    "admin": {
      "title": "Admin Dashboard",
      "overview": "Overview",
      "users": "User Management",
      "jobs": "Job Moderation",
      "reports": "Reports",
      "settings": "System Settings",
      "stats": {
        "totalUsers": "Total Users",
        "activeJobs": "Active Jobs",
        "totalGigs": "Total Gigs",
        "revenue": "Revenue",
        "pendingApprovals": "Pending Approvals"
      },
      "users": {
        "title": "User Management",
        "filter": "Filter Users",
        "search": "Search Users",
        "viewProfile": "View Profile",
        "suspend": "Suspend",
        "activate": "Activate",
        "ban": "Ban",
        "role": "Role",
        "status": "Status",
        "lastActive": "Last Active"
      },
      "jobs": {
        "title": "Job Moderation",
        "pending": "Pending Approval",
        "approved": "Approved",
        "rejected": "Rejected",
        "review": "Review",
        "approve": "Approve",
        "reject": "Reject",
        "edit": "Edit"
      },
      "reports": {
        "title": "Reports",
        "generate": "Generate Report",
        "userStatistics": "User Statistics",
        "jobAnalytics": "Job Analytics",
        "revenueReport": "Revenue Report",
        "moderationReport": "Moderation Report"
      }
    }
  }
}
```

### Phase 5: Profiles & Communications

#### Profile Pages
```json
{
  "profile": {
    "view": {
      "title": "Profile",
      "edit": "Edit Profile",
      "about": "About",
      "experience": "Experience",
      "education": "Education",
      "skills": "Skills",
      "portfolio": "Portfolio",
      "contact": "Contact Information",
      "social": "Social Links"
    },
    "edit": {
      "title": "Edit Profile",
      "personal": "Personal Information",
      "professional": "Professional Details",
      "preferences": "Preferences",
      "save": "Save Changes",
      "cancel": "Cancel",
      "success": "Profile updated successfully",
      "error": "Failed to update profile"
    },
    "jobseeker": {
      "title": "Jobseeker Profile",
      "resume": "Resume/CV",
      "coverLetter": "Cover Letter",
      "jobPreferences": "Job Preferences",
      "expectedSalary": "Expected Salary",
      "noticePeriod": "Notice Period"
    },
    "company": {
      "title": "Company Profile",
      "companyInfo": "Company Information",
      "industry": "Industry",
      "companySize": "Company Size",
      "founded": "Founded Year",
      "website": "Website",
      "locations": "Office Locations"
    },
    "freelancer": {
      "title": "Freelancer Profile",
      "hourlyRate": "Hourly Rate",
      "availability": "Availability",
      "portfolio": "Portfolio",
      "skills": "Core Skills",
      "languages": "Languages"
    },
    "client": {
      "title": "Client Profile",
      "companyInfo": "Company Information",
      "paymentMethods": "Payment Methods",
      "verified": "Verified Client"
    }
  }
}
```

#### Chat/Messages
```json
{
  "chat": {
    "title": "Messages",
    "newMessage": "New Message",
    "search": "Search conversations",
    "noMessages": "No messages yet",
    "startConversation": "Start a conversation",
    "sendMessage": "Send message",
    "typeMessage": "Type a message...",
    "attachments": "Attachments",
    "send": "Send",
    "online": "Online",
    "offline": "Offline",
    "typing": "typing...",
    "today": "Today",
    "yesterday": "Yesterday",
    "lastSeen": "Last seen {{time}}"
  }
}
```

#### Notifications
```json
{
  "notifications": {
    "title": "Notifications",
    "markAllRead": "Mark all as read",
    "settings": "Notification Settings",
    "noNotifications": "No new notifications",
    "types": {
      "application": "Job Application",
      "interview": "Interview",
      "message": "New Message",
      "jobUpdate": "Job Update",
      "system": "System Notification"
    },
    "settings": {
      "title": "Notification Settings",
      "email": "Email Notifications",
      "push": "Push Notifications",
      "sms": "SMS Notifications",
      "jobAlerts": "Job Alerts",
      "messageAlerts": "Message Alerts",
      "systemAlerts": "System Alerts",
      "save": "Save Settings"
    }
  }
}
```

### Phase 6: Dynamic Content & Formatting

#### Date & Time Formatting
```javascript
// useFormattedDate hook implementation
import { useTranslation } from 'react-i18next';
import { format, formatDistanceToNow } from 'date-fns';
import { ar, fr, enUS } from 'date-fns/locale';

const useFormattedDate = (date) => {
  const { i18n } = useTranslation();
  
  const locales = {
    en: enUS,
    ar: ar,
    fr: fr
  };
  
  const locale = locales[i18n.language] || enUS;
  
  return {
    format: (formatStr) => format(new Date(date), formatStr, { locale }),
    relative: () => formatDistanceToNow(new Date(date), { locale, addSuffix: true })
  };
};
```

#### Number & Currency Formatting
```javascript
// useFormattedNumber hook implementation
import { useTranslation } from 'react-i18next';

const useFormattedNumber = () => {
  const { i18n } = useTranslation();
  
  const formatNumber = (number, options = {}) => {
    return new Intl.NumberFormat(i18n.language, options).format(number);
  };
  
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: currency
    }).format(amount);
  };
  
  const formatPercent = (value) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  };
  
  return { formatNumber, formatCurrency, formatPercent };
};
```

#### API Error Mapping
```json
{
  "errors": {
    "network": {
      "timeout": "Request timeout. Please try again.",
      "offline": "You appear to be offline. Check your connection.",
      "server": "Server error. Please try again later."
    },
    "auth": {
      "invalidCredentials": "Invalid email or password",
      "sessionExpired": "Your session has expired. Please login again.",
      "unauthorized": "You are not authorized to perform this action"
    },
    "validation": {
      "required": "This field is required",
      "invalidFormat": "Invalid format",
      "minLength": "Must be at least {{count}} characters",
      "maxLength": "Must be at most {{count}} characters"
    },
    "api": {
      "generic": "Something went wrong. Please try again.",
      "notFound": "The requested resource was not found",
      "conflict": "This resource already exists"
    }
  }
}
```

---

## 🌐 RTL-Specific Guidelines

### Arabic Layout Considerations

#### CSS Logical Properties
```css
/* Use logical properties instead of physical properties */
.card {
  margin-inline-start: 1rem;  /* Instead of margin-left */
  margin-inline-end: 1rem;    /* Instead of margin-right */
  padding-inline-start: 1rem; /* Instead of padding-left */
  padding-inline-end: 1rem;   /* Instead of padding-right */
  border-inline-start: 1px solid; /* Instead of border-left */
}

/* Text alignment */
.text-start { text-align: start; }  /* Instead of text-align: left */
.text-end { text-align: end; }    /* Instead of text-align: right */
```

#### Icon Mirroring
```jsx
// Icons that need to be mirrored in RTL
const RTL_MIRRORED_ICONS = ['chevron-left', 'chevron-right', 'arrow-left', 'arrow-right'];

const Icon = ({ name }) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const shouldMirror = isRTL && RTL_MIRRORED_ICONS.includes(name);
  
  return (
    <svg className={shouldMirror ? 'transform scale-x-[-1]' : ''}>
      {/* Icon path */}
    </svg>
  );
};
```

#### Flex Direction Handling
```css
/* Automatic flex direction reversal for RTL */
[dir="rtl"] .flex-row {
  flex-direction: row-reverse;
}

/* Or use logical properties */
.flex-row {
  flex-direction: row;
}

[dir="rtl"] .flex-row {
  flex-direction: row-reverse;
}
```

#### Navigation Menu Order
```jsx
// RTL navigation menu
const NavigationMenu = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  
  const menuItems = [
    { key: 'dashboard', label: 'dashboard' },
    { key: 'jobs', label: 'jobs' },
    { key: 'gigs', label: 'gigs' },
    { key: 'profile', label: 'profile' }
  ];
  
  // Reverse order for RTL if needed
  const orderedItems = isRTL ? [...menuItems].reverse() : menuItems;
  
  return (
    <nav>
      {orderedItems.map(item => (
        <MenuItem key={item.key} label={item.label} />
      ))}
    </nav>
  );
};
```

### RTL Testing Checklist

For each module translated to Arabic, verify:
- [ ] Text alignment is right-aligned
- [ ] Margins and paddings are flipped correctly
- [ ] Icons are mirrored appropriately
- [ ] Flex containers reverse direction
- [ ] Grid layouts maintain readability
- [ ] Form labels are positioned correctly
- [ ] Input icons (search, calendar, etc.) are on the correct side
- [ ] Pagination controls are in correct order
- [ ] Table headers and columns align properly
- [ ] Modal close buttons are positioned correctly
- [ ] Tooltip arrows point in correct direction
- [ ] Scrollbar position is correct (right side for RTL)
- [ ] Keyboard navigation follows visual order

---

## 🔌 Backend API Integration

### API Response Localization

#### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "AUTH_INVALID_CREDENTIALS",
    "messageKey": "errors:auth.invalidCredentials",
    "message": "Invalid email or password",
    "details": {}
  }
}
```

#### Success Response Format
```json
{
  "success": true,
  "data": {
    "job": {
      "id": "123",
      "title": "Senior Developer",
      "title_ar": "مطور senior",
      "title_fr": "Développeur Senior",
      "description": "Job description...",
      "description_ar": "وصف الوظيفة...",
      "description_fr": "Description du poste..."
    }
  },
  "messageKey": "jobs:create.success",
  "message": "Job created successfully"
}
```

### Backend Configuration

#### ASP.NET Core Localization Setup
```csharp
// Program.cs
builder.Services.AddLocalization(options => options.ResourcesPath = "Resources");

builder.Services.Configure<RequestLocalizationOptions>(options =>
{
    var supportedCultures = new[]
    {
        new CultureInfo("en-US"),
        new CultureInfo("ar-EG"),
        new CultureInfo("fr-FR")
    };
    
    options.DefaultRequestCulture = new RequestCulture("en-US");
    options.SupportedCultures = supportedCultures;
    options.SupportedUICultures = supportedCultures;
});

app.UseRequestLocalization();
```

#### Resource File Structure
```
JobMagnet.API/Resources/
├── Controllers/
│   ├── AuthController.en-US.resx
│   ├── AuthController.ar-EG.resx
│   ├── AuthController.fr-FR.resx
│   ├── JobsController.en-US.resx
│   ├── JobsController.ar-EG.resx
│   └── JobsController.fr-FR.resx
└── Shared/
    ├── ErrorMessages.en-US.resx
    ├── ErrorMessages.ar-EG.resx
    └── ErrorMessages.fr-FR.resx
```

### Frontend API Service Updates

#### Add Language Header
```javascript
// ApiService.js
import i18n from '../i18n/config';

ApiService.interceptors.request.use((config) => {
  const language = i18n.language;
  config.headers['Accept-Language'] = language;
  config.headers['Content-Language'] = language;
  return config;
});
```

#### Handle Localized Responses
```javascript
// jobService.js
export const getJobDetails = async (jobId) => {
  const response = await ApiService.get(`/api/jobs/${jobId}`);
  const job = response.data;
  
  // Use localized fields if available, fallback to English
  const localizedJob = {
    ...job,
    title: job[`title_${i18n.language}`] || job.title,
    description: job[`description_${i18n.language}`] || job.description
  };
  
  return localizedJob;
};
```

---

## 🧪 Testing Strategy

### Unit Testing

#### Translation Key Testing
```javascript
describe('Translation Keys', () => {
  it('should have all required keys for each language', () => {
    const enKeys = require('../../public/locales/en/common.json');
    const arKeys = require('../../public/locales/ar/common.json');
    const frKeys = require('../../public/locales/fr/common.json');
    
    const enKeySet = new Set(Object.keys(enKeys));
    const arKeySet = new Set(Object.keys(arKeys));
    const frKeySet = new Set(Object.keys(frKeys));
    
    expect(arKeySet).toEqual(enKeySet);
    expect(frKeySet).toEqual(enKeySet);
  });
});
```

#### Language Switching Test
```javascript
describe('Language Switcher', () => {
  it('should switch language and update document direction', () => {
    const { getByText } = render(<LanguageSwitcher />);
    const arabicButton = getByText('العربية');
    
    fireEvent.click(arabicButton);
    
    expect(document.documentElement.dir).toBe('rtl');
    expect(document.documentElement.lang).toBe('ar');
  });
});
```

### Integration Testing

#### End-to-End Language Flow
```javascript
describe('Complete User Flow - Arabic', () => {
  it('should complete login flow in Arabic', async () => {
    // Switch to Arabic
    await page.click('[data-testid="language-switcher"]');
    await page.click('text=العربية');
    
    // Verify RTL
    expect(await page.evaluate(() => document.documentElement.dir)).toBe('rtl');
    
    // Navigate to login
    await page.goto('/login');
    
    // Verify Arabic text
    const loginTitle = await page.textContent('h1');
    expect(loginTitle).toContain('تسجيل الدخول');
    
    // Complete login
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('text=تسجيل الدخول');
    
    // Verify dashboard is in Arabic
    const dashboardTitle = await page.textContent('h1');
    expect(dashboardTitle).toContain('لوحة التحكم');
  });
});
```

### Visual Regression Testing

#### RTL Layout Verification
```javascript
// Playwright test for RTL
test('Arabic layout should match RTL design', async ({ page }) => {
  await page.goto('/?lang=ar');
  
  // Take screenshot
  await page.screenshot({ path: 'arabic-dashboard.png' });
  
  // Verify specific RTL properties
  const sidebar = await page.locator('.sidebar');
  const direction = await sidebar.evaluate(el => 
    window.getComputedStyle(el).direction
  );
  expect(direction).toBe('rtl');
});
```

### Manual Testing Checklist

#### For Each Language (EN, AR, FR)
- [ ] All text is translated
- [ ] No hardcoded strings remain
- [ ] Layout is not broken
- [ ] Text fits in containers properly
- [ ] Date/time formatting is correct
- [ ] Number formatting is correct
- [ ] Currency formatting is correct
- [ ] Error messages are translated
- [ ] Form validation is translated
- [ ] Navigation works correctly
- [ ] Forms submit successfully
- [ ] Modals open and close correctly
- [ ] Notifications display properly

#### Arabic-Specific Checks
- [ ] Text is right-aligned
- [ ] Margins/paddings are flipped
- [ ] Icons are mirrored correctly
- [ ] Flex direction is reversed
- [ ] Grid layouts maintain readability
- [ ] Form labels positioned correctly
- [ ] Input icons on correct side
- [ ] Pagination in correct order
- [ ] Table columns aligned properly
- [ ] Modal close buttons positioned correctly
- [ ] Scrollbar on right side
- [ ] Keyboard navigation follows visual order

---

## 📊 Timeline & Milestones

### Week 1-2: Phase 1 - Authentication & Onboarding
- **Week 1:** Complete remaining auth pages (ResetPassword, VerificationEmail)
- **Week 2:** Complete all onboarding pages (JobSeeker, Company, Freelancer)
- **Milestone:** Users can complete full authentication flow in all 3 languages

### Week 3-4: Phase 2 - Common Components & Core UI
- **Week 3:** Footer, Navigation sidebars, Forms & Inputs
- **Week 4:** Feedback UI (Modals, Toasts), Static pages (Landing, Pricing)
- **Milestone:** Core UI components fully localized

### Week 5-6: Phase 3 - Core Entities (Jobs & Gigs)
- **Week 5:** Jobs module (Search, Details, Application, Saved)
- **Week 6:** Gigs module (Search, Details, Proposal, Workspace)
- **Milestone:** Primary marketplace functionality localized

### Week 7-8: Phase 4 - Role-Based Dashboards
- **Week 7:** Jobseeker and Company dashboards
- **Week 8:** Freelancer and Admin dashboards
- **Milestone:** All user dashboards fully localized

### Week 9: Phase 5 - Profiles & Communications
- Profile pages (View/Edit for all user types)
- Chat/Messages interface
- Notifications center
- **Milestone:** User identity and communication modules localized

### Week 10: Phase 6 - Dynamic Content & Formatting
- Date/time formatting implementation
- Number/currency formatting implementation
- API error mapping
- Backend API localization
- **Milestone:** All dynamic content properly formatted

### Week 11-12: Testing & Polish
- Comprehensive testing (unit, integration, E2E)
- RTL validation for Arabic
- Performance optimization
- Bug fixes and refinements
- **Milestone:** Production-ready multi-language support

---

## ✅ Success Criteria

### Functional Requirements
- [ ] 100% of user-facing text translated to English, Arabic, and French
- [ ] Seamless language switching without page reload
- [ ] Automatic RTL layout for Arabic
- [ ] All form validation messages translated
- [ ] All error messages translated
- [ ] Backend API responses include translation keys
- [ ] Date/time formatting respects locale
- [ ] Number/currency formatting respects locale
- [ ] No hardcoded strings remain in production code
- [ ] Missing translation keys fall back to English

### Non-Functional Requirements
- [ ] Page load time increase < 200ms per language
- [ ] Bundle size increase < 100KB per language
- [ ] 100% translation coverage for user-facing content
- [ ] No broken layouts in any language
- [ ] Consistent user experience across all languages
- [ ] RTL layout passes visual regression tests
- [ ] Language switching works in all browsers
- [ ] Performance metrics meet targets (LCP, TTI, CLS)

### Quality Assurance
- [ ] All translation keys follow naming convention
- [ ] Translation files are properly namespaced
- [ ] No duplicate translation keys
- [ ] All keys have English fallbacks in code
- [ ] RTL layout validated for Arabic
- [ ] Keyboard navigation tested for all languages
- [ ] Screen reader compatibility verified
- [ ] Cross-browser testing completed

### User Experience
- [ ] Intuitive language switcher placement
- [ ] Smooth transitions between languages
- [ ] No content loss during language switch
- [ ] Proper date/number/currency formatting
- [ ] Accessible for screen readers in all languages
- [ ] Mobile-friendly in all languages
- [ ] Error handling is clear in all languages

---

## 🎯 Completion Metrics

### Translation Coverage
- **Target:** 100% of user-facing strings
- **Measurement:** Automated script checking for hardcoded strings
- **Acceptance:** < 1% hardcoded strings remaining

### RTL Compliance
- **Target:** 100% of Arabic UI elements properly RTL
- **Measurement:** Visual regression testing
- **Acceptance:** All RTL-specific checks pass

### Performance Impact
- **Target:** < 200ms additional load time per language
- **Measurement:** Lighthouse performance testing
- **Acceptance:** Performance scores remain above 90

### Bug Rate
- **Target:** < 5 critical bugs related to i18n
- **Measurement:** Bug tracking system
- **Acceptance:** All critical bugs resolved before launch

### User Satisfaction
- **Target:** 90% positive feedback on language support
- **Measurement:** User surveys and feedback
- **Acceptance:** Continuous improvement based on feedback

---

## 📝 Notes & Considerations

### Translation Quality
- Use professional translators for initial translation
- Establish review process for translation accuracy
- Consider cultural nuances and localization vs. translation
- Maintain translation glossary for consistency

### Maintenance
- Establish process for adding new translation keys
- Use translation management platform for ongoing updates
- Regularly review and update translations
- Plan for adding new languages in the future

### Performance
- Implement lazy loading for translation files
- Cache translation files in browser
- Monitor bundle size impact
- Optimize for slow connections

### Accessibility
- Ensure screen readers announce language changes
- Test keyboard navigation in RTL
- Verify ARIA labels are translated
- Maintain accessibility standards across languages

### SEO
- Implement hreflang tags for multilingual SEO
- Create language-specific sitemaps
- Optimize meta tags for each language
- Consider URL structure for language routing

---

**Document Version:** 1.0  
**Last Updated:** 2026-05-18  
**Next Review:** 2026-06-18
