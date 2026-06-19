import {
  Briefcase, DollarSign, Building, Users, Clock, Send, Bookmark,
  TrendingUp, Activity, PieChart, Calendar, Target, Shield,
  ThumbsUp, UserPlus, Home, Settings, Bell, HelpCircle, LogOut,
  Award, BarChart, Mail, FolderOpen, FileText, CheckCircle,
  AlertCircle, Star, MessageSquare, Zap, ArrowUp, ArrowDown, Eye, XCircle
} from "lucide-react";

export const ROLES = {
  CLIENT: "client",
  FREELANCER: "freelancer",
  COMPANY: "company",
  JOBSEEKER: "jobseeker",
  ADMIN: "admin",
};

export const ROLE_METRICS = {
  [ROLES.CLIENT]: {
    title: "Client Dashboard",
    description: "Manage your projects and talent",
    metrics: [
      { id: "activeProjects", label: "Active Projects", value: "0", change: "+0", trend: "up", icon: Briefcase, color: "var(--color-accent-pink)", details: "", progress: 0, targetValue: "0" },
      { id: "totalSpent", label: "Total Spent", value: "$0", change: "+0%", trend: "up", icon: DollarSign, color: "var(--color-accent-green)", details: "This month", progress: 0, targetValue: "0" },
      { id: "activeContracts", label: "Active Contracts", value: "0", change: "+0", trend: "up", icon: FileText, color: "var(--color-accent-blue)", details: "", progress: 0, targetValue: "0" },
      { id: "avgRating", label: "Avg Rating", value: "0.0", change: "0", trend: "neutral", icon: Star, color: "var(--color-accent-yellow)", details: "", progress: 0, targetValue: "5.0" },
    ]
  },
  [ROLES.FREELANCER]: {
    title: "Freelancer Dashboard",
    description: "Manage your freelance career",
    metrics: [
      { id: "activeContracts", label: "Active Contracts", value: "0", change: "+0", trend: "up", icon: Briefcase, color: "var(--color-accent-blue)", details: "", progress: 0 },
      { id: "totalEarnings", label: "Total Earnings", value: "$0", change: "+0%", trend: "up", icon: DollarSign, color: "var(--color-accent-green)", details: "This month", progress: 0 },
      { id: "pendingPayments", label: "Pending Payments", value: "$0", change: "Pending", trend: "neutral", icon: Clock, color: "var(--color-accent-yellow)", details: "", progress: 0 },
      { id: "completionRate", label: "Completion Rate", value: "0%", change: "+0%", trend: "up", icon: CheckCircle, color: "var(--color-accent-purple)", details: "", progress: 0 },
    ]
  },
  [ROLES.COMPANY]: {
    title: "Company Dashboard",
    description: "Manage your company's hiring and recruitment",
    metrics: [
      { id: "activeJobs", label: "Active Jobs", value: "0", change: "+0", trend: "up", icon: Briefcase, color: "var(--color-accent-blue)", details: "", progress: 0, targetValue: "0" },
      { id: "totalApplicants", label: "Total Applicants", value: "0", change: "+0%", trend: "up", icon: Users, color: "var(--color-accent-green)", details: "This week", progress: 0, targetValue: "0" },
      { id: "interviews", label: "Interviews", value: "0", change: "+0", trend: "up", icon: Calendar, color: "var(--color-accent-purple)", details: "Scheduled", progress: 0, targetValue: "0" },
      { id: "hireRate", label: "Hire Rate", value: "0%", change: "+0%", trend: "up", icon: Target, color: "var(--color-accent-yellow)", details: "Conversion", progress: 0, targetValue: "0%" },
    ]
  },
  [ROLES.JOBSEEKER]: {
    title: "Job Seeker Dashboard",
    description: "Track your job applications and opportunities",
    metrics: [
      { id: "applications", label: "Applications", value: "0", change: "+0", trend: "up", icon: Send, color: "var(--color-accent-blue)", details: "Total sent" },
      { id: "savedJobs", label: "Saved Jobs", value: "0", change: "+0", trend: "up", icon: Bookmark, color: "var(--color-accent-purple)", details: "Bookmarked" },
      { id: "interviews", label: "Interviews", value: "0", change: "+0", trend: "up", icon: Calendar, color: "var(--color-accent-green)", details: "Upcoming" },
      { id: "profileViews", label: "Profile Views", value: "0", change: "+0%", trend: "up", icon: Eye, color: "var(--color-accent-yellow)", details: "This week" },
    ]
  },
  [ROLES.ADMIN]: {
    title: "Admin Dashboard",
    description: "Oversee platform operations and analytics",
    metrics: [
      { id: "totalUsers", label: "Total Users", value: "0", change: "+0%", trend: "up", icon: Users, color: "var(--color-accent-blue)", details: "Registered users" },
      { id: "totalRevenue", label: "Total Revenue", value: "$0", change: "+0%", trend: "up", icon: DollarSign, color: "var(--color-accent-green)", details: "Monthly revenue" },
      { id: "activeJobs", label: "Active Jobs", value: "0", change: "+0", trend: "up", icon: Briefcase, color: "var(--color-accent-purple)", details: "Currently active" },
      { id: "pendingModeration", label: "Pending Moderation", value: "0", change: "0", trend: "neutral", icon: Shield, color: "var(--color-accent-yellow)", details: "Items to review" },
    ]
  }
};

export const PRIORITY_CONFIG = {
  high: { label: "High Priority", color: "#ef4444", icon: ArrowUp },
  medium: { label: "Medium Priority", color: "#f59e0b", icon: ArrowDown },
  low: { label: "Low Priority", color: "#6b7280", icon: ArrowDown },
};

export const ACTIVITY_ICONS = {
  application_sent: Send, job_posted: Briefcase, interview_scheduled: Calendar,
  profile_view: Eye, saved_job: Bookmark, contract_started: FileText,
  payment_received: DollarSign, review_received: Star, user_signup: UserPlus,
  job_post: Briefcase, report: AlertCircle, payment: DollarSign,
  user_login: LogOut, job_application: Send, message: MessageSquare,
  project_completed: CheckCircle, proposal_received: Send,
};

export const STATUS_CONFIG = {
  pending: { label: "Pending", color: "#f59e0b", bg: "#fef3c7" },
  active: { label: "Active", color: "#10b981", bg: "#d1fae5" },
  completed: { label: "Completed", color: "#3b82f6", bg: "#dbeafe" },
  rejected: { label: "Rejected", color: "#ef4444", bg: "#fee2e2" },
  interview: { label: "Interview", color: "#8b5cf6", bg: "#ede9fe" },
  offer: { label: "Offer", color: "#10b981", bg: "#d1fae5" },
  review: { label: "Under Review", color: "#f59e0b", bg: "#fef3c7" },
  expired: { label: "Expired", color: "#6b7280", bg: "#f3f4f6" },
  cancelled: { label: "Cancelled", color: "#6b7280", bg: "#f3f4f6" },
  inactive: { label: "Inactive", color: "#6b7280", bg: "#f3f4f6" },
  banned: { label: "Banned", color: "#dc2626", bg: "#fee2e2" },
};

export const METRIC_COLORS = {
  primary: "var(--color-primary)", blue: "var(--color-accent-blue)",
  green: "var(--color-accent-green)", yellow: "var(--color-accent-yellow)",
  purple: "var(--color-accent-purple)", pink: "var(--color-accent-pink)",
  orange: "var(--color-accent-orange)", teal: "var(--color-accent-teal)",
};

export const ROLE_NAVIGATION = {
  [ROLES.CLIENT]: {
    displayName: "Client",
    icon: Building,
    navigation: [
      { label: "Dashboard", path: "/dashboard", icon: Home },
      { label: "My Gigs", path: "/gigs/manage", icon: Briefcase },
      { label: "My Projects", path: "/gigs/projects", icon: Briefcase },
      { label: "Post a Gig", path: "/gigs/new", icon: FileText },
      { label: "Talent Pool", path: "/dashboard/talent", icon: Users },
      { label: "Contracts", path: "/dashboard/escrow", icon: FileText },
      { label: "Messages", path: "/chat", icon: MessageSquare },
      { label: "Profile", path: "/dashboard/profile", icon: Settings },
    ]
  },
  [ROLES.FREELANCER]: {
    displayName: "Freelancer", icon: Award,
    navigation: [
      { label: "Dashboard", path: "/dashboard", icon: Home },
      { label: "Find Gigs", path: "/gigs", icon: Briefcase },
      { label: "My Proposals", path: "/gigs/proposals", icon: Send },
      { label: "My Projects", path: "/gigs/projects", icon: Briefcase },
      { label: "Earnings", path: "/dashboard/earnings", icon: DollarSign },
      { label: "Contracts", path: "/dashboard/escrow", icon: FileText },
      { label: "Messages", path: "/chat", icon: MessageSquare },
      { label: "Profile", path: "/dashboard/profile", icon: Settings },
    ]
  },
  [ROLES.COMPANY]: {
    displayName: "Employer", icon: Building,
    navigation: [
      { label: "Overview", path: "/dashboard", icon: Home },
      { label: "Published Jobs", path: "/dashboard/published-jobs", icon: Briefcase },
      { label: "Applications", path: "/dashboard/new-applications", icon: Users },
      { label: "Candidates", path: "/dashboard/applicants", icon: UserPlus },
      { label: "Interviews", path: "/dashboard/interviews", icon: Calendar },
      { label: "Analytics", path: "/dashboard/performance-analytics", icon: TrendingUp },
      { label: "Company Profile", path: "/dashboard/profile", icon: Building },
      { label: "Settings", path: "/dashboard/profile/edit", icon: Settings },
    ]
  },
  [ROLES.JOBSEEKER]: {
    displayName: "Job Seeker", icon: Users,
    navigation: [
      { label: "Overview", path: "/dashboard", icon: Home },
      { label: "Find Jobs", path: "/jobs", icon: Briefcase },
      { label: "Applications", path: "/dashboard/applications", icon: Send },
      { label: "Saved Jobs", path: "/dashboard/saved-jobs", icon: Bookmark },
      { label: "Recommended", path: "/dashboard/recommended-jobs", icon: Star },
      { label: "Messages", path: "/chat", icon: MessageSquare },
      { label: "My Profile", path: "/dashboard/profile", icon: Settings },
    ]
  },
  [ROLES.ADMIN]: {
    displayName: "Admin", icon: Shield,
    navigation: [
      { label: "Overview", path: "/dashboard", icon: Home },
      { label: "User Management", path: "/dashboard/users", icon: Users },
      { label: "Job Management", path: "/dashboard/jobs", icon: Briefcase },
      { label: "Moderation", path: "/dashboard/moderation", icon: Shield },
      { label: "Reports", path: "/dashboard/reports", icon: FileText },
      { label: "Activities", path: "/dashboard/activities", icon: Activity },
      { label: "Statistics", path: "/dashboard/statistics", icon: BarChart },
      { label: "Staff", path: "/dashboard/staff", icon: UserPlus },
      { label: "Subscriptions", path: "/dashboard/subscriptions", icon: DollarSign },
      { label: "Settings", path: "/dashboard/profile/edit", icon: Settings },
    ]
  }
};

export const HEADER_NAVIGATION = [
  { id: "dashboard", label: "Dashboard", path: "/dashboard", roles: ["all"] },
  { id: "jobs", label: "Find Jobs", path: "/jobs", roles: ["jobseeker"] },
  { id: "gigs", label: "Find Gigs", path: "/gigs", roles: ["freelancer"] },
  { id: "ai", label: "AI Tools", path: "/ai/cv-builder", roles: ["all"] },
  { id: "chat", label: "Messages", path: "/chat", roles: ["all"] },
  { id: "community", label: "Community", path: "/community", roles: ["all"] },
];

export const THEME_SETTINGS = {
  defaultTheme: "light", defaultDirection: "ltr",
  themes: ["light", "dark", "system"],
  directions: ["ltr", "rtl"],
};

export const COMPONENT_VISIBILITY = {
  showStats: true, showCharts: true, showActivity: true,
  showPendingActions: true, showNotifications: true,
  showQuickActions: true, showProfileCard: true,
};

export const ROLE_DISPLAY_NAMES = {
  [ROLES.CLIENT]: "Client", [ROLES.FREELANCER]: "Freelancer",
  [ROLES.COMPANY]: "Company", [ROLES.JOBSEEKER]: "Job Seeker",
  [ROLES.ADMIN]: "Admin",
};
