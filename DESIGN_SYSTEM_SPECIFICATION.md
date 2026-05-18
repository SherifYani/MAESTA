# Design System Specification for Missing Pages

**Date:** 2026-05-04  
**Purpose:** Comprehensive design guidelines for all missing dashboard pages

---

## Design System Overview

### Core Design Principles
- **Glassmorphism:** Frosted glass effect with backdrop-filter blur
- **Gradient Accents:** Pink/purple gradient accents throughout
- **Modern Cards:** Rounded corners with gradient borders on hover
- **Smooth Animations:** Subtle transitions and micro-interactions
- **Responsive Design:** Mobile-first approach with breakpoints
- **Accessibility:** High contrast, reduced motion support, keyboard navigation

### Design Tokens

**Note:** All design tokens are defined in `Frontend/src/styles/globals.css`. The color system supports multiple themes (Sand, Rose, Forest, Slate, Ink) with light and dark variants. Use CSS variables instead of hardcoded values to ensure theme compatibility.

```css
/* Spacing System (8px base unit) */
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem;  /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem;    /* 16px */
--space-5: 1.25rem; /* 20px */
--space-6: 1.5rem;  /* 24px */
--space-8: 2rem;    /* 32px */
--space-10: 2.5rem; /* 40px */
--space-12: 3rem;   /* 48px */
--space-16: 4rem;   /* 64px */

/* Typography Scale */
--font-size-xs: 0.75rem;   /* 12px */
--font-size-sm: 0.875rem;  /* 14px */
--font-size-base: 1rem;    /* 16px */
--font-size-lg: 1.125rem;   /* 18px */
--font-size-xl: 1.25rem;    /* 20px */
--font-size-2xl: 1.5rem;    /* 24px */

/* Line Heights */
--line-height-none: 1;
--line-height-tight: 1.25;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;

/* Font Weights */
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;

/* Border Radius System */
--radius-none: 0;
--radius-sm: 0.25rem;   /* 4px */
--radius-md: 0.5rem;    /* 8px */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1rem;      /* 16px */
--radius-2xl: 1.5rem;   /* 24px */
--radius-full: 9999px;

/* Core UI Colors (Theme-dependent - use variables) */
--color-background;      /* Main background */
--color-foreground;      /* Main text color */
--color-card;            /* Card background */
--color-card-foreground; /* Card text color */
--color-popover;         /* Popover background */
--color-popover-foreground; /* Popover text color */
--color-primary;         /* Primary color */
--color-primary-foreground; /* Primary text color */
--color-secondary;        /* Secondary color */
--color-secondary-foreground; /* Secondary text color */
--color-muted;            /* Muted background */
--color-muted-foreground; /* Muted text color */
--color-accent;           /* Accent background */
--color-accent-foreground; /* Accent text color */
--color-destructive;      /* Destructive color */
--color-destructive-foreground; /* Destructive text color */
--color-border;           /* Border color */
--color-input;            /* Input background */
--color-ring;             /* Focus ring color */

/* Sidebar Colors (Theme-dependent) */
--color-sidebar;
--color-sidebar-foreground;
--color-sidebar-primary;
--color-sidebar-primary-foreground;
--color-sidebar-accent;
--color-sidebar-accent-foreground;
--color-sidebar-border;
--color-sidebar-ring;

/* Custom Job Magnet Accent Colors (Theme-dependent) */
--color-accent-pink;      /* Primary accent color */
--color-vivid-pink;       /* Vivid accent color */
--color-light-pink;       /* Light accent color */
--color-select-pink;      /* Selection color */
--color-submit-pink-1;    /* Submit gradient start */
--color-submit-pink-2;    /* Submit gradient end */
--color-shadow-pink;      /* Shadow color */

/* Radial Gradients (Theme-dependent) */
--color-radial-pink-1;
--color-radial-pink-2;
--color-radial-pink-3;

/* Interactive States (Theme-dependent) */
--color-input-hover;
--color-accent-hover;

/* Translucent Overlays (Theme-dependent) */
--color-translucent-white-1;
--color-translucent-white-2;
--color-translucent-white-3;
--color-translucent-white-4;
--color-translucent-white-5;
--color-translucent-black-1;
```

### Theme-Specific Accent Colors

**Sand Theme (Default - Bronze/Gold):**
- Light: `--color-accent-pink: #b8945f`
- Dark: `--color-accent-pink: #9d866f`

**Rose Theme (Dusty Rose):**
- Light: `--color-accent-pink: #b87878`
- Dark: `--color-accent-pink: #9d7070`

**Forest Theme (Sage Green):**
- Light: `--color-accent-pink: #6b9e72`
- Dark: `--color-accent-pink: #5c8c63`

**Slate Theme (Steel Blue):**
- Light: `--color-accent-pink: #5a7fa8`
- Dark: `--color-accent-pink: #4a6e98`

**Ink Theme (Navy):**
- Refer to globals.css for specific values

---

## Admin Dashboard Pages Design

### Design Theme
- **Background:** Radial gradient overlay using `--color-radial-pink-1` at top
- **Card Style:** Glassmorphism with `backdrop-filter: blur(10px)` and gradient borders on hover
- **Accent Color:** Theme-dependent accent using `--color-accent-pink` and `--color-vivid-pink` for interactive elements
- **Layout:** Grid-based with responsive columns
- **Animation:** Fade-in with slide-up effect using CSS animations from `animations.css`

### Coding Standards (from frontend.md)

**File Structure:**
- Every `.jsx` file must have a file header comment with `@file`, `@description`, `@author`, `@date`, `@last-modified-by`, `@last-modified-date`
- Every `.css` file must have a file header comment with `@file` and `@description`
- Use JSDoc-style comments for all functions and components

**React Standards:**
- Use functional components with Hooks
- Name components with PascalCase (e.g., `UserProfile.jsx`)
- Use destructuring for props
- Use `PropTypes` or TypeScript for prop validation
- Use `useState` for local state
- Always provide unique `key` props for lists
- Do not use inline styles - use CSS Modules

**CSS Standards:**
- Use BEM (Block, Element, Modifier) methodology for class names
- Keep CSS in separate files (e.g., `Button.css` for `Button.jsx`)
- Avoid `!important` unless absolutely necessary
- Use `rem` for font sizes and `px` for borders
- Use CSS variables from `globals.css` instead of hardcoded values

**JavaScript Standards:**
- Use `const` by default, `let` only for reassignment
- Use camelCase for variables and functions
- Prefer arrow functions
- Use ES6 modules (`import`/`export`)

### Page Layouts

#### 1. Admin Reports Page
**Route:** `/dashboard/admin/reports`

**Layout Structure:**
```
┌─────────────────────────────────────────────────┐
│ Header (Glassmorphism Card)                      │
│ ├─ Title: "Admin Reports"                        │
│ ├─ Subtitle: "Generate and download reports"     │
│ └─ Action: Export Report Button                   │
├─────────────────────────────────────────────────┤
│ Report Type Selector (Grid of Cards)            │
│ ├─ User Statistics Card                         │
│ ├─ Revenue Report Card                          │
│ ├─ Job Analytics Card                           │
│ └─ Moderation Report Card                        │
├─────────────────────────────────────────────────┤
│ Filter Panel (Glassmorphism Card)                │
│ ├─ Date Range Picker                            │
│ ├─ Dynamic Filters (based on report type)      │
│ └─ Format Selector (CSV, Excel, PDF)            │
├─────────────────────────────────────────────────┤
│ Report Preview (Glassmorphism Card)              │
│ ├─ Summary Statistics (4-column grid)            │
│ ├─ Data Table / Chart Visualization              │
│ └─ Download Button                              │
├─────────────────────────────────────────────────┤
│ Report History (Glassmorphism Card)              │
│ └─ Table of previous exports                    │
└─────────────────────────────────────────────────┘
```

**Key CSS Classes:**
```css
.adminReportsPage {
  padding: var(--space-4);
  max-width: 1600px;
  margin: 0 auto;
  position: relative;
  animation: fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.adminReportsPage::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 400px;
  background: radial-gradient(ellipse at top,
      var(--color-radial-pink-1) 0%,
      transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.reportTypeCard {
  background: var(--color-card);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-2xl);
  padding: var(--space-6);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.reportTypeCard::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: var(--radius-2xl);
  padding: 2px;
  background: linear-gradient(135deg,
      var(--color-accent-pink),
      var(--color-vivid-pink),
      var(--color-accent-pink));
  -webkit-mask: linear-gradient(white 0 0) content-box,
                linear-gradient(white 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(white 0 0) content-box,
       linear-gradient(white 0 0);
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.reportTypeCard:hover::before,
.reportTypeCard.selected::before {
  opacity: 1;
}

.reportTypeCard:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px var(--color-shadow-pink);
}
```

---

#### 2. Admin Pending Actions Detail Page
**Route:** `/dashboard/admin/pending/:actionId`

**Layout Structure:**
```
┌─────────────────────────────────────────────────┐
│ Header (Glassmorphism Card)                      │
│ ├─ Back Button                                  │
│ ├─ Title: "Pending User Approvals"              │
│ └─ Badge: "25 pending"                          │
├─────────────────────────────────────────────────┤
│ Filter Panel (Glassmorphism Card)                │
│ ├─ Status Filter (All, Pending, Resolved)       │
│ ├─ Priority Filter (High, Medium, Low)          │
│ └─ Date Range Filter                            │
├─────────────────────────────────────────────────┤
│ Bulk Actions Bar (Sticky)                       │
│ ├─ Selected: "3 items selected"                │
│ ├─ Approve Button                               │
│ └─ Reject Button                               │
├─────────────────────────────────────────────────┤
│ Items Table (Glassmorphism Card)                │
│ ├─ Checkbox column                              │
│ ├─ Item details columns                         │
│ ├─ Status badge                                 │
│ ├─ Priority badge                               │
│ └─ Action buttons (View, Approve, Reject)      │
├─────────────────────────────────────────────────┤
│ Pagination                                       │
└─────────────────────────────────────────────────┘
```

**Key CSS Classes:**
```css
.bulkActionsBar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--color-card);
  border: 2px solid var(--color-accent-pink);
  border-radius: var(--radius-xl);
  padding: var(--space-4) var(--space-6);
  margin-bottom: var(--space-6);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  box-shadow: 0 8px 24px var(--color-shadow-pink);
  animation: slideDown 0.3s ease-out;
}

.statusBadge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.statusBadge.pending {
  background: rgba(var(--color-accent-pink), 0.1);
  color: var(--color-accent-pink);
  border: 1px solid var(--color-accent-pink);
}

.statusBadge.resolved {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid #22c55e;
}
```

---

#### 3. Admin Resolve Action Page
**Route:** `/dashboard/admin/resolve/:actionId`

**Layout Structure:**
```
┌─────────────────────────────────────────────────┐
│ Header (Glassmorphism Card)                      │
│ ├─ Back Button                                  │
│ └─ Title: "Resolve Pending User"                │
├─────────────────────────────────────────────────┤
│ Item Details Card (Glassmorphism)                │
│ ├─ User Profile Section                          │
│ │  ├─ Profile Photo                             │
│ │  ├─ Name & Email                              │
│ │  ├─ Registration Date                          │
│ │  └─ Profile Completeness                      │
│ ├─ Profile Data Section                         │
│ │  ├─ Personal Information                      │
│ │  ├─ Skills                                    │
│ │  └─ Experience                                │
│ └─ Verification Status                          │
├─────────────────────────────────────────────────┤
│ Resolution Form (Glassmorphism Card)            │
│ ├─ Action Selection (Approve/Reject)             │
│ ├─ Reason Input                                 │
│ ├─ Notes Textarea                              │
│ └─ Submit Button                                │
└─────────────────────────────────────────────────┘
```

**Key CSS Classes:**
```css
.itemDetailsCard {
  background: var(--color-card);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-2xl);
  padding: var(--space-8);
  margin-bottom: var(--space-8);
  backdrop-filter: blur(10px);
}

.profilePhoto {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 3px solid var(--color-accent-pink);
  box-shadow: 0 4px 12px var(--color-shadow-pink);
}

.actionSelector {
  display: flex;
  gap: var(--space-4);
}

.actionOption {
  flex: 1;
  padding: var(--space-4);
  background: var(--color-card);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.actionOption.selected {
  background: linear-gradient(135deg,
      var(--color-submit-pink-1),
      var(--color-submit-pink-2));
  border-color: transparent;
  color: var(--color-primary-foreground);
}
```

---

#### 4. Admin Activities Page
**Route:** `/dashboard/admin/activities`

**Layout Structure:**
```
┌─────────────────────────────────────────────────┐
│ Header (Glassmorphism Card)                      │
│ ├─ Title: "Activity Log"                        │
│ └─ Export Button                                │
├─────────────────────────────────────────────────┤
│ Filter Panel (Glassmorphism Card)                │
│ ├─ Activity Type Filter                         │
│ ├─ User Filter                                  │
│ ├─ Date Range Filter                            │
│ └─ Search Bar                                   │
├─────────────────────────────────────────────────┤
│ Activity Log Table (Glassmorphism Card)          │
│ ├─ Timestamp column                              │
│ ├─ User column                                  │
│ ├─ Action column                                │
│ ├─ Type column (with icon)                      │
│ └─ Details button                               │
├─────────────────────────────────────────────────┤
│ Pagination                                       │
└─────────────────────────────────────────────────┘
```

**Key CSS Classes:**
```css
.activityRow {
  display: grid;
  grid-template-columns: 180px 200px 1fr 120px 80px;
  gap: var(--space-4);
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
  transition: all 0.3s ease;
  align-items: center;
}

.activityRow:hover {
  background: var(--color-accent);
  transform: translateX(4px);
}

.activityType {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-muted);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-muted-foreground);
}
```

---

#### 5. Admin Users Management Page
**Route:** `/dashboard/admin/users`

**Layout Structure:**
```
┌─────────────────────────────────────────────────┐
│ Header (Glassmorphism Card)                      │
│ ├─ Title: "Users Management"                    │
│ └─ Add User Button                              │
├─────────────────────────────────────────────────┤
│ Filter Panel (Glassmorphism Card)                │
│ ├─ Role Filter (All, Admin, Company, Jobseeker)  │
│ ├─ Status Filter (Active, Suspended, Banned)    │
│ └─ Search Bar                                   │
├─────────────────────────────────────────────────┤
│ Users Table (Glassmorphism Card)                 │
│ ├─ User Photo                                   │
│ ├─ Name & Email                                 │
│ ├─ Role Badge                                   │
│ ├─ Status Badge                                 │
│ ├─ Last Login                                   │
│ └─ Action buttons (View, Edit Status, Edit Role) │
├─────────────────────────────────────────────────┤
│ Pagination                                       │
└─────────────────────────────────────────────────┘
```

**Key CSS Classes:**
```css
.roleBadge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.roleBadge.admin {
  background: rgba(var(--color-accent-pink), 0.1);
  color: var(--color-accent-pink);
  border: 1px solid var(--color-accent-pink);
}

.roleBadge.company {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid #3b82f6;
}

.roleBadge.jobseeker {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid #22c55e;
}
```

---

#### 6. Admin Jobs Moderation Page
**Route:** `/dashboard/admin/jobs/moderation`

**Layout Structure:**
```
┌─────────────────────────────────────────────────┐
│ Header (Glassmorphism Card)                      │
│ ├─ Title: "Jobs Moderation"                     │
│ └─ Stats (Pending, Approved, Rejected)           │
├─────────────────────────────────────────────────┤
│ Filter Panel (Glassmorphism Card)                │
│ ├─ Status Filter (Pending, Approved, Rejected)   │
│ ├─ Date Range Filter                            │
│ └─ Search Bar                                   │
├─────────────────────────────────────────────────┤
│ Jobs Table (Glassmorphism Card)                  │
│ ├─ Job Title                                    │
│ ├─ Company Name                                 │
│ ├─ Posted By                                    │
│ ├─ Posted Date                                  │
│ ├─ Status Badge                                 │
│ └─ Action buttons (View, Approve, Reject, Edit) │
├─────────────────────────────────────────────────┤
│ Pagination                                       │
└─────────────────────────────────────────────────┘
```

**Key CSS Classes:**
```css
.moderationButton {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-card);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  color: var(--color-foreground);
  cursor: pointer;
  transition: all 0.3s ease;
}

.moderationButton.approve:hover {
  background: #22c55e;
  border-color: #22c55e;
  color: white;
}

.moderationButton.reject:hover {
  background: #ef4444;
  border-color: #ef4444;
  color: white;
}
```

---

## Company Dashboard Pages Design

### Design Theme
- **Background:** Radial gradient overlay using `--color-radial-pink-1` at top
- **Card Style:** Glassmorphism with `backdrop-filter: blur(10px)` and gradient borders on hover
- **Accent Color:** Theme-dependent accent using `--color-accent-pink` and `--color-vivid-pink` for interactive elements
- **Layout:** Grid-based with responsive columns
- **Animation:** Fade-in with slide-up effect using CSS animations from `animations.css`
- **Same as Admin Dashboard** - follows identical design system and coding standards

### Page Layouts

#### 7. Interview Scheduling Page
**Route:** `/dashboard/interviews/schedule?applicantId=:id`

**Layout Structure:**
```
┌─────────────────────────────────────────────────┐
│ Header (Glassmorphism Card)                      │
│ ├─ Back Button                                  │
│ └─ Title: "Schedule Interview"                  │
├─────────────────────────────────────────────────┤
│ Applicant Profile Card (Glassmorphism)           │
│ ├─ Profile Photo                                 │
│ ├─ Name & Contact Info                          │
│ ├─ Applied Jobs Dropdown                        │
│ └─ Interview History                            │
├─────────────────────────────────────────────────┤
│ Scheduling Form (Glassmorphism Card)             │
│ ├─ Calendar Picker                              │
│ ├─ Time Slot Selection (Grid)                    │
│ ├─ Interview Type (Phone, Video, In-person)     │
│ ├─ Location/Link Input                          │
│ ├─ Notes Textarea                              │
│ └─ Schedule Button                              │
├─────────────────────────────────────────────────┤
│ Confirmation Dialog (Modal)                      │
│ └─ Interview Summary + Confirm/Cancel           │
└─────────────────────────────────────────────────┘
```

**Key CSS Classes:**
```css
.timeSlotGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: var(--space-3);
  margin-top: var(--space-4);
}

.timeSlot {
  padding: var(--space-3);
  background: var(--color-card);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-foreground);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.timeSlot.selected {
  background: linear-gradient(135deg,
      var(--color-submit-pink-1),
      var(--color-submit-pink-2));
  border-color: transparent;
  color: var(--color-primary-foreground);
}

.interviewTypeSelector {
  display: flex;
  gap: var(--space-4);
  margin-top: var(--space-4);
}

.typeOption.selected {
  background: linear-gradient(135deg,
      var(--color-submit-pink-1),
      var(--color-submit-pink-2));
  border-color: transparent;
  color: var(--color-primary-foreground);
}
```

---

#### 8. Company Export Page
**Route:** `/dashboard/export?type=:type`

**Layout Structure:**
```
┌─────────────────────────────────────────────────┐
│ Header (Glassmorphism Card)                      │
│ ├─ Back Button                                  │
│ └─ Title: "Export Data"                         │
├─────────────────────────────────────────────────┤
│ Export Type Selector (Grid of Cards)            │
│ ├─ Applicants Card                              │
│ ├─ Jobs Card                                   │
│ ├─ Analytics Card                              │
│ └─ Applications Card                            │
├─────────────────────────────────────────────────┤
│ Filter Panel (Glassmorphism Card)                │
│ ├─ Date Range Picker                            │
│ ├─ Dynamic Filters (based on export type)      │
│ └─ Format Selector (CSV, Excel, PDF)            │
├─────────────────────────────────────────────────┤
│ Preview Table (Glassmorphism Card)              │
│ └─ First 10 records preview                      │
├─────────────────────────────────────────────────┤
│ Export History (Glassmorphism Card)              │
│ └─ Table of previous exports                    │
└─────────────────────────────────────────────────┘
```

**Key CSS Classes:**
```css
.exportTypeCard {
  background: var(--color-card);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-2xl);
  padding: var(--space-6);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.exportTypeCard::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: var(--radius-2xl);
  padding: 2px;
  background: linear-gradient(135deg,
      var(--color-accent-pink),
      var(--color-vivid-pink),
      var(--color-accent-pink));
  -webkit-mask: linear-gradient(white 0 0) content-box,
                linear-gradient(white 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(white 0 0) content-box,
       linear-gradient(white 0 0);
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.exportTypeCard:hover::before {
  opacity: 1;
}
```

---

#### 9. Company Interviews Management Page
**Route:** `/dashboard/interviews`

**Layout Structure:**
```
┌─────────────────────────────────────────────────┐
│ Header (Glassmorphism Card)                      │
│ ├─ Title: "Interviews Management"               │
│ └─ Schedule Interview Button                     │
├─────────────────────────────────────────────────┤
│ Calendar View (Glassmorphism Card)                │
│ └─ Monthly calendar with interview indicators   │
├─────────────────────────────────────────────────┤
│ Filter Panel (Glassmorphism Card)                │
│ ├─ Status Filter (Scheduled, Completed, Cancelled)│
│ └─ Date Range Filter                            │
├─────────────────────────────────────────────────┤
│ Interviews List (Glassmorphism Card)             │
│ ├─ Applicant Photo                              │
│ ├─ Applicant Name                               │
│ ├─ Job Title                                    │
│ ├─ Date & Time                                  │
│ ├─ Interview Type                               │
│ ├─ Status Badge                                 │
│ └─ Action buttons (View, Reschedule, Cancel)     │
├─────────────────────────────────────────────────┤
│ Pagination                                       │
└─────────────────────────────────────────────────┘
```

**Key CSS Classes:**
```css
.calendarView {
  background: var(--color-card);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-2xl);
  padding: var(--space-8);
  margin-bottom: var(--space-8);
  backdrop-filter: blur(10px);
}

.calendarGrid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--space-2);
}

.calendarDay {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--color-card);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.calendarDay.hasInterview {
  border-color: var(--color-accent-pink);
}

.calendarDay.hasInterview::after {
  content: "";
  position: absolute;
  bottom: 6px;
  width: 8px;
  height: 8px;
  background: var(--color-accent-pink);
  border-radius: var(--radius-full);
}
```

---

#### 10. Company Applicants Management Page
**Route:** `/dashboard/applicants`

**Layout Structure:**
```
┌─────────────────────────────────────────────────┐
│ Header (Glassmorphism Card)                      │
│ ├─ Title: "Applicants Management"               │
│ └─ Stats (Total, Shortlisted, Interviewed, Hired)│
├─────────────────────────────────────────────────┤
│ Filter Panel (Glassmorphism Card)                │
│ ├─ Job Filter (All jobs dropdown)               │
│ ├─ Status Filter (Applied, Shortlisted, etc.)     │
│ └─ Search Bar                                   │
├─────────────────────────────────────────────────┤
│ Applicants Table (Glassmorphism Card)             │
│ ├─ Applicant Photo                              │
│ ├─ Name & Email                                 │
│ ├─ Applied Job                                 │
│ ├─ Applied Date                                 │
│ ├─ Status Badge                                 │
│ ├─ Rating Stars                                 │
│ └─ Action buttons (View, Update Status, Rate)    │
├─────────────────────────────────────────────────┤
│ Pagination                                       │
└─────────────────────────────────────────────────┘
```

**Key CSS Classes:**
```css
.ratingStars {
  display: flex;
  gap: var(--space-1);
}

.star {
  width: 18px;
  height: 18px;
  color: var(--color-muted);
  cursor: pointer;
  transition: color 0.3s ease;
}

.star.filled {
  color: #eab308;
}

.applicantRow {
  display: grid;
  grid-template-columns: 60px 1fr 1fr 1fr 1fr 100px 140px;
  gap: var(--space-4);
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
  transition: all 0.3s ease;
  align-items: center;
}

.applicantRow:hover {
  background: var(--color-accent);
  transform: translateX(4px);
}
```

---

## Shared Component Library

### Modal Component
```css
.modalOverlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modalContent {
  background: var(--color-card);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-2xl);
  padding: var(--space-8);
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}
```

### Pagination Component
```css
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-6);
}

.paginationButton {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-card);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  color: var(--color-foreground);
  cursor: pointer;
  transition: all 0.3s ease;
}

.paginationButton.active {
  background: linear-gradient(135deg,
      var(--color-accent-pink),
      var(--color-vivid-pink));
  border-color: transparent;
  color: white;
}
```

### Success/Error Messages
```css
.successMessage {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-6);
  background: rgba(34, 197, 94, 0.1);
  border: 2px solid #22c55e;
  border-radius: var(--radius-xl);
  margin-bottom: var(--space-6);
  animation: slideDown 0.3s ease-out;
}

.errorMessage {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-6);
  background: rgba(239, 68, 68, 0.1);
  border: 2px solid #ef4444;
  border-radius: var(--radius-xl);
  margin-bottom: var(--space-6);
  animation: slideDown 0.3s ease-out;
}
```

---

## Responsive Breakpoints

### Breakpoint System
```css
/* Mobile First Approach */

/* Mobile: < 40rem (640px) */
@media (max-width: 40rem) {
  /* Mobile-specific styles */
}

/* Tablet: 40rem - 60.5rem (640px - 968px) */
@media (min-width: 40rem) {
  /* Tablet-specific styles */
}

/* Desktop: 60.5rem - 75rem (968px - 1200px) */
@media (min-width: 60.5rem) {
  /* Desktop-specific styles */
}

/* Large Desktop: > 75rem (1200px) */
@media (min-width: 75rem) {
  /* Large desktop-specific styles */
}
```

### Responsive Patterns

**Grid Layouts:**
```css
.responsiveGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
}

@media (min-width: 40rem) {
  .responsiveGrid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 60.5rem) {
  .responsiveGrid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 75rem) {
  .responsiveGrid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

**Typography Scaling:**
```css
.responsiveTitle {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
}

.responsiveSubtitle {
  font-size: clamp(0.875rem, 2vw, 1.125rem);
}
```

---

## Animation System

### Key Animations
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
```

### Animation Usage
```css
.pageContainer {
  animation: fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.card {
  animation: slideUp 0.5s ease-out both;
}

.card:nth-child(1) {
  animation-delay: 0.1s;
}

.card:nth-child(2) {
  animation-delay: 0.2s;
}

.card:nth-child(3) {
  animation-delay: 0.3s;
}
```

---

## Accessibility

### Focus Styles
```css
button:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: 3px solid var(--color-accent-pink);
  outline-offset: 3px;
  box-shadow: 0 0 0 6px var(--color-radial-pink-2);
}

button:focus:not(:focus-visible) {
  outline: none;
}
```

### Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### High Contrast Mode
```css
@media (prefers-contrast: high) {
  .card {
    border: 3px solid var(--color-foreground);
  }
  
  .button {
    border: 3px solid var(--color-foreground);
  }
}
```

---

## Summary

### Design Consistency
- **All Admin pages** follow the same glassmorphism design system
- **All Company pages** follow the same glassmorphism design system
- **Shared components** (Modal, Pagination, Messages) are reused across all pages
- **Consistent spacing** using design tokens
- **Consistent typography** using design tokens
- **Consistent colors** using design tokens

### Design Tokens Usage
- Use `--color-accent-pink` for primary actions and highlights
- Use `--color-card` with `backdrop-filter: blur(10px)` for glassmorphism
- Use `--radius-2xl` for card corners
- Use `--space-6` to `--space-8` for card padding
- Use `--font-size-xl` to `--font-size-2xl` for titles
- Use `--font-size-sm` for body text

### Responsive Strategy
- Mobile-first approach
- Single column on mobile
- Multi-column on tablet and desktop
- Touch-friendly targets (min 48px) on mobile
- Sticky headers on mobile for better UX

### Animation Strategy
- Subtle fade-in for page load
- Slide-up for cards
- Scale and translate for hover effects
- Gradient border reveal on hover
- Smooth transitions (0.3s - 0.4s)
- Respect reduced motion preference
