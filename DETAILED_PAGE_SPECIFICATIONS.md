# Detailed Page Technical Specifications

**Date:** 2026-05-04  
**Purpose:** Comprehensive technical specifications for all missing dashboard pages

---

## Table of Contents
1. [Admin Reports Page](#1-admin-reports-page)
2. [Admin Pending Actions Detail Page](#2-admin-pending-actions-detail-page)
3. [Admin Resolve Action Page](#3-admin-resolve-action-page)
4. [Admin Activities Page](#4-admin-activities-page)
5. [Interview Scheduling Page](#5-interview-scheduling-page)
6. [Company Export Page](#6-company-export-page)
7. [Admin Users Management Page](#7-admin-users-management-page)
8. [Admin Jobs Moderation Page](#8-admin-jobs-moderation-page)
9. [Company Interviews Management Page](#9-company-interviews-management-page)
10. [Company Applicants Management Page](#10-company-applicants-management-page)

---

## 1. Admin Reports Page

### Page Information
- **Route:** `/dashboard/admin/reports`
- **Access Control:** Admin role only
- **Parent Component:** AdminDashboard
- **Navigation:** Header "Export Report" button

### Purpose
Generate, view, and download various administrative reports including user statistics, revenue analytics, job performance, and moderation metrics.

### API Endpoints

#### GET /api/admin/reports/types
**Description:** Get available report types
```json
Response:
{
  "success": true,
  "data": [
    {
      "id": "user_statistics",
      "name": "User Statistics",
      "description": "User registration, activity, and engagement metrics",
      "icon": "users"
    },
    {
      "id": "revenue_report",
      "name": "Revenue Report",
      "description": "Platform revenue and payment analytics",
      "icon": "dollar-sign"
    },
    {
      "id": "job_analytics",
      "name": "Job Analytics",
      "description": "Job posting performance and application metrics",
      "icon": "briefcase"
    },
    {
      "id": "moderation_report",
      "name": "Moderation Report",
      "description": "Content moderation and flagged items",
      "icon": "shield"
    }
  ]
}
```

#### POST /api/admin/reports/generate
**Description:** Generate a report based on parameters
```json
Request:
{
  "reportType": "user_statistics",
  "dateRange": {
    "startDate": "2026-01-01",
    "endDate": "2026-01-31"
  },
  "filters": {
    "userType": "all",
    "status": "active"
  }
}

Response:
{
  "success": true,
  "data": {
    "reportId": "rep_12345",
    "reportType": "user_statistics",
    "generatedAt": "2026-05-04T10:00:00Z",
    "summary": {
      "totalUsers": 1520,
      "newRegistrations": 120,
      "activeUsers": 980,
      "growthRate": "+8.5%"
    },
    "data": [
      // Detailed report data
    ]
  }
}
```

#### GET /api/admin/reports/:reportId/download
**Description:** Download report in specified format
**Query Parameters:**
- `format`: `pdf` | `csv` | `excel`
- `reportId`: Report ID

**Response:** File download (binary)

#### GET /api/admin/reports/history
**Description:** Get report generation history
```json
Response:
{
  "success": true,
  "data": [
    {
      "reportId": "rep_12345",
      "reportType": "user_statistics",
      "generatedAt": "2026-05-04T10:00:00Z",
      "generatedBy": "admin@maesta.com",
      "status": "completed"
    }
  ]
}
```

### Page Components

#### 1. Report Type Selector
- **Component:** `ReportTypeSelector`
- **Props:** `reportTypes` (array), `selectedType` (string), `onSelect` (function)
- **UI:** Grid of cards with icons for each report type
- **State:** `selectedReportType`

#### 2. Date Range Picker
- **Component:** `DateRangePicker`
- **Props:** `startDate`, `endDate`, `onChange`
- **UI:** Calendar with start and end date selection
- **State:** `dateRange`

#### 3. Filter Panel
- **Component:** `ReportFilters`
- **Props:** `reportType`, `filters`, `onFilterChange`
- **UI:** Dynamic filters based on report type
- **State:** `filters`

#### 4. Report Preview
- **Component:** `ReportPreview`
- **Props:** `reportData`, `reportType`
- **UI:** Table or chart visualization of report data
- **State:** `reportData`, `isLoading`

#### 5. Export Options
- **Component:** `ExportOptions`
- **Props:** `onExport`, `formats` (array)
- **UI:** Dropdown with format options and download button
- **State:** `exportFormat`

#### 6. Report History
- **Component:** `ReportHistory`
- **Props:** `history` (array), `onRegenerate`
- **UI:** Table of previously generated reports
- **State:** `reportHistory`

### Data Flow
1. User selects report type → `setSelectedReportType`
2. User selects date range → `setDateRange`
3. User applies filters → `setFilters`
4. User clicks "Generate Report" → `POST /api/admin/reports/generate`
5. Display loading state
6. Receive report data → `setReportData`
7. Render report preview
8. User selects export format → `setExportFormat`
9. User clicks "Download" → `GET /api/admin/reports/:reportId/download`

### State Management
```javascript
const [selectedReportType, setSelectedReportType] = useState(null);
const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
const [filters, setFilters] = useState({});
const [reportData, setReportData] = useState(null);
const [isGenerating, setIsGenerating] = useState(false);
const [exportFormat, setExportFormat] = useState('pdf');
const [reportHistory, setReportHistory] = useState([]);
```

### User Flow
1. Navigate to `/dashboard/admin/reports`
2. Select report type from available options
3. Choose date range
4. Apply optional filters
5. Click "Generate Report"
6. View report preview
7. Select export format
8. Click "Download"
9. View report history

### Error Handling
- Invalid date range: Show error message "End date must be after start date"
- No data available: Show "No data available for selected period"
- Generation failed: Show error message with retry option
- Download failed: Show error message with retry option

### Access Control
- **Role Required:** Admin
- **Authentication:** JWT token required
- **Authorization Check:** Verify user role is 'admin' before rendering page

---

## 2. Admin Pending Actions Detail Page

### Page Information
- **Route:** `/dashboard/admin/pending/:actionId`
- **Access Control:** Admin role only
- **Parent Component:** PendingActions widget
- **Navigation:** Click on pending action item

### Purpose
View and manage specific pending items such as pending user registrations, reported content, flagged job postings, or payment disputes.

### API Endpoints

#### GET /api/admin/pending/:actionId
**Description:** Get pending items for a specific action type
```json
Response:
{
  "success": true,
  "data": {
    "actionId": "pending_users",
    "actionName": "Pending User Approvals",
    "totalCount": 25,
    "items": [
      {
        "id": "user_123",
        "type": "user_registration",
        "title": "John Doe",
        "email": "john@example.com",
        "submittedAt": "2026-05-03T10:00:00Z",
        "status": "pending",
        "priority": "high",
        "details": {
          "registrationDate": "2026-05-03",
          "profileCompleteness": 85,
          "verificationStatus": "pending"
        }
      }
    ]
  }
}
```

#### POST /api/admin/pending/:actionId/bulk-approve
**Description:** Approve multiple pending items
```json
Request:
{
  "itemIds": ["user_123", "user_456"],
  "reason": "Batch approval"
}

Response:
{
  "success": true,
  "data": {
    "approvedCount": 2,
    "failedCount": 0
  }
}
```

#### POST /api/admin/pending/:actionId/bulk-reject
**Description:** Reject multiple pending items
```json
Request:
{
  "itemIds": ["user_789"],
  "reason": "Incomplete profile"
}

Response:
{
  "success": true,
  "data": {
    "rejectedCount": 1,
    "failedCount": 0
  }
}
```

### Page Components

#### 1. Action Header
- **Component:** `ActionHeader`
- **Props:** `actionName`, `totalCount`, `onBack`
- **UI:** Title, count badge, back button
- **State:** None

#### 2. Items Table
- **Component:** `PendingItemsTable`
- **Props:** `items`, `onSelect`, `onViewDetails`, `onApprove`, `onReject`
- **UI:** Data table with checkboxes, item details, action buttons
- **State:** `selectedItems`

#### 3. Item Details Modal
- **Component:** `ItemDetailsModal`
- **Props:** `item`, `isOpen`, `onClose`, `onApprove`, `onReject`
- **UI:** Modal with full item details and action buttons
- **State:** `selectedItem`, `isModalOpen`

#### 4. Filter Panel
- **Component:** `PendingItemsFilter`
- **Props:** `filters`, `onFilterChange`
- **UI:** Filters for status, priority, date range
- **State:** `filters`

#### 5. Bulk Actions Bar
- **Component:** `BulkActionsBar`
- **Props:** `selectedCount`, `onBulkApprove`, `onBulkReject`
- **UI:** Bar showing selected count with approve/reject buttons
- **State:** `selectedItems`

#### 6. Pagination
- **Component:** `Pagination`
- **Props:** `currentPage`, `totalPages`, `onPageChange`
- **UI:** Standard pagination controls
- **State:** `currentPage`

### Data Flow
1. Load page → `GET /api/admin/pending/:actionId`
2. Display loading state
3. Receive items → `setItems`
4. Render items table
5. User selects items → `setSelectedItems`
6. User applies filters → `setFilters` → `GET /api/admin/pending/:actionId?filters=...`
7. User clicks approve → `POST /api/admin/pending/:actionId/bulk-approve`
8. Refresh items list
9. User clicks item → Open details modal
10. User approves/reject from modal → Update item status

### State Management
```javascript
const [items, setItems] = useState([]);
const [selectedItems, setSelectedItems] = useState([]);
const [filters, setFilters] = useState({ status: 'all', priority: 'all' });
const [currentPage, setCurrentPage] = useState(1);
const [isLoading, setIsLoading] = useState(false);
const [selectedItem, setSelectedItem] = useState(null);
const [isModalOpen, setIsModalOpen] = useState(false);
```

### User Flow
1. Navigate to `/dashboard/admin/pending/pending_users`
2. View list of pending user registrations
3. Apply filters (status, priority, date)
4. Select items using checkboxes
5. Click "Approve" or "Reject" for bulk actions
6. Or click on individual item to view details
7. Approve/reject individual item from modal
8. Refresh list to see updated status

### Error Handling
- Failed to load items: Show error message with retry
- Bulk action failed: Show which items failed and why
- Network error: Show error message with retry option

### Access Control
- **Role Required:** Admin
- **Authentication:** JWT token required
- **Authorization Check:** Verify user role is 'admin' before rendering page

---

## 3. Admin Resolve Action Page

### Page Information
- **Route:** `/dashboard/admin/resolve/:actionId`
- **Access Control:** Admin role only
- **Parent Component:** PendingActions widget
- **Navigation:** Click resolve button on pending action item

### Purpose
Quick resolution interface for specific pending items with reason input and confirmation.

### API Endpoints

#### GET /api/admin/pending/:actionId/item/:itemId
**Description:** Get details of a specific pending item
```json
Response:
{
  "success": true,
  "data": {
    "id": "user_123",
    "type": "user_registration",
    "title": "John Doe",
    "email": "john@example.com",
    "submittedAt": "2026-05-03T10:00:00Z",
    "status": "pending",
    "priority": "high",
    "details": {
      "registrationDate": "2026-05-03",
      "profileCompleteness": 85,
      "verificationStatus": "pending",
      "profileData": {
        "firstName": "John",
        "lastName": "Doe",
        "phone": "+1234567890",
        "location": "New York, USA"
      }
    }
  }
}
```

#### POST /api/admin/pending/:actionId/item/:itemId/resolve
**Description:** Resolve a pending item
```json
Request:
{
  "action": "approve",
  "reason": "Profile verified successfully",
  "notes": "All documents are valid"
}

Response:
{
  "success": true,
  "data": {
    "itemId": "user_123",
    "status": "approved",
    "resolvedAt": "2026-05-04T10:00:00Z",
    "resolvedBy": "admin@maesta.com"
  }
}
```

### Page Components

#### 1. Item Details Card
- **Component:** `ItemDetailsCard`
- **Props:** `item`
- **UI:** Card displaying all item details
- **State:** None

#### 2. Resolution Form
- **Component:** `ResolutionForm`
- **Props:** `onSubmit`, `isLoading`
- **UI:** Form with action selection (approve/reject), reason input, notes textarea
- **State:** `resolutionAction`, `reason`, `notes`

#### 3. Confirmation Dialog
- **Component:** `ConfirmationDialog`
- **Props:** `isOpen`, `onConfirm`, `onCancel`, `message`
- **UI:** Modal with confirmation message
- **State:** `isConfirmOpen`

#### 4. Success Message
- **Component:** `SuccessMessage`
- **Props:** `message`, `onDismiss`
- **UI:** Success banner with dismiss button
- **State:** `showSuccess`

### Data Flow
1. Load page → `GET /api/admin/pending/:actionId/item/:itemId`
2. Display loading state
3. Receive item details → `setItem`
4. Render item details card
5. User selects action (approve/reject) → `setResolutionAction`
6. User enters reason → `setReason`
7. User enters notes → `setNotes`
8. User clicks "Submit" → Show confirmation dialog
9. User confirms → `POST /api/admin/pending/:actionId/item/:itemId/resolve`
10. Display loading state
11. Receive success response → Show success message
12. Redirect back to pending actions list after 2 seconds

### State Management
```javascript
const [item, setItem] = useState(null);
const [resolutionAction, setResolutionAction] = useState('approve');
const [reason, setReason] = useState('');
const [notes, setNotes] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [isConfirmOpen, setIsConfirmOpen] = useState(false);
const [showSuccess, setShowSuccess] = useState(false);
```

### User Flow
1. Navigate to `/dashboard/admin/resolve/pending_users/item/user_123`
2. View item details (user profile, registration info)
3. Select action: Approve or Reject
4. Enter reason for decision
5. Add optional notes
6. Click "Submit Resolution"
7. Confirm action in dialog
8. See success message
9. Auto-redirect to pending actions list

### Error Handling
- Failed to load item: Show error message with back button
- Missing required fields: Show validation error
- Resolution failed: Show error message with retry
- Network error: Show error message with retry option

### Access Control
- **Role Required:** Admin
- **Authentication:** JWT token required
- **Authorization Check:** Verify user role is 'admin' before rendering page

---

## 4. Admin Activities Page

### Page Information
- **Route:** `/dashboard/admin/activities`
- **Access Control:** Admin role only
- **Parent Component:** RecentActivity widget
- **Navigation:** "View All" button

### Purpose
View complete history of system activities with advanced filtering, search, and export capabilities.

### API Endpoints

#### GET /api/admin/activities
**Description:** Get activity log with pagination and filters
**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `type`: Activity type filter (optional)
- `userId`: User ID filter (optional)
- `startDate`: Start date filter (optional)
- `endDate`: End date filter (optional)
- `search`: Search query (optional)

```json
Response:
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "act_123",
        "type": "user_signup",
        "user": "John Doe",
        "userId": "user_123",
        "action": "registered a new account",
        "timestamp": "2026-05-04T10:00:00Z",
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "details": {
          "registrationMethod": "email",
          "location": "New York, USA"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 50,
      "totalItems": 1000,
      "itemsPerPage": 20
    }
  }
}
```

#### GET /api/admin/activities/types
**Description:** Get available activity types for filtering
```json
Response:
{
  "success": true,
  "data": [
    { "id": "user_signup", "name": "User Sign Up" },
    { "id": "job_post", "name": "Job Posted" },
    { "id": "job_application", "name": "Job Application" },
    { "id": "payment", "name": "Payment" },
    { "id": "report", "name": "Content Report" }
  ]
}
```

#### GET /api/admin/activities/export
**Description:** Export activity log
**Query Parameters:**
- `format`: `csv` | `excel`
- `filters`: JSON string of filters

**Response:** File download (binary)

### Page Components

#### 1. Activity Log Table
- **Component:** `ActivityLogTable`
- **Props:** `activities`, `onViewDetails`
- **UI:** Data table with activity columns
- **State:** None

#### 2. Filter Panel
- **Component:** `ActivityFilters`
- **Props:** `filters`, `activityTypes`, `onFilterChange`
- **UI:** Filters for type, user, date range, search
- **State:** `filters`

#### 3. Activity Details Modal
- **Component:** `ActivityDetailsModal`
- **Props:** `activity`, `isOpen`, `onClose`
- **UI:** Modal with full activity details
- **State:** `selectedActivity`, `isModalOpen`

#### 4. Export Button
- **Component:** `ExportButton`
- **Props:** `onExport`, `formats`
- **UI:** Button with format dropdown
- **State:** `exportFormat`

#### 5. Pagination
- **Component:** `Pagination`
- **Props:** `pagination`, `onPageChange`
- **UI:** Standard pagination controls
- **State:** `currentPage`

#### 6. Search Bar
- **Component:** `SearchBar`
- **Props:** `onSearch`, `placeholder`
- **UI:** Search input with icon
- **State:** `searchQuery`

### Data Flow
1. Load page → `GET /api/admin/activities`
2. Display loading state
3. Receive activities → `setActivities`
4. Render activity log table
5. User applies filters → `setFilters` → `GET /api/admin/activities?filters=...`
6. User searches → `setSearchQuery` → `GET /api/admin/activities?search=...`
7. User changes page → `setCurrentPage` → `GET /api/admin/activities?page=...`
8. User clicks activity → Open details modal
9. User clicks export → `GET /api/admin/activities/export`

### State Management
```javascript
const [activities, setActivities] = useState([]);
const [filters, setFilters] = useState({ type: 'all', userId: '', startDate: '', endDate: '' });
const [searchQuery, setSearchQuery] = useState('');
const [currentPage, setCurrentPage] = useState(1);
const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
const [isLoading, setIsLoading] = useState(false);
const [selectedActivity, setSelectedActivity] = useState(null);
const [isModalOpen, setIsModalOpen] = useState(false);
const [activityTypes, setActivityTypes] = useState([]);
```

### User Flow
1. Navigate to `/dashboard/admin/activities`
2. View activity log table
3. Apply filters (type, user, date range)
4. Search for specific activities
5. Navigate through pages
6. Click on activity to view details
7. Export activity log

### Error Handling
- Failed to load activities: Show error message with retry
- No activities found: Show "No activities found" message
- Export failed: Show error message with retry

### Access Control
- **Role Required:** Admin
- **Authentication:** JWT token required
- **Authorization Check:** Verify user role is 'admin' before rendering page

---

## 5. Interview Scheduling Page

### Page Information
- **Route:** `/dashboard/interviews/schedule?applicantId=:id`
- **Access Control:** Company role only
- **Parent Component:** CompanyDashboard
- **Navigation:** Schedule Interview button

### Purpose
Schedule interviews with job applicants including date/time selection, interview type, location, and notification.

### API Endpoints

#### GET /api/applicants/:applicantId
**Description:** Get applicant details
```json
Response:
{
  "success": true,
  "data": {
    "id": "applicant_123",
    "userId": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "profilePicture": "https://...",
    "appliedJobs": [
      {
        "jobId": "job_456",
        "jobTitle": "Senior Developer",
        "appliedAt": "2026-05-01T10:00:00Z",
        "status": "shortlisted"
      }
    ],
    "interviewHistory": []
  }
}
```

#### GET /api/jobs/:jobId
**Description:** Get job details for the applicant's application
```json
Response:
{
  "success": true,
  "data": {
    "id": "job_456",
    "title": "Senior Developer",
    "company": "Tech Corp",
    "location": "Remote",
    "interviewDuration": 60
  }
}
```

#### GET /api/interviews/available-slots
**Description:** Get available interview time slots
**Query Parameters:**
- `date`: Date to check
- `duration`: Interview duration in minutes

```json
Response:
{
  "success": true,
  "data": {
    "date": "2026-05-10",
    "slots": [
      { "time": "09:00", "available": true },
      { "time": "10:00", "available": true },
      { "time": "11:00", "available": false }
    ]
  }
}
```

#### POST /api/interviews/schedule
**Description:** Schedule an interview
```json
Request:
{
  "applicantId": "applicant_123",
  "jobId": "job_456",
  "scheduledDate": "2026-05-10",
  "scheduledTime": "10:00",
  "interviewType": "video",
  "duration": 60,
  "location": "https://zoom.us/j/123456789",
  "notes": "Technical interview"
}

Response:
{
  "success": true,
  "data": {
    "interviewId": "interview_789",
    "applicantId": "applicant_123",
    "jobId": "job_456",
    "scheduledDate": "2026-05-10",
    "scheduledTime": "10:00",
    "status": "scheduled",
    "createdAt": "2026-05-04T10:00:00Z"
  }
}
```

### Page Components

#### 1. Applicant Profile Card
- **Component:** `ApplicantProfileCard`
- **Props:** `applicant`
- **UI:** Card with applicant photo, name, contact info, applied jobs
- **State:** None

#### 2. Job Selection
- **Component:** `JobSelection`
- **Props:** `jobs`, `selectedJob`, `onSelect`
- **UI:** Dropdown or radio buttons to select job
- **State:** `selectedJob`

#### 3. Calendar Picker
- **Component:** `CalendarPicker`
- **Props:** `selectedDate`, `onDateChange`, `availableDates`
- **UI:** Calendar with available dates highlighted
- **State:** `selectedDate`

#### 4. Time Slot Selection
- **Component:** `TimeSlotSelection`
- **Props:** `slots`, `selectedTime`, `onSelect`
- **UI:** Grid of time slots with availability indicators
- **State:** `selectedTime`

#### 5. Interview Type Selection
- **Component:** `InterviewTypeSelector`
- **Props:** `types`, `selectedType`, `onSelect`
- **UI:** Radio buttons or cards for interview types (phone, video, in-person)
- **State:** `interviewType`

#### 6. Location/Link Input
- **Component:** `LocationInput`
- **Props:** `interviewType`, `value`, `onChange`
- **UI:** Conditional input based on interview type
- **State:** `location`

#### 7. Notes Input
- **Component:** `NotesInput`
- **Props:** `value`, `onChange`
- **UI:** Textarea for interview notes
- **State:** `notes`

#### 8. Confirmation Dialog
- **Component:** `InterviewConfirmationDialog`
- **Props:** `interviewDetails`, `onConfirm`, `onCancel`
- **UI:** Modal with interview summary and confirm/cancel buttons
- **State:** `isConfirmOpen`

#### 9. Success Message
- **Component:** `SuccessMessage`
- **Props:** `message`, `onDismiss`
- **UI:** Success banner with dismiss button
- **State:** `showSuccess`

### Data Flow
1. Load page → `GET /api/applicants/:applicantId`
2. Display loading state
3. Receive applicant data → `setApplicant`
4. Get applicant's applied jobs → `setJobs`
5. User selects job → `setSelectedJob`
6. User selects date → `setSelectedDate` → `GET /api/interviews/available-slots?date=...`
7. Receive available slots → `setSlots`
8. User selects time slot → `setSelectedTime`
9. User selects interview type → `setInterviewType`
10. User enters location/link → `setLocation`
11. User enters notes → `setNotes`
12. User clicks "Schedule Interview" → Show confirmation dialog
13. User confirms → `POST /api/interviews/schedule`
14. Display loading state
15. Receive success response → Show success message
16. Redirect to company dashboard after 2 seconds

### State Management
```javascript
const [applicant, setApplicant] = useState(null);
const [jobs, setJobs] = useState([]);
const [selectedJob, setSelectedJob] = useState(null);
const [selectedDate, setSelectedDate] = useState(null);
const [slots, setSlots] = useState([]);
const [selectedTime, setSelectedTime] = useState(null);
const [interviewType, setInterviewType] = useState('video');
const [location, setLocation] = useState('');
const [notes, setNotes] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [isConfirmOpen, setIsConfirmOpen] = useState(false);
const [showSuccess, setShowSuccess] = useState(false);
```

### User Flow
1. Navigate to `/dashboard/interviews/schedule?applicantId=applicant_123`
2. View applicant profile and applied jobs
3. Select job to schedule interview for
4. Select date from calendar
5. View available time slots
6. Select time slot
7. Select interview type (phone, video, in-person)
8. Enter location or meeting link
9. Add optional notes
10. Click "Schedule Interview"
11. Review details in confirmation dialog
12. Confirm scheduling
13. See success message
14. Auto-redirect to company dashboard

### Error Handling
- Failed to load applicant: Show error message with back button
- No available slots: Show "No available slots for selected date"
- Missing required fields: Show validation error
- Scheduling failed: Show error message with retry
- Network error: Show error message with retry option

### Access Control
- **Role Required:** Company
- **Authentication:** JWT token required
- **Authorization Check:** Verify user role is 'company' and applicant belongs to company's job postings

---

## 6. Company Export Page

### Page Information
- **Route:** `/dashboard/export?type=:type`
- **Access Control:** Company role only
- **Parent Component:** CompanyDashboard
- **Navigation:** Export buttons

### Purpose
Export company data including applicants, jobs, analytics, and applications in various formats.

### API Endpoints

#### GET /api/company/export/types
**Description:** Get available export types for company
```json
Response:
{
  "success": true,
  "data": [
    {
      "id": "applicants",
      "name": "Applicants",
      "description": "All applicants for company jobs"
    },
    {
      "id": "jobs",
      "name": "Jobs",
      "description": "All published job postings"
    },
    {
      "id": "analytics",
      "name": "Analytics",
      "description": "Job performance and application analytics"
    },
    {
      "id": "applications",
      "name": "Applications",
      "description": "All job applications received"
    }
  ]
}
```

#### POST /api/company/export/generate
**Description:** Generate export file
```json
Request:
{
  "exportType": "applicants",
  "dateRange": {
    "startDate": "2026-01-01",
    "endDate": "2026-01-31"
  },
  "filters": {
    "jobId": "job_456",
    "status": "shortlisted"
  },
  "format": "csv"
}

Response:
{
  "success": true,
  "data": {
    "exportId": "export_123",
    "exportType": "applicants",
    "format": "csv",
    "generatedAt": "2026-05-04T10:00:00Z",
    "recordCount": 150,
    "downloadUrl": "/api/company/export/download/export_123"
  }
}
```

#### GET /api/company/export/download/:exportId
**Description:** Download export file
**Response:** File download (binary)

#### GET /api/company/export/history
**Description:** Get export history
```json
Response:
{
  "success": true,
  "data": [
    {
      "exportId": "export_123",
      "exportType": "applicants",
      "format": "csv",
      "generatedAt": "2026-05-04T10:00:00Z",
      "recordCount": 150,
      "status": "completed"
    }
  ]
}
```

### Page Components

#### 1. Export Type Selector
- **Component:** `ExportTypeSelector`
- **Props:** `exportTypes`, `selectedType`, `onSelect`
- **UI:** Grid of cards for each export type
- **State:** `selectedExportType`

#### 2. Date Range Picker
- **Component:** `DateRangePicker`
- **Props:** `startDate`, `endDate`, `onChange`
- **UI:** Calendar with start and end date selection
- **State:** `dateRange`

#### 3. Filter Panel
- **Component:** `ExportFilters`
- **Props:** `exportType`, `filters`, `onFilterChange`
- **UI:** Dynamic filters based on export type
- **State:** `filters`

#### 4. Format Selector
- **Component:** `FormatSelector`
- **Props:** `formats`, `selectedFormat`, `onSelect`
- **UI:** Radio buttons or dropdown for format selection
- **State:** `exportFormat`

#### 5. Preview Table
- **Component:** `ExportPreview`
- **Props:** `previewData`, `exportType`
- **UI:** Table showing first 10 records of export
- **State:** `previewData`

#### 6. Export History
- **Component:** `ExportHistory`
- **Props:** `history`, `onDownload`
- **UI:** Table of previous exports
- **State:** `exportHistory`

### Data Flow
1. Load page → `GET /api/company/export/types`
2. Receive export types → `setExportTypes`
3. User selects export type → `setSelectedExportType`
4. User selects date range → `setDateRange`
5. User applies filters → `setFilters`
6. User selects format → `setExportFormat`
7. User clicks "Generate Export" → `POST /api/company/export/generate`
8. Display loading state
9. Receive export data → `setExportData`
10. Show preview
11. User clicks "Download" → `GET /api/company/export/download/:exportId`
12. View export history

### State Management
```javascript
const [exportTypes, setExportTypes] = useState([]);
const [selectedExportType, setSelectedExportType] = useState(null);
const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
const [filters, setFilters] = useState({});
const [exportFormat, setExportFormat] = useState('csv');
const [exportData, setExportData] = useState(null);
const [previewData, setPreviewData] = useState(null);
const [exportHistory, setExportHistory] = useState([]);
const [isLoading, setIsLoading] = useState(false);
```

### User Flow
1. Navigate to `/dashboard/export?type=applicants`
2. Select export type (or use type from URL)
3. Choose date range
4. Apply optional filters
5. Select export format (CSV, Excel, PDF)
6. Click "Generate Export"
7. View preview of data
8. Click "Download"
9. View export history

### Error Handling
- Invalid date range: Show error message
- No data available: Show "No data available for selected period"
- Generation failed: Show error message with retry
- Download failed: Show error message with retry

### Access Control
- **Role Required:** Company
- **Authentication:** JWT token required
- **Authorization Check:** Verify user role is 'company' before rendering page

---

## 7. Admin Users Management Page

### Page Information
- **Route:** `/dashboard/admin/users`
- **Access Control:** Admin role only
- **Parent Component:** AdminDashboard (recommended addition)
- **Navigation:** New menu item in Admin Dashboard

### Purpose
Manage all platform users including viewing profiles, managing account status, and assigning roles.

### API Endpoints

#### GET /api/admin/users
**Description:** Get users list with pagination and filters
**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `role`: Role filter (optional)
- `status`: Status filter (optional)
- `search`: Search query (optional)

```json
Response:
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_123",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "jobseeker",
        "status": "active",
        "createdAt": "2026-01-15T10:00:00Z",
        "lastLogin": "2026-05-04T09:00:00Z",
        "profileCompleteness": 85
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 50,
      "totalItems": 1000,
      "itemsPerPage": 20
    }
  }
}
```

#### GET /api/admin/users/:userId
**Description:** Get user details
```json
Response:
{
  "success": true,
  "data": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "jobseeker",
    "status": "active",
    "createdAt": "2026-01-15T10:00:00Z",
    "lastLogin": "2026-05-04T09:00:00Z",
    "profile": {
      "firstName": "John",
      "lastName": "Doe",
      "location": "New York, USA",
      "bio": "Software developer..."
    },
    "activityLog": []
  }
}
```

#### PUT /api/admin/users/:userId/status
**Description:** Update user account status
```json
Request:
{
  "status": "suspended",
  "reason": "Violation of terms"
}

Response:
{
  "success": true,
  "data": {
    "userId": "user_123",
    "status": "suspended",
    "updatedAt": "2026-05-04T10:00:00Z"
  }
}
```

#### PUT /api/admin/users/:userId/role
**Description:** Update user role
```json
Request:
{
  "role": "admin"
}

Response:
{
  "success": true,
  "data": {
    "userId": "user_123",
    "role": "admin",
    "updatedAt": "2026-05-04T10:00:00Z"
  }
}
```

### Page Components

#### 1. Users Table
- **Component:** `UsersTable`
- **Props:** `users`, `onViewDetails`, `onUpdateStatus`, `onUpdateRole`
- **UI:** Data table with user columns
- **State:** None

#### 2. Filter Panel
- **Component:** `UsersFilter`
- **Props:** `filters`, `onFilterChange`
- **UI:** Filters for role, status, search
- **State:** `filters`

#### 3. User Details Modal
- **Component:** `UserDetailsModal`
- **Props:** `user`, `isOpen`, `onClose`, `onUpdateStatus`, `onUpdateRole`
- **UI:** Modal with full user details and action buttons
- **State:** `selectedUser`, `isModalOpen`

#### 4. Status Update Dialog
- **Component:** `StatusUpdateDialog`
- **Props:** `user`, `isOpen`, `onConfirm`, `onCancel`
- **UI:** Modal with status selection and reason input
- **State:** `isStatusDialogOpen`

#### 5. Pagination
- **Component:** `Pagination`
- **Props:** `pagination`, `onPageChange`
- **UI:** Standard pagination controls
- **State:** `currentPage`

### Data Flow
1. Load page → `GET /api/admin/users`
2. Display loading state
3. Receive users → `setUsers`
4. Render users table
5. User applies filters → `setFilters` → `GET /api/admin/users?filters=...`
6. User searches → `setSearchQuery` → `GET /api/admin/users?search=...`
7. User changes page → `setCurrentPage` → `GET /api/admin/users?page=...`
8. User clicks user → Open details modal
9. User updates status → `PUT /api/admin/users/:userId/status`
10. Refresh users list

### State Management
```javascript
const [users, setUsers] = useState([]);
const [filters, setFilters] = useState({ role: 'all', status: 'all' });
const [searchQuery, setSearchQuery] = useState('');
const [currentPage, setCurrentPage] = useState(1);
const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
const [isLoading, setIsLoading] = useState(false);
const [selectedUser, setSelectedUser] = useState(null);
const [isModalOpen, setIsModalOpen] = useState(false);
const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
```

### User Flow
1. Navigate to `/dashboard/admin/users`
2. View users table
3. Apply filters (role, status)
4. Search for specific users
5. Navigate through pages
6. Click on user to view details
7. Update user status (active, suspended, banned)
8. Update user role
9. View user activity log

### Error Handling
- Failed to load users: Show error message with retry
- No users found: Show "No users found" message
- Status update failed: Show error message with retry
- Role update failed: Show error message with retry

### Access Control
- **Role Required:** Admin
- **Authentication:** JWT token required
- **Authorization Check:** Verify user role is 'admin' before rendering page

---

## 8. Admin Jobs Moderation Page

### Page Information
- **Route:** `/dashboard/admin/jobs/moderation`
- **Access Control:** Admin role only
- **Parent Component:** AdminDashboard (recommended addition)
- **Navigation:** New menu item in Admin Dashboard

### Purpose
Moderate job postings including reviewing pending jobs, approving/rejecting, and managing flagged content.

### API Endpoints

#### GET /api/admin/jobs/moderation
**Description:** Get jobs pending moderation
**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `status`: Status filter (pending, approved, rejected, flagged)

```json
Response:
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "job_123",
        "title": "Senior Developer",
        "company": "Tech Corp",
        "postedBy": "user_456",
        "postedAt": "2026-05-03T10:00:00Z",
        "status": "pending",
        "flagReason": null,
        "description": "We are looking for...",
        "location": "Remote",
        "salary": "$80,000 - $120,000"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 200,
      "itemsPerPage": 20
    }
  }
}
```

#### GET /api/admin/jobs/moderation/:jobId
**Description:** Get job details for moderation
```json
Response:
{
  "success": true,
  "data": {
    "id": "job_123",
    "title": "Senior Developer",
    "company": "Tech Corp",
    "postedBy": "user_456",
    "postedAt": "2026-05-03T10:00:00Z",
    "status": "pending",
    "description": "Full job description...",
    "requirements": ["React", "Node.js", "5+ years experience"],
    "benefits": ["Health insurance", "Remote work"],
    "location": "Remote",
    "salary": "$80,000 - $120,000",
    "jobType": "full-time"
  }
}
```

#### POST /api/admin/jobs/moderation/:jobId/approve
**Description:** Approve a job posting
```json
Request:
{
  "notes": "Job approved - meets all guidelines"
}

Response:
{
  "success": true,
  "data": {
    "jobId": "job_123",
    "status": "approved",
    "approvedAt": "2026-05-04T10:00:00Z",
    "approvedBy": "admin@maesta.com"
  }
}
```

#### POST /api/admin/jobs/moderation/:jobId/reject
**Description:** Reject a job posting
```json
Request:
{
  "reason": "Inappropriate content",
  "notes": "Job description contains prohibited language"
}

Response:
{
  "success": true,
  "data": {
    "jobId": "job_123",
    "status": "rejected",
    "rejectedAt": "2026-05-04T10:00:00Z",
    "rejectedBy": "admin@maesta.com"
  }
}
```

#### PUT /api/admin/jobs/moderation/:jobId/edit
**Description:** Edit job content before approval
```json
Request:
{
  "title": "Updated Title",
  "description": "Updated description"
}

Response:
{
  "success": true,
  "data": {
    "jobId": "job_123",
    "updatedAt": "2026-05-04T10:00:00Z"
  }
}
```

### Page Components

#### 1. Jobs Table
- **Component:** `ModerationJobsTable`
- **Props:** `jobs`, `onViewDetails`, `onApprove`, `onReject`, `onEdit`
- **UI:** Data table with job columns
- **State:** None

#### 2. Filter Panel
- **Component:** `ModerationFilter`
- **Props:** `filters`, `onFilterChange`
- **UI:** Filters for status, date range
- **State:** `filters`

#### 3. Job Details Modal
- **Component:** `JobDetailsModal`
- **Props:** `job`, `isOpen`, `onClose`, `onApprove`, `onReject`, `onEdit`
- **UI:** Modal with full job details and action buttons
- **State:** `selectedJob`, `isModalOpen`

#### 4. Approve/Reject Dialog
- **Component:** `ModerationActionDialog`
- **Props:** `action`, `job`, `isOpen`, `onConfirm`, `onCancel`
- **UI:** Modal with reason/notes input
- **State:** `isActionDialogOpen`

#### 5. Edit Job Form
- **Component:** `EditJobForm`
- **Props:** `job`, `onSave`, `onCancel`
- **UI:** Form to edit job content
- **State:** `editedJob`

#### 6. Pagination
- **Component:** `Pagination`
- **Props:** `pagination`, `onPageChange`
- **UI:** Standard pagination controls
- **State:** `currentPage`

### Data Flow
1. Load page → `GET /api/admin/jobs/moderation`
2. Display loading state
3. Receive jobs → `setJobs`
4. Render jobs table
5. User applies filters → `setFilters` → `GET /api/admin/jobs/moderation?filters=...`
6. User changes page → `setCurrentPage` → `GET /api/admin/jobs/moderation?page=...`
7. User clicks job → Open details modal
8. User approves job → `POST /api/admin/jobs/moderation/:jobId/approve`
9. User rejects job → `POST /api/admin/jobs/moderation/:jobId/reject`
10. User edits job → `PUT /api/admin/jobs/moderation/:jobId/edit`
11. Refresh jobs list

### State Management
```javascript
const [jobs, setJobs] = useState([]);
const [filters, setFilters] = useState({ status: 'pending' });
const [currentPage, setCurrentPage] = useState(1);
const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
const [isLoading, setIsLoading] = useState(false);
const [selectedJob, setSelectedJob] = useState(null);
const [isModalOpen, setIsModalOpen] = useState(false);
const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
const [editedJob, setEditedJob] = useState(null);
```

### User Flow
1. Navigate to `/dashboard/admin/jobs/moderation`
2. View jobs pending moderation
3. Apply filters (status, date)
4. Navigate through pages
5. Click on job to view details
6. Approve job with optional notes
7. Reject job with reason
8. Edit job content before approval
9. View flagged jobs

### Error Handling
- Failed to load jobs: Show error message with retry
- No jobs found: Show "No jobs pending moderation" message
- Approval failed: Show error message with retry
- Rejection failed: Show error message with retry
- Edit failed: Show error message with retry

### Access Control
- **Role Required:** Admin
- **Authentication:** JWT token required
- **Authorization Check:** Verify user role is 'admin' before rendering page

---

## 9. Company Interviews Management Page

### Page Information
- **Route:** `/dashboard/interviews`
- **Access Control:** Company role only
- **Parent Component:** CompanyDashboard (recommended addition)
- **Navigation:** New menu item in Company Dashboard

### Purpose
View and manage all scheduled interviews including calendar view, status tracking, and rescheduling.

### API Endpoints

#### GET /api/company/interviews
**Description:** Get company's scheduled interviews
**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `status`: Status filter (scheduled, completed, cancelled)
- `startDate`: Start date filter (optional)
- `endDate`: End date filter (optional)

```json
Response:
{
  "success": true,
  "data": {
    "interviews": [
      {
        "id": "interview_123",
        "applicantId": "applicant_456",
        "applicantName": "John Doe",
        "jobId": "job_789",
        "jobTitle": "Senior Developer",
        "scheduledDate": "2026-05-10",
        "scheduledTime": "10:00",
        "interviewType": "video",
        "location": "https://zoom.us/j/123456789",
        "status": "scheduled",
        "notes": "Technical interview",
        "createdAt": "2026-05-04T10:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100,
      "itemsPerPage": 20
    }
  }
}
```

#### GET /api/company/interviews/:interviewId
**Description:** Get interview details
```json
Response:
{
  "success": true,
  "data": {
    "id": "interview_123",
    "applicantId": "applicant_456",
    "applicant": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "profilePicture": "https://..."
    },
    "jobId": "job_789",
    "jobTitle": "Senior Developer",
    "scheduledDate": "2026-05-10",
    "scheduledTime": "10:00",
    "interviewType": "video",
    "location": "https://zoom.us/j/123456789",
    "status": "scheduled",
    "notes": "Technical interview",
    "history": []
  }
}
```

#### PUT /api/company/interviews/:interviewId/reschedule
**Description:** Reschedule an interview
```json
Request:
{
  "scheduledDate": "2026-05-15",
  "scheduledTime": "14:00",
  "reason": "Applicant requested reschedule"
}

Response:
{
  "success": true,
  "data": {
    "interviewId": "interview_123",
    "scheduledDate": "2026-05-15",
    "scheduledTime": "14:00",
    "status": "rescheduled",
    "updatedAt": "2026-05-04T10:00:00Z"
  }
}
```

#### PUT /api/company/interviews/:interviewId/cancel
**Description:** Cancel an interview
```json
Request:
{
  "reason": "Position filled"
}

Response:
{
  "success": true,
  "data": {
    "interviewId": "interview_123",
    "status": "cancelled",
    "cancelledAt": "2026-05-04T10:00:00Z",
    "reason": "Position filled"
  }
}
```

#### PUT /api/company/interviews/:interviewId/complete
**Description:** Mark interview as completed
```json
Request:
{
  "outcome": "passed",
  "notes": "Strong technical skills"
}

Response:
{
  "success": true,
  "data": {
    "interviewId": "interview_123",
    "status": "completed",
    "outcome": "passed",
    "completedAt": "2026-05-04T10:00:00Z"
  }
}
```

### Page Components

#### 1. Calendar View
- **Component:** `InterviewCalendar`
- **Props:** `interviews`, `onDateSelect`, `onInterviewClick`
- **UI:** Calendar with interview indicators
- **State:** `selectedDate`

#### 2. Interviews List
- **Component:** `InterviewsList`
- **Props:** `interviews`, `onViewDetails`, `onReschedule`, `onCancel`, `onComplete`
- **UI:** List or table of interviews
- **State:** None

#### 3. Interview Details Modal
- **Component:** `InterviewDetailsModal`
- **Props:** `interview`, `isOpen`, `onClose`, `onReschedule`, `onCancel`, `onComplete`
- **UI:** Modal with full interview details and action buttons
- **State:** `selectedInterview`, `isModalOpen`

#### 4. Reschedule Dialog
- **Component:** `RescheduleDialog`
- **Props:** `interview`, `isOpen`, `onConfirm`, `onCancel`
- **UI:** Modal with date/time picker and reason input
- **State:** `isRescheduleOpen`

#### 5. Cancel Dialog
- **Component:** `CancelDialog`
- **Props:** `interview`, `isOpen`, `onConfirm`, `onCancel`
- **UI:** Modal with reason input
- **State:** `isCancelOpen`

#### 6. Filter Panel
- **Component:** `InterviewFilter`
- **Props:** `filters`, `onFilterChange`
- **UI:** Filters for status, date range
- **State:** `filters`

### Data Flow
1. Load page → `GET /api/company/interviews`
2. Display loading state
3. Receive interviews → `setInterviews`
4. Render calendar and list
5. User applies filters → `setFilters` → `GET /api/company/interviews?filters=...`
6. User selects date on calendar → `setSelectedDate` → Filter interviews by date
7. User clicks interview → Open details modal
8. User reschedules interview → `PUT /api/company/interviews/:interviewId/reschedule`
9. User cancels interview → `PUT /api/company/interviews/:interviewId/cancel`
10. User marks as completed → `PUT /api/company/interviews/:interviewId/complete`
11. Refresh interviews list

### State Management
```javascript
const [interviews, setInterviews] = useState([]);
const [filters, setFilters] = useState({ status: 'all' });
const [selectedDate, setSelectedDate] = useState(null);
const [isLoading, setIsLoading] = useState(false);
const [selectedInterview, setSelectedInterview] = useState(null);
const [isModalOpen, setIsModalOpen] = useState(false);
const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
const [isCancelOpen, setIsCancelOpen] = useState(false);
```

### User Flow
1. Navigate to `/dashboard/interviews`
2. View calendar with interview indicators
3. View interviews list
4. Apply filters (status, date range)
5. Click on date to see interviews for that day
6. Click on interview to view details
7. Reschedule interview with new date/time
8. Cancel interview with reason
9. Mark interview as completed with outcome
10. View interview history

### Error Handling
- Failed to load interviews: Show error message with retry
- No interviews found: Show "No scheduled interviews" message
- Reschedule failed: Show error message with retry
- Cancel failed: Show error message with retry
- Complete failed: Show error message with retry

### Access Control
- **Role Required:** Company
- **Authentication:** JWT token required
- **Authorization Check:** Verify user role is 'company' before rendering page

---

## 10. Company Applicants Management Page

### Page Information
- **Route:** `/dashboard/applicants`
- **Access Control:** Company role only
- **Parent Component:** CompanyDashboard (recommended addition)
- **Navigation:** New menu item in Company Dashboard

### Purpose
Comprehensive applicant management including viewing profiles, tracking application status, communication history, and evaluation.

### API Endpoints

#### GET /api/company/applicants
**Description:** Get company's applicants
**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `jobId`: Job ID filter (optional)
- `status`: Status filter (applied, shortlisted, interviewed, hired, rejected)
- `search`: Search query (optional)

```json
Response:
{
  "success": true,
  "data": {
    "applicants": [
      {
        "id": "applicant_123",
        "userId": "user_456",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "profilePicture": "https://...",
        "jobId": "job_789",
        "jobTitle": "Senior Developer",
        "appliedAt": "2026-05-01T10:00:00Z",
        "status": "shortlisted",
        "rating": 4,
        "notes": "Strong technical background"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 200,
      "itemsPerPage": 20
    }
  }
}
```

#### GET /api/company/applicants/:applicantId
**Description:** Get applicant details
```json
Response:
{
  "success": true,
  "data": {
    "id": "applicant_123",
    "userId": "user_456",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "profilePicture": "https://...",
    "location": "New York, USA",
    "bio": "Software developer with 5 years experience...",
    "skills": ["React", "Node.js", "Python"],
    "experience": [
      {
        "company": "Tech Corp",
        "position": "Developer",
        "years": "3"
      }
    ],
    "education": [
      {
        "degree": "BS Computer Science",
        "university": "MIT",
        "year": "2020"
      }
    ],
    "applications": [
      {
        "jobId": "job_789",
        "jobTitle": "Senior Developer",
        "appliedAt": "2026-05-01T10:00:00Z",
        "status": "shortlisted"
      }
    ],
    "rating": 4,
    "notes": "Strong technical background",
    "communicationHistory": []
  }
}
```

#### PUT /api/company/applicants/:applicantId/status
**Description:** Update applicant status
```json
Request:
{
  "status": "interviewed",
  "jobId": "job_789"
}

Response:
{
  "success": true,
  "data": {
    "applicantId": "applicant_123",
    "jobId": "job_789",
    "status": "interviewed",
    "updatedAt": "2026-05-04T10:00:00Z"
  }
}
```

#### PUT /api/company/applicants/:applicantId/rating
**Description:** Rate applicant
```json
Request:
{
  "rating": 5,
  "notes": "Excellent candidate"
}

Response:
{
  "success": true,
  "data": {
    "applicantId": "applicant_123",
    "rating": 5,
    "notes": "Excellent candidate",
    "updatedAt": "2026-05-04T10:00:00Z"
  }
}
```

#### PUT /api/company/applicants/:applicantId/notes
**Description:** Add notes to applicant
```json
Request:
{
  "notes": "Added after phone screening"
}

Response:
{
  "success": true,
  "data": {
    "applicantId": "applicant_123",
    "notes": "Added after phone screening",
    "updatedAt": "2026-05-04T10:00:00Z"
  }
}
```

### Page Components

#### 1. Applicants Table
- **Component:** `ApplicantsTable`
- **Props:** `applicants`, `onViewDetails`, `onUpdateStatus`, `onRate`
- **UI:** Data table with applicant columns
- **State:** None

#### 2. Filter Panel
- **Component:** `ApplicantsFilter`
- **Props:** `filters`, `jobs`, `onFilterChange`
- **UI:** Filters for job, status, search
- **State:** `filters`

#### 3. Applicant Details Modal
- **Component:** `ApplicantDetailsModal`
- **Props:** `applicant`, `isOpen`, `onClose`, `onUpdateStatus`, `onRate`, `onAddNotes`
- **UI:** Modal with full applicant profile and action buttons
- **State:** `selectedApplicant`, `isModalOpen`

#### 4. Status Update Dialog
- **Component:** `StatusUpdateDialog`
- **Props:** `applicant`, `isOpen`, `onConfirm`, `onCancel`
- **UI:** Modal with status selection
- **State:** `isStatusDialogOpen`

#### 5. Rating Component
- **Component:** `RatingStars`
- **Props:** `rating`, `onRate`
- **UI:** Star rating component
- **State:** `rating`

#### 6. Notes Input
- **Component:** `NotesInput`
- **Props:** `value`, `onChange`, `onSave`
- **UI:** Textarea with save button
- **State:** `notes`

#### 7. Pagination
- **Component:** `Pagination`
- **Props:** `pagination`, `onPageChange`
- **UI:** Standard pagination controls
- **State:** `currentPage`

### Data Flow
1. Load page → `GET /api/company/applicants`
2. Display loading state
3. Receive applicants → `setApplicants`
4. Render applicants table
5. User applies filters → `setFilters` → `GET /api/company/applicants?filters=...`
6. User searches → `setSearchQuery` → `GET /api/company/applicants?search=...`
7. User changes page → `setCurrentPage` → `GET /api/company/applicants?page=...`
8. User clicks applicant → Open details modal
9. User updates status → `PUT /api/company/applicants/:applicantId/status`
10. User rates applicant → `PUT /api/company/applicants/:applicantId/rating`
11. User adds notes → `PUT /api/company/applicants/:applicantId/notes`
12. Refresh applicants list

### State Management
```javascript
const [applicants, setApplicants] = useState([]);
const [filters, setFilters] = useState({ jobId: 'all', status: 'all' });
const [searchQuery, setSearchQuery] = useState('');
const [currentPage, setCurrentPage] = useState(1);
const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
const [isLoading, setIsLoading] = useState(false);
const [selectedApplicant, setSelectedApplicant] = useState(null);
const [isModalOpen, setIsModalOpen] = useState(false);
const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
const [rating, setRating] = useState(0);
const [notes, setNotes] = useState('');
```

### User Flow
1. Navigate to `/dashboard/applicants`
2. View applicants table
3. Apply filters (job, status)
4. Search for specific applicants
5. Navigate through pages
6. Click on applicant to view full profile
7. Update applicant status (applied, shortlisted, interviewed, hired, rejected)
8. Rate applicant (1-5 stars)
9. Add notes to applicant profile
10. View communication history

### Error Handling
- Failed to load applicants: Show error message with retry
- No applicants found: Show "No applicants found" message
- Status update failed: Show error message with retry
- Rating failed: Show error message with retry
- Notes failed: Show error message with retry

### Access Control
- **Role Required:** Company
- **Authentication:** JWT token required
- **Authorization Check:** Verify user role is 'company' before rendering page

---

## Summary

### Access Control Matrix

| Page | Admin | Company | Job Seeker |
|------|-------|---------|------------|
| Admin Reports | ✅ | ❌ | ❌ |
| Admin Pending Actions | ✅ | ❌ | ❌ |
| Admin Resolve Action | ✅ | ❌ | ❌ |
| Admin Activities | ✅ | ❌ | ❌ |
| Interview Scheduling | ❌ | ✅ | ❌ |
| Company Export | ❌ | ✅ | ❌ |
| Admin Users Management | ✅ | ❌ | ❌ |
| Admin Jobs Moderation | ✅ | ❌ | ❌ |
| Company Interviews Management | ❌ | ✅ | ❌ |
| Company Applicants Management | ❌ | ✅ | ❌ |

### API Endpoint Summary

**Admin Pages (7 endpoints):**
- GET /api/admin/reports/types
- POST /api/admin/reports/generate
- GET /api/admin/reports/:reportId/download
- GET /api/admin/reports/history
- GET /api/admin/pending/:actionId
- POST /api/admin/pending/:actionId/bulk-approve
- POST /api/admin/pending/:actionId/bulk-reject
- GET /api/admin/pending/:actionId/item/:itemId
- POST /api/admin/pending/:actionId/item/:itemId/resolve
- GET /api/admin/activities
- GET /api/admin/activities/types
- GET /api/admin/activities/export
- GET /api/admin/users
- GET /api/admin/users/:userId
- PUT /api/admin/users/:userId/status
- PUT /api/admin/users/:userId/role
- GET /api/admin/jobs/moderation
- GET /api/admin/jobs/moderation/:jobId
- POST /api/admin/jobs/moderation/:jobId/approve
- POST /api/admin/jobs/moderation/:jobId/reject
- PUT /api/admin/jobs/moderation/:jobId/edit

**Company Pages (9 endpoints):**
- GET /api/applicants/:applicantId
- GET /api/jobs/:jobId
- GET /api/interviews/available-slots
- POST /api/interviews/schedule
- GET /api/company/export/types
- POST /api/company/export/generate
- GET /api/company/export/download/:exportId
- GET /api/company/export/history
- GET /api/company/interviews
- GET /api/company/interviews/:interviewId
- PUT /api/company/interviews/:interviewId/reschedule
- PUT /api/company/interviews/:interviewId/cancel
- PUT /api/company/interviews/:interviewId/complete
- GET /api/company/applicants
- GET /api/company/applicants/:applicantId
- PUT /api/company/applicants/:applicantId/status
- PUT /api/company/applicants/:applicantId/rating
- PUT /api/company/applicants/:applicantId/notes

**Total API Endpoints Required:** 26

### Development Priority (Single Developer)

**Week 1-2:**
- Build reusable components (Data table, Date picker, Modal, Pagination)
- Admin Reports Page

**Week 3-4:**
- Admin Pending Actions Detail Page
- Admin Resolve Action Page

**Week 5:**
- Interview Scheduling Page

**Week 6:**
- Testing, refinement, and documentation

**Phase 2 (Future):**
- Admin Activities Page
- Company Export Page
- Admin Users Management Page
- Admin Jobs Moderation Page
- Company Interviews Management Page
- Company Applicants Management Page
