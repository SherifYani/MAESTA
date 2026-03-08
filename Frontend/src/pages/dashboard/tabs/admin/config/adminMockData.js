/**
 * @file adminMockData.js
 * @description Comprehensive mock data for Admin Dashboard development
 * @author Sherif Talaat
 * @date 2026-02-07
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-03-08
 * @changes:
 * - Expanded usersData to 40 entries for pagination testing
 * - Added mockUsers alias export
 */

// ============================================================================
// Overview Statistics
// ============================================================================

export const adminStats = {
    totalUsers: 15420,
    activeJobs: 842,
    pendingModeration: 15,
    totalRevenue: 145230,
    userGrowth: "+12.5%",
    revenueGrowth: "+8.2%",
    activeSessions: 432,
    avgResponseTime: "45ms",
    successRate: "99.9%"
};

// ============================================================================
// User Management Data (40 entries)
// ============================================================================

export const usersData = [
    { id: "USER-001", name: "John Doe", email: "john@example.com", role: "job_seeker", status: "active", joinDate: "2026-02-06", lastActive: "2 hours ago" },
    { id: "USER-002", name: "Sarah Smith", email: "sarah@techcorp.com", role: "company", status: "active", joinDate: "2024-02-01", lastActive: "1 day ago" },
    { id: "USER-003", name: "Mike Johnson", email: "mike@freelancer.com", role: "freelancer", status: "inactive", joinDate: "2023-11-20", lastActive: "3 weeks ago" },
    { id: "USER-004", name: "Alice Brown", email: "alice@startup.io", role: "client", status: "banned", joinDate: "2024-03-10", lastActive: "1 month ago" },
    { id: "USER-005", name: "Robert Wilson", email: "robert@admin.com", role: "admin", status: "active", joinDate: "2023-10-01", lastActive: "Just now" },
    { id: "USER-006", name: "Emma Davis", email: "emma@design.co", role: "company", status: "active", joinDate: "2024-03-15", lastActive: "5 hours ago" },
    { id: "USER-007", name: "James Wilson", email: "james@dev.io", role: "freelancer", status: "pending", joinDate: "2024-03-22", lastActive: "1 day ago" },
    { id: "USER-008", name: "Lisa Anderson", email: "lisa@tech.net", role: "job_seeker", status: "active", joinDate: "2024-03-18", lastActive: "3 days ago" },
    { id: "USER-009", name: "David Miller", email: "david@consult.com", role: "client", status: "inactive", joinDate: "2023-12-05", lastActive: "2 months ago" },
    { id: "USER-010", name: "Jennifer Taylor", email: "jen@creative.studio", role: "freelancer", status: "active", joinDate: "2024-01-25", lastActive: "30 mins ago" },
    { id: "USER-011", name: "Thomas Anderson", email: "neo@matrix.io", role: "job_seeker", status: "banned", joinDate: "2024-02-14", lastActive: "1 week ago" },
    { id: "USER-012", name: "Sophia Martinez", email: "sophia@global.org", role: "company", status: "active", joinDate: "2023-11-10", lastActive: "4 hours ago" },
    { id: "USER-013", name: "Daniel White", email: "dan@code.ninja", role: "freelancer", status: "active", joinDate: "2024-03-01", lastActive: "10 mins ago" },
    { id: "USER-014", name: "Olivia Thompson", email: "olivia@hire.me", role: "client", status: "active", joinDate: "2024-02-20", lastActive: "1 day ago" },
    { id: "USER-015", name: "William Clark", email: "bill@enterprises.net", role: "company", status: "pending", joinDate: "2024-03-25", lastActive: "Just now" },
    { id: "USER-016", name: "Chloe Walker", email: "chloe@uxlab.io", role: "freelancer", status: "active", joinDate: "2024-01-10", lastActive: "2 days ago" },
    { id: "USER-017", name: "Ethan Harris", email: "ethan@jobhunt.co", role: "job_seeker", status: "active", joinDate: "2024-02-28", lastActive: "6 hours ago" },
    { id: "USER-018", name: "Amelia Jackson", email: "amelia@bigbrand.com", role: "company", status: "inactive", joinDate: "2023-09-14", lastActive: "2 weeks ago" },
    { id: "USER-019", name: "Noah Garcia", email: "noah@gig.works", role: "freelancer", status: "active", joinDate: "2024-03-05", lastActive: "45 mins ago" },
    { id: "USER-020", name: "Isabella Lee", email: "isabella@client.net", role: "client", status: "active", joinDate: "2024-02-10", lastActive: "3 hours ago" },
    { id: "USER-021", name: "Mason Robinson", email: "mason@devshop.io", role: "freelancer", status: "banned", joinDate: "2023-08-22", lastActive: "1 month ago" },
    { id: "USER-022", name: "Ava Martinez", email: "ava@seekwork.com", role: "job_seeker", status: "active", joinDate: "2024-03-12", lastActive: "Yesterday" },
    { id: "USER-023", name: "Liam Young", email: "liam@corp.io", role: "company", status: "active", joinDate: "2024-01-30", lastActive: "8 hours ago" },
    { id: "USER-024", name: "Charlotte Hall", email: "charlotte@admin.io", role: "admin", status: "active", joinDate: "2023-07-01", lastActive: "1 hour ago" },
    { id: "USER-025", name: "Benjamin Allen", email: "ben@contractor.dev", role: "freelancer", status: "inactive", joinDate: "2023-12-20", lastActive: "3 weeks ago" },
    { id: "USER-026", name: "Harper Scott", email: "harper@talent.io", role: "job_seeker", status: "pending", joinDate: "2024-03-24", lastActive: "Just now" },
    { id: "USER-027", name: "Evelyn King", email: "evelyn@ventures.co", role: "client", status: "active", joinDate: "2024-02-05", lastActive: "4 days ago" },
    { id: "USER-028", name: "Alexander Wright", email: "alex@techfirm.com", role: "company", status: "banned", joinDate: "2023-10-15", lastActive: "6 months ago" },
    { id: "USER-029", name: "Abigail Lopez", email: "abigail@gigs.net", role: "freelancer", status: "active", joinDate: "2024-01-15", lastActive: "2 hours ago" },
    { id: "USER-030", name: "Henry Hill", email: "henry@findjob.io", role: "job_seeker", status: "inactive", joinDate: "2023-11-30", lastActive: "5 weeks ago" },
    { id: "USER-031", name: "Mia Green", email: "mia@staffing.org", role: "company", status: "active", joinDate: "2024-02-18", lastActive: "Just now" },
    { id: "USER-032", name: "Sebastian Adams", email: "seb@superadmin.io", role: "admin", status: "active", joinDate: "2023-06-01", lastActive: "15 mins ago" },
    { id: "USER-033", name: "Ella Baker", email: "ella@hire.studio", role: "client", status: "pending", joinDate: "2024-03-20", lastActive: "3 hours ago" },
    { id: "USER-034", name: "Jack Gonzalez", email: "jack@remotedev.io", role: "freelancer", status: "active", joinDate: "2024-01-08", lastActive: "20 mins ago" },
    { id: "USER-035", name: "Scarlett Nelson", email: "scarlett@applynow.com", role: "job_seeker", status: "active", joinDate: "2024-03-02", lastActive: "7 hours ago" },
    { id: "USER-036", name: "Lucas Carter", email: "lucas@startups.co", role: "company", status: "active", joinDate: "2024-02-22", lastActive: "2 days ago" },
    { id: "USER-037", name: "Grace Mitchell", email: "grace@portfolio.dev", role: "freelancer", status: "pending", joinDate: "2024-03-19", lastActive: "1 day ago" },
    { id: "USER-038", name: "Owen Perez", email: "owen@projectowner.com", role: "client", status: "inactive", joinDate: "2023-10-25", lastActive: "4 weeks ago" },
    { id: "USER-039", name: "Avery Roberts", email: "avery@seeker.net", role: "job_seeker", status: "banned", joinDate: "2024-01-20", lastActive: "2 weeks ago" },
    { id: "USER-040", name: "Zoe Turner", email: "zoe@gigmaster.io", role: "freelancer", status: "active", joinDate: "2024-03-10", lastActive: "50 mins ago" },
];

/**
 * Alias for usersData – use either name depending on context.
 * @type {Array}
 */
export const mockUsers = usersData;

// ============================================================================
// Job Management Data
// ============================================================================

export const jobsData = [
    { id: "JOB-101", title: "Senior React Developer", company: "Tech Corp", type: "Full-time", status: "active", postedDate: "2024-03-15", reports: 0 },
    { id: "JOB-102", title: "Freelance Graphic Designer", company: "Design Studio", type: "Contract", status: "pending", postedDate: "2024-03-20", reports: 0 },
    { id: "JOB-103", title: "Marketing Manager", company: "Global Sales", type: "Full-time", status: "expired", postedDate: "2024-01-10", reports: 2 },
    { id: "JOB-104", title: "DevOps Engineer", company: "Cloud Systems", type: "Full-time", status: "active", postedDate: "2024-03-21", reports: 0 },
    { id: "JOB-105", title: "Content Writer", company: "Media Buzz", type: "Part-time", status: "review", postedDate: "2024-03-19", reports: 1 },
    { id: "JOB-106", title: "Product Manager", company: "Innovate Inc", type: "Full-time", status: "active", postedDate: "2024-03-18", reports: 0 },
    { id: "JOB-107", title: "UX Researcher", company: "User First", type: "Contract", status: "expired", postedDate: "2023-12-15", reports: 0 },
    { id: "JOB-108", title: "Backend Developer (Go)", company: "Serverless Co", type: "Full-time", status: "active", postedDate: "2024-03-22", reports: 3 },
    { id: "JOB-109", title: "Sales Representative", company: "Growth Hackers", type: "Commission", status: "pending", postedDate: "2024-03-24", reports: 0 },
    { id: "JOB-110", title: "Data Scientist", company: "AI Solutions", type: "Full-time", status: "active", postedDate: "2024-03-10", reports: 0 },
    { id: "JOB-111", title: "Social Media Intern", company: "Viral Agency", type: "Internship", status: "review", postedDate: "2024-03-23", reports: 5 },
    { id: "JOB-112", title: "Customer Support Lead", company: "HelpDesk Pro", type: "Full-time", status: "active", postedDate: "2024-03-05", reports: 0 },
];

// ============================================================================
// Content Moderation Data
// ============================================================================

export const reportsData = [
    { id: "RPT-201", type: "Job Listing", targetId: "JOB-103", reason: "Misleading salary information", status: "pending", date: "2024-03-21", reporter: "user123" },
    { id: "RPT-202", type: "User Profile", targetId: "USER-004", reason: "Account appears to be a spam bot", status: "resolved", date: "2024-03-12", reporter: "admin_bot" },
    { id: "RPT-203", type: "Comment", targetId: "CMT-301", reason: "Inappropriate language/Harassment", status: "pending", date: "2024-03-22", reporter: "community_mod" },
    { id: "RPT-204", type: "Message", targetId: "MSG-405", reason: "Phishing attempt in DMs", status: "investigating", date: "2024-03-23", reporter: "victim_user" },
    { id: "RPT-205", type: "Job Listing", targetId: "JOB-111", reason: "Unpaid internship violation", status: "dismissed", date: "2024-03-24", reporter: "student_union" },
    { id: "RPT-206", type: "User Profile", targetId: "USER-011", reason: "Impersonation of admin", status: "resolved", date: "2024-02-14", reporter: "real_admin" },
    { id: "RPT-207", type: "Portfolio", targetId: "PRT-552", reason: "Copyright infringement", status: "pending", date: "2024-03-25", reporter: "artist_og" },
    { id: "RPT-208", type: "Job Listing", targetId: "JOB-108", reason: "Scam job posting", status: "investigating", date: "2024-03-22", reporter: "scam_watch" },
    { id: "RPT-209", type: "Comment", targetId: "CMT-342", reason: "Spam/Self-promotion", status: "resolved", date: "2024-03-20", reporter: "auto_mod" },
    { id: "RPT-210", type: "User Profile", targetId: "USER-009", reason: "Fake credentials", status: "dismissed", date: "2024-03-15", reporter: "recruiter_jane" },
];

// ============================================================================
// Recent Activity Data
// ============================================================================

export const activitiesData = [
    { id: 1, type: "user_signup", user: "James Wilson", action: "registered as Freelancer", time: "2 mins ago", timestamp: "2024-03-25T14:30:00Z" },
    { id: 2, type: "job_post", user: "Cloud Systems", action: "posted new job 'DevOps Engineer'", time: "15 mins ago", timestamp: "2024-03-25T14:15:00Z" },
    { id: 3, type: "report", user: "System Monitor", action: "flagged suspicious activity from IP 192.168.x.x", time: "1 hour ago", timestamp: "2024-03-25T13:30:00Z" },
    { id: 4, type: "payment", user: "Tech Corp", action: "processed payment of $4,500", time: "2 hours ago", timestamp: "2024-03-25T12:30:00Z" },
    { id: 5, type: "user_login", user: "Super Admin", action: "logged in from new device", time: "3 hours ago", timestamp: "2024-03-25T11:30:00Z" },
    { id: 6, type: "job_application", user: "John Doe", action: "applied for 'Senior React Developer'", time: "4 hours ago", timestamp: "2024-03-25T10:30:00Z" },
    { id: 7, type: "payment", user: "Design Studio", action: "upgraded to Professional Plan", time: "5 hours ago", timestamp: "2024-03-25T09:30:00Z" },
    { id: 8, type: "report", user: "Community Mod", action: "resolved report #RPT-202", time: "6 hours ago", timestamp: "2024-03-25T08:30:00Z" },
    { id: 9, type: "user_signup", user: "William Clark", action: "registered as Company", time: "8 hours ago", timestamp: "2024-03-25T06:30:00Z" },
    { id: 10, type: "job_post", user: "Growth Hackers", action: "posted new job 'Sales Representative'", time: "12 hours ago", timestamp: "2024-03-25T02:30:00Z" },
    { id: 11, type: "job_application", user: "Lisa Anderson", action: "applied for 'Content Writer'", time: "1 day ago", timestamp: "2024-03-24T14:30:00Z" },
    { id: 12, type: "user_login", user: "Sarah Smith", action: "updated company profile", time: "1 day ago", timestamp: "2024-03-24T10:00:00Z" },
];

// ============================================================================
// Pending Actions Data
// ============================================================================

export const pendingActions = [
    { id: 1, title: "Review new freelancer verifications", count: 5, priority: "high" },
    { id: 2, title: "Resolve reported content", count: 12, priority: "high" },
    { id: 3, title: "Approve pending job posts", count: 8, priority: "medium" },
    { id: 4, title: "System update scheduled", count: 1, priority: "low" },
    { id: 5, title: "Review specialized profile requests", count: 3, priority: "medium" },
    { id: 6, title: "Process refund requests", count: 2, priority: "high" },
];

// ============================================================================
// System Health Data
// ============================================================================

export const healthData = {
    uptime: "99.99%",
    api: { status: "operational", latency: "45ms" },
    database: { status: "operational", load: "24%" },
    storage: { status: "operational", usage: "45%" },
};

// ============================================================================
// Subscription Management Data
// ============================================================================

export const subscriptionsData = [
    { id: 'SUB-001', user: 'Tech Corp', plan: 'Enterprise', status: 'active', amount: 499, nextBilling: '2024-04-15', users: 25, startDate: '2023-01-15', paymentMethod: 'card', invoiceId: 'INV-2024-001' },
    { id: 'SUB-002', user: 'Design Studio', plan: 'Professional', status: 'active', amount: 99, nextBilling: '2024-04-20', users: 5, startDate: '2023-03-01', paymentMethod: 'card', invoiceId: 'INV-2024-002' },
    { id: 'SUB-003', user: 'John Doe', plan: 'Basic', status: 'cancelled', amount: 0, nextBilling: '-', users: 1, startDate: '2023-06-10', endDate: '2024-01-10', paymentMethod: 'paypal', invoiceId: 'INV-2024-003' },
    { id: 'SUB-004', user: 'Startup XYZ', plan: 'Growth', status: 'pending', amount: 199, nextBilling: '2024-04-25', users: 10, startDate: '2024-02-01', paymentMethod: 'card', invoiceId: 'INV-2024-004' },
    { id: 'SUB-005', user: 'Marketing Pro', plan: 'Professional', status: 'active', amount: 99, nextBilling: '2024-04-18', users: 3, startDate: '2023-11-20', paymentMethod: 'card', invoiceId: 'INV-2024-005' },
    { id: 'SUB-006', user: 'Global Sales', plan: 'Enterprise', status: 'active', amount: 499, nextBilling: '2024-04-01', users: 40, startDate: '2022-08-15', paymentMethod: 'bank_transfer', invoiceId: 'INV-2024-006' },
    { id: 'SUB-007', user: 'Indie Dev', plan: 'Basic', status: 'active', amount: 29, nextBilling: '2024-04-10', users: 1, startDate: '2024-01-10', paymentMethod: 'card', invoiceId: 'INV-2024-007' },
    { id: 'SUB-008', user: 'Consulting Group', plan: 'Growth', status: 'active', amount: 199, nextBilling: '2024-04-12', users: 8, startDate: '2023-09-05', paymentMethod: 'card', invoiceId: 'INV-2024-008' },
    { id: 'SUB-009', user: 'E-commerce Co', plan: 'Professional', status: 'cancelled', amount: 0, nextBilling: '-', users: 4, startDate: '2023-05-20', endDate: '2024-02-20', paymentMethod: 'paypal', invoiceId: 'INV-2024-009' },
    { id: 'SUB-010', user: 'Media Agency', plan: 'Enterprise', status: 'active', amount: 499, nextBilling: '2024-04-28', users: 15, startDate: '2023-10-01', paymentMethod: 'card', invoiceId: 'INV-2024-010' },
    { id: 'SUB-011', user: 'Freelancer Collective', plan: 'Growth', status: 'pending', amount: 199, nextBilling: '2024-04-30', users: 12, startDate: '2024-03-20', paymentMethod: 'card', invoiceId: 'INV-2024-011' },
    { id: 'SUB-012', user: 'NonProfit Org', plan: 'Basic', status: 'active', amount: 29, nextBilling: '2024-04-05', users: 2, startDate: '2023-07-15', paymentMethod: 'card', invoiceId: 'INV-2024-012' },
];

// ============================================================================
// Staff Management Data
// ============================================================================

export const staffData = [
    { id: 1, name: 'Robert Wilson', email: 'robert@admin.com', role: 'Super Admin', lastLogin: '2 hours ago', status: 'active', permissions: ['all'] },
    { id: 2, name: 'Sarah Connor', email: 'sarah@admin.com', role: 'Moderator', lastLogin: '1 day ago', status: 'active', permissions: ['read', 'moderate'] },
    { id: 3, name: 'Michael Chen', email: 'michael@admin.com', role: 'Analyst', lastLogin: '3 days ago', status: 'inactive', permissions: ['read', 'reports'] },
    { id: 4, name: 'Jessica Jones', email: 'jessica@admin.com', role: 'Moderator', lastLogin: '5 mins ago', status: 'active', permissions: ['read', 'moderate', 'users'] },
    { id: 5, name: 'David Smith', email: 'david@admin.com', role: 'Admin', lastLogin: '1 week ago', status: 'active', permissions: ['read', 'write', 'users', 'jobs'] },
    { id: 6, name: 'Emily Blunt', email: 'emily@admin.com', role: 'Analyst', lastLogin: '2 days ago', status: 'active', permissions: ['read', 'reports', 'analytics'] },
    { id: 7, name: 'Tom Hardy', email: 'tom@admin.com', role: 'Moderator', lastLogin: '4 hours ago', status: 'banned', permissions: [] },
    { id: 8, name: 'Natasha Romanoff', email: 'natasha@admin.com', role: 'Admin', lastLogin: 'just now', status: 'active', permissions: ['all'] },
    { id: 9, name: 'Bruce Banner', email: 'bruce@admin.com', role: 'Analyst', lastLogin: '1 month ago', status: 'inactive', permissions: ['read', 'analytics'] },
    { id: 10, name: 'Tony Stark', email: 'tony@admin.com', role: 'Super Admin', lastLogin: '10 mins ago', status: 'active', permissions: ['all'] },
];

// ============================================================================
// Statistics & Analytics Data
// ============================================================================

export const userGrowthData = [
    { name: 'Jan', users: 4200, newUsers: 1200 },
    { name: 'Feb', users: 5800, newUsers: 1600 },
    { name: 'Mar', users: 8500, newUsers: 2700 },
    { name: 'Apr', users: 11000, newUsers: 2500 },
    { name: 'May', users: 13800, newUsers: 2800 },
    { name: 'Jun', users: 16800, newUsers: 3000 },
    { name: 'Jul', users: 20500, newUsers: 3700 },
    { name: 'Aug', users: 24800, newUsers: 4300 },
    { name: 'Sep', users: 29100, newUsers: 4300 },
    { name: 'Oct', users: 32500, newUsers: 3400 },
    { name: 'Nov', users: 36200, newUsers: 3700 },
    { name: 'Dec', users: 40150, newUsers: 3950 },
];

export const revenueData = [
    { name: 'Jan', revenue: 18500, profit: 12000 },
    { name: 'Feb', revenue: 24700, profit: 19000 },
    { name: 'Mar', revenue: 32500, profit: 25000 },
    { name: 'Apr', revenue: 41800, profit: 32000 },
    { name: 'May', revenue: 48500, profit: 38000 },
    { name: 'Jun', revenue: 57200, profit: 45000 },
    { name: 'Jul', revenue: 65800, profit: 52000 },
    { name: 'Aug', revenue: 72400, profit: 58000 },
    { name: 'Sep', revenue: 81500, profit: 65000 },
    { name: 'Oct', revenue: 89200, profit: 71000 },
    { name: 'Nov', revenue: 98300, profit: 78000 },
    { name: 'Dec', revenue: 112500, profit: 90000 },
];

export const jobPostingsData = [
    { name: 'Jan', jobs: 850, active: 650 },
    { name: 'Feb', jobs: 1200, active: 950 },
    { name: 'Mar', jobs: 1850, active: 1500 },
    { name: 'Apr', jobs: 2200, active: 1800 },
    { name: 'May', jobs: 2750, active: 2300 },
    { name: 'Jun', jobs: 3450, active: 2900 },
    { name: 'Jul', jobs: 4100, active: 3500 },
    { name: 'Aug', jobs: 4750, active: 4100 },
    { name: 'Sep', jobs: 5200, active: 4500 },
    { name: 'Oct', jobs: 5800, active: 5000 },
    { name: 'Nov', jobs: 6350, active: 5500 },
    { name: 'Dec', jobs: 7200, active: 6300 },
];
