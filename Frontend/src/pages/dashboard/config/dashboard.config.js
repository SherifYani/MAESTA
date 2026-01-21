/**
 * @file dashboard.config.js
 * @description Dashboard configuration for all roles and components with complete data structure
 * @author Sherif Talaat
 * @version 2.1.0
 * @date 2025-12-19
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2025-1-20
 * 
 * @changes:-
 * - add profile page for jobseeker, company and client
 */

import {
  Briefcase,
  DollarSign,
  Users,
  Clock,
  Send,
  Bookmark,
  TrendingUp,
  Activity,
  PieChart,
  Calendar,
  Target,
  ThumbsUp,
  UserPlus,
  Home,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  Award,
  BarChart,
  Mail,
  FolderOpen,
  FileText,
  CheckCircle,
  AlertCircle,
  Star,
  MessageSquare,
  Zap,
  ArrowUp,
  ArrowDown,
  Eye,
  XCircle,
} from "lucide-react";

// ==================== CORE CONSTANTS ====================

export const ROLES = {
  CLIENT: "client",
  FREELANCER: "freelancer",
  COMPANY: "company",
  JOBSEEKER: "jobseeker",
  ADMIN: "admin",
};

// ==================== EXISTING CONFIGURATIONS ====================

// Role-specific metrics configuration
export const ROLE_METRICS = {
  [ROLES.CLIENT]: {
    title: "Client Dashboard",
    description: "Manage your projects and talent",
    metrics: [
      {
        id: "activeProjects",
        label: "Active Projects",
        value: "12",
        change: "+2",
        trend: "up",
        icon: Briefcase,
        color: "var(--color-accent-pink)",
        details: "3 behind schedule",
        progress: 75,
        targetValue: "15",
      },
      {
        id: "totalSpend",
        label: "Total Spend",
        value: "$42,580",
        change: "+8.2%",
        trend: "up",
        icon: DollarSign,
        color: "var(--color-vivid-pink)",
        details: "Monthly budget: $50k",
        progress: 85,
        targetValue: "$50,000",
      },
      {
        id: "openPositions",
        label: "Open Positions",
        value: "5",
        change: "-1",
        trend: "down",
        icon: Users,
        color: "var(--color-primary)",
        details: "2 urgent hires",
        progress: 60,
        targetValue: "8",
      },
      {
        id: "avgResponseTime",
        label: "Avg. Response Time",
        value: "4.2h",
        change: "-0.8h",
        trend: "down",
        icon: Clock,
        color: "var(--color-accent)",
        details: "Industry avg: 6h",
        progress: 70,
        targetValue: "3h",
      },
    ],
  },
  [ROLES.FREELANCER]: {
    title: "Freelancer Dashboard",
    description: "Track your projects and earnings",
    metrics: [
      {
        id: "activeProjects",
        label: "Active Projects",
        value: "3",
        change: "+1",
        trend: "up",
        icon: Briefcase,
        color: "var(--color-accent-pink)",
        details: "All on track",
        progress: 100,
        targetValue: "4",
      },
      {
        id: "earnings",
        label: "Earnings",
        value: "$8,250",
        change: "+15.5%",
        trend: "up",
        icon: DollarSign,
        color: "var(--color-vivid-pink)",
        details: "Target: $10k/mo",
        progress: 82,
        targetValue: "$10,000",
      },
      {
        id: "proposalsSent",
        label: "Proposals Sent",
        value: "24",
        change: "+6",
        trend: "up",
        icon: Send,
        color: "var(--color-primary)",
        details: "12% response rate",
        progress: 80,
        targetValue: "30",
      },
      {
        id: "successRate",
        label: "Job Success Rate",
        value: "92%",
        change: "+3%",
        trend: "up",
        icon: TrendingUp,
        color: "var(--color-accent)",
        details: "Platform avg: 85%",
        progress: 92,
        targetValue: "95%",
      },
    ],
  },
  [ROLES.COMPANY]: {
    title: "Company Dashboard",
    description: "Manage team and hiring pipeline",
    metrics: [
      {
        id: "teamActivity",
        label: "Team Activity",
        value: "87%",
        change: "+5%",
        trend: "up",
        icon: Activity,
        color: "var(--color-accent-pink)",
        details: "12 active members",
        progress: 87,
        targetValue: "90%",
      },
      {
        id: "hiringPipeline",
        label: "Hiring Pipeline",
        value: "18",
        change: "+4",
        trend: "up",
        icon: Users,
        color: "var(--color-vivid-pink)",
        details: "5 in final round",
        progress: 72,
        targetValue: "25",
      },
      {
        id: "budgetOverview",
        label: "Budget Used",
        value: "68%",
        change: "-12%",
        trend: "down",
        icon: PieChart,
        color: "var(--color-primary)",
        details: "$25k remaining",
        progress: 68,
        targetValue: "75%",
      },
      {
        id: "avgHireTime",
        label: "Avg. Hire Time",
        value: "14d",
        change: "-3d",
        trend: "down",
        icon: Calendar,
        color: "var(--color-accent)",
        details: "Goal: 10 days",
        progress: 60,
        targetValue: "10d",
      },
    ],
  },
  [ROLES.JOBSEEKER]: {
    title: "Job Seeker Dashboard",
    description: "Track applications and interviews",
    metrics: [
      {
        id: "appliedJobs",
        label: "Applied Jobs",
        value: "15",
        change: "+3",
        trend: "up",
        icon: Briefcase,
        color: "var(--color-accent-pink)",
        details: "5 new this week",
        progress: 60,
        targetValue: "25",
      },
      {
        id: "interviews",
        label: "Interviews",
        value: "4",
        change: "+2",
        trend: "up",
        icon: Calendar,
        color: "var(--color-vivid-pink)",
        details: "2 scheduled",
        progress: 80,
        targetValue: "5",
      },
      {
        id: "skillsMatch",
        label: "Skills Match",
        value: "87%",
        change: "+5%",
        trend: "up",
        icon: Target,
        color: "var(--color-primary)",
        details: "3 skills to improve",
        progress: 87,
        targetValue: "95%",
      },
      {
        id: "recommendations",
        label: "Recommendations",
        value: "12",
        change: "+4",
        trend: "up",
        icon: ThumbsUp,
        color: "var(--color-accent)",
        details: "Based on profile",
        progress: 80,
        targetValue: "15",
      },
    ],
  },
  [ROLES.ADMIN]: {
    title: "Admin Dashboard",
    description: "System administration and management",
    metrics: [
      {
        id: "totalUsers",
        label: "Total Users",
        value: "1,248",
        change: "+124",
        trend: "up",
        icon: Users,
        color: "var(--color-accent-pink)",
        progress: 85,
        targetValue: "1,500",
      },
      {
        id: "activeJobs",
        label: "Active Jobs",
        value: "342",
        change: "+28",
        trend: "up",
        icon: Briefcase,
        color: "var(--color-vivid-pink)",
        progress: 68,
        targetValue: "500",
      },
      {
        id: "pendingReviews",
        label: "Pending Reviews",
        value: "18",
        change: "-5",
        trend: "down",
        icon: AlertCircle,
        color: "var(--color-primary)",
        progress: 25,
        targetValue: "0",
      },
      {
        id: "revenue",
        label: "Revenue",
        value: "$12,580",
        change: "+15.2%",
        trend: "up",
        icon: DollarSign,
        color: "var(--color-accent)",
        progress: 75,
        targetValue: "$15,000",
      },
    ],
  },
};

// Sample activity data for RecentActivity component
export const SAMPLE_ACTIVITIES = {
  [ROLES.CLIENT]: [
    {
      id: 1,
      type: "proposal",
      description: "New proposal received for React Developer position",
      time: "2 hours ago",
      user: "sarah.john",
      read: false,
      priority: "high",
      // NEW FIELDS ADDED:
      title: "New Proposal Received",
      timestamp: "2 hours ago",
      icon: FileText,
      category: "Hiring",
    },
    {
      id: 2,
      type: "message",
      description: "Message regarding project timeline changes",
      time: "4 hours ago",
      user: "alex.wong",
      read: true,
      title: "Project Update",
      timestamp: "4 hours ago",
      icon: MessageSquare,
      category: "Communication",
    },
    {
      id: 3,
      type: "job",
      description: "Job posting for UX Designer is now live",
      time: "1 day ago",
      read: true,
      title: "Job Posting Live",
      timestamp: "1 day ago",
      icon: Briefcase,
      category: "Job",
    },
    {
      id: 4,
      type: "completion",
      description: 'Project "E-commerce Dashboard" completed',
      time: "2 days ago",
      user: "dev.team",
      read: true,
      priority: "medium",
      title: "Project Completed",
      timestamp: "2 days ago",
      icon: CheckCircle,
      category: "Project",
    },
    // ADDED MORE ACTIVITIES:
    {
      id: 5,
      type: "payment",
      description: "Payment of $2,500 sent to freelancer",
      time: "3 days ago",
      read: true,
      title: "Payment Processed",
      timestamp: "3 days ago",
      icon: DollarSign,
      category: "Finance",
    },
    {
      id: 6,
      type: "review",
      description: "Freelancer completed milestone review",
      time: "4 days ago",
      user: "john.doe",
      read: false,
      title: "Milestone Review",
      timestamp: "4 days ago",
      icon: Star,
      category: "Review",
    },
  ],
  [ROLES.FREELANCER]: [
    {
      id: 1,
      type: "message",
      description: "Client sent feedback on your proposal",
      time: "1 hour ago",
      user: "techcorp.hr",
      read: false,
      title: "Client Feedback",
      timestamp: "1 hour ago",
      icon: MessageSquare,
      category: "Communication",
    },
    {
      id: 2,
      type: "proposal",
      description: "Your proposal was viewed by hiring manager",
      time: "3 hours ago",
      user: "startup.ceo",
      read: true,
      title: "Proposal Viewed",
      timestamp: "3 hours ago",
      icon: Eye,
      category: "Proposal",
    },
    {
      id: 3,
      type: "completion",
      description: 'Payment received for "Mobile App Design" project',
      time: "1 day ago",
      read: true,
      priority: "high",
      title: "Payment Received",
      timestamp: "1 day ago",
      icon: DollarSign,
      category: "Finance",
    },
    {
      id: 4,
      type: "connection",
      description: "New connection request from senior designer",
      time: "2 days ago",
      user: "jane.doe",
      read: true,
      title: "New Connection",
      timestamp: "2 days ago",
      icon: Users,
      category: "Network",
    },
  ],
  [ROLES.COMPANY]: [
    {
      id: 1,
      type: "proposal",
      description: "New application for Senior Developer role",
      time: "30 minutes ago",
      user: "john.smith",
      read: false,
      priority: "high",
      title: "New Application",
      timestamp: "30 minutes ago",
      icon: UserPlus,
      category: "Hiring",
    },
    {
      id: 2,
      type: "message",
      description: "Candidate accepted interview invitation",
      time: "2 hours ago",
      user: "emma.jones",
      read: true,
      title: "Interview Scheduled",
      timestamp: "2 hours ago",
      icon: Calendar,
      category: "Interview",
    },
    {
      id: 3,
      type: "completion",
      description: "Hiring budget approved for Q4",
      time: "1 day ago",
      read: true,
      title: "Budget Approved",
      timestamp: "1 day ago",
      icon: CheckCircle,
      category: "Finance",
    },
    {
      id: 4,
      type: "job",
      description: "New job posting needs approval",
      time: "2 days ago",
      read: false,
      priority: "medium",
      title: "Job Posting Pending",
      timestamp: "2 days ago",
      icon: FileText,
      category: "Job",
    },
  ],
  [ROLES.JOBSEEKER]: [
    {
      id: 1,
      type: "job",
      description: "Application submitted for Frontend Developer",
      time: "1 hour ago",
      user: "tech.company",
      read: true,
      title: "Application Submitted",
      timestamp: "1 hour ago",
      icon: CheckCircle,
      category: "Application",
    },
    {
      id: 2,
      type: "message",
      description: "Interview scheduled for next week",
      time: "3 hours ago",
      user: "hr.recruiter",
      read: false,
      priority: "high",
      title: "Interview Scheduled",
      timestamp: "3 hours ago",
      icon: Calendar,
      category: "Interview",
    },
    {
      id: 3,
      type: "completion",
      description: "Profile viewed by 5 recruiters today",
      time: "1 day ago",
      read: true,
      title: "Profile Viewed",
      timestamp: "1 day ago",
      icon: Eye,
      category: "Profile",
    },
    {
      id: 4,
      type: "connection",
      description: "New job recommendation based on skills",
      time: "2 days ago",
      read: true,
      title: "Job Recommendation",
      timestamp: "2 days ago",
      icon: Star,
      category: "Recommendation",
    },
  ],
  [ROLES.ADMIN]: [
    {
      id: 1,
      type: "user",
      description: "New user registered: John Doe",
      time: "10 minutes ago",
      user: "system",
      read: false,
      title: "New User Registration",
      timestamp: "10 minutes ago",
      icon: UserPlus,
      category: "Users",
    },
    {
      id: 2,
      type: "job",
      description: "New job posted: Senior Developer at TechCorp",
      time: "1 hour ago",
      read: false,
      title: "New Job Post",
      timestamp: "1 hour ago",
      icon: Briefcase,
      category: "Jobs",
    },
  ],
};

// Sample pending actions for PendingActions component
export const SAMPLE_PENDING_ACTIONS = {
  [ROLES.CLIENT]: [
    {
      id: 1,
      title: "Review proposals for React Developer",
      description: "3 new proposals need review before deadline",
      priority: "high",
      dueDate: "Tomorrow",
      completed: false,
      category: "Review",
      type: "review",
      assignedTo: "Project Manager",
      // NEW FIELDS ADDED:
      icon: AlertCircle,
      status: "pending",
    },
    {
      id: 2,
      title: "Approve invoice payment",
      description: "Invoice #INV-2023-001 for $2,500",
      priority: "medium",
      dueDate: "In 3 days",
      completed: false,
      category: "Payment",
      type: "payment",
      icon: DollarSign,
      status: "pending",
    },
    {
      id: 3,
      title: "Respond to client message",
      description: "Client has questions about project timeline",
      priority: "low",
      dueDate: "Today",
      completed: true,
      category: "Message",
      type: "message",
      assignedTo: "You",
      icon: MessageSquare,
      status: "completed",
    },
    // ADDED MORE ACTIONS:
    {
      id: 4,
      title: "Schedule project kickoff meeting",
      description: "New website redesign project",
      priority: "medium",
      dueDate: "Today",
      completed: false,
      category: "Meeting",
      type: "meeting",
      icon: Calendar,
      status: "pending",
    },
  ],
  [ROLES.FREELANCER]: [
    {
      id: 1,
      title: "Update project deliverables",
      description: "Add new features to project plan",
      priority: "high",
      dueDate: "Today",
      completed: false,
      category: "Project",
      type: "update",
      assignedTo: "You",
      icon: FileText,
      status: "pending",
    },
    {
      id: 2,
      title: "Submit weekly timesheet",
      description: "Hours worked: 32.5",
      priority: "medium",
      dueDate: "Tomorrow",
      completed: false,
      category: "Admin",
      type: "deadline",
      icon: Clock,
      status: "pending",
    },
    {
      id: 3,
      title: "Send proposal to new client",
      description: "Mobile app development project",
      priority: "high",
      dueDate: "In 2 days",
      completed: false,
      category: "Proposal",
      type: "review",
      icon: Send,
      status: "pending",
    },
  ],
  [ROLES.COMPANY]: [
    {
      id: 1,
      title: "Review candidate profiles",
      description: "12 new applications for Developer role",
      priority: "high",
      dueDate: "Today",
      completed: false,
      category: "Hiring",
      type: "review",
      assignedTo: "HR Team",
      icon: FileText,
      status: "pending",
    },
    {
      id: 2,
      title: "Schedule team training",
      description: "React 19 workshop for developers",
      priority: "medium",
      dueDate: "This week",
      completed: false,
      category: "Team",
      type: "meeting",
      icon: Calendar,
      status: "pending",
    },
    {
      id: 3,
      title: "Approve Q4 hiring budget",
      description: "Budget increase request: +15%",
      priority: "high",
      dueDate: "In 2 days",
      completed: true,
      category: "Finance",
      type: "payment",
      icon: DollarSign,
      status: "completed",
    },
  ],
  [ROLES.JOBSEEKER]: [
    {
      id: 1,
      title: "Complete profile verification",
      description: "Upload documents for verification",
      priority: "high",
      dueDate: "Today",
      completed: false,
      category: "Profile",
      type: "update",
      assignedTo: "You",
      icon: CheckCircle,
      status: "pending",
    },
    {
      id: 2,
      title: "Prepare for interview",
      description: "Technical interview at 2 PM tomorrow",
      priority: "high",
      dueDate: "Tomorrow",
      completed: false,
      category: "Interview",
      type: "meeting",
      icon: Calendar,
      status: "pending",
    },
    {
      id: 3,
      title: "Update resume with new projects",
      description: "Add 3 recent projects",
      priority: "medium",
      dueDate: "This week",
      completed: true,
      category: "Profile",
      type: "update",
      icon: FileText,
      status: "completed",
    },
  ],
};

// Sample job posts for RecentJobPosts component
export const SAMPLE_JOB_POSTS = {
  [ROLES.CLIENT]: [
    {
      id: 1,
      title: "Senior React Developer",
      company: "Tech Innovations Inc.",
      proposals: 24,
      budget: "$8k - $12k",
      status: "active",
      posted: "2 days ago",
      priority: "high",
      // NEW FIELDS ADDED:
      location: "Remote",
      skills: ["React", "TypeScript", "Next.js"],
      duration: "3 months",
      icon: Briefcase,
    },
    {
      id: 2,
      title: "UX/UI Designer",
      company: "Creative Studio",
      proposals: 18,
      budget: "$5k - $8k",
      status: "review",
      posted: "5 days ago",
      priority: "medium",
      location: "New York, NY",
      skills: ["Figma", "UI Design", "Prototyping"],
      duration: "2 months",
      icon: Users,
    },
    // ADDED MORE JOB POSTS:
    {
      id: 3,
      title: "Full Stack Developer",
      company: "Startup XYZ",
      proposals: 32,
      budget: "$10k - $15k",
      status: "active",
      posted: "1 week ago",
      priority: "high",
      location: "Remote",
      skills: ["Node.js", "React", "MongoDB"],
      duration: "6 months",
      icon: Zap,
    },
    {
      id: 4,
      title: "DevOps Engineer",
      company: "Cloud Solutions",
      proposals: 15,
      budget: "$12k - $18k",
      status: "pending",
      posted: "3 days ago",
      priority: "medium",
      location: "San Francisco, CA",
      skills: ["AWS", "Kubernetes", "Docker"],
      duration: "4 months",
      icon: Briefcase,
    },
  ],
  [ROLES.FREELANCER]: [
    {
      id: 1,
      title: "Full Stack Developer",
      company: "Startup XYZ",
      proposals: 42,
      budget: "$10k - $15k",
      status: "active",
      posted: "1 day ago",
      priority: "high",
      location: "Remote",
      skills: ["React", "Node.js", "AWS"],
      duration: "6 months",
      icon: Zap,
    },
    {
      id: 2,
      title: "Mobile App Developer",
      company: "App Masters",
      proposals: 31,
      budget: "$6k - $9k",
      status: "review",
      posted: "3 days ago",
      priority: "medium",
      location: "San Francisco, CA",
      skills: ["React Native", "iOS", "Android"],
      duration: "4 months",
      icon: Briefcase,
    },
  ],
  [ROLES.COMPANY]: [
    {
      id: 1,
      title: "Senior DevOps Engineer",
      company: "Your Company",
      proposals: 38,
      budget: "$120k - $150k",
      status: "active",
      posted: "1 day ago",
      priority: "high",
      location: "Remote",
      skills: ["AWS", "Kubernetes", "Terraform"],
      duration: "Full-time",
      icon: Zap,
    },
    {
      id: 2,
      title: "Product Manager",
      company: "Your Company",
      proposals: 22,
      budget: "$90k - $130k",
      status: "draft",
      posted: "4 days ago",
      priority: "medium",
      location: "New York, NY",
      skills: ["Product Strategy", "Agile", "Analytics"],
      duration: "Full-time",
      icon: Briefcase,
    },
  ],
  [ROLES.JOBSEEKER]: [
    {
      id: 1,
      title: "Frontend Developer",
      company: "Digital Solutions",
      proposals: 56,
      budget: "$80k - $110k",
      status: "applied",
      posted: "2 days ago",
      priority: "high",
      location: "Remote",
      skills: ["React", "TypeScript", "CSS"],
      duration: "Full-time",
      icon: Briefcase,
    },
    {
      id: 2,
      title: "UI Designer",
      company: "Design Studio Pro",
      proposals: 34,
      budget: "$70k - $95k",
      status: "saved",
      posted: "5 days ago",
      priority: "medium",
      location: "Los Angeles, CA",
      skills: ["Figma", "UI Design", "Prototyping"],
      duration: "Full-time",
      icon: Users,
    },
  ],
};

// ==================== NEW DATA STRUCTURES ====================

/**
 * NEW: Earnings data for freelancer and client dashboards
 */
export const EARNINGS_DATA = {
  [ROLES.CLIENT]: {
    title: "Project Spending Overview",
    period: "Last 6 Months",
    totalSpent: "$42,580",
    changePercentage: "+8.2%",
    changeDirection: "up",
    monthlyData: [
      { month: "Jan", amount: 6500, projects: 3 },
      { month: "Feb", amount: 7200, projects: 4 },
      { month: "Mar", amount: 5800, projects: 2 },
      { month: "Apr", amount: 8300, projects: 5 },
      { month: "May", amount: 6900, projects: 3 },
      { month: "Jun", amount: 8880, projects: 6 },
    ],
    byCategory: [
      { category: "Development", amount: 25000, percentage: 58 },
      { category: "Design", amount: 12000, percentage: 28 },
      { category: "Consulting", amount: 3580, percentage: 8 },
      { category: "Other", amount: 2000, percentage: 5 },
    ],
  },
  [ROLES.FREELANCER]: {
    title: "Earnings Overview",
    period: "Last 6 Months",
    totalEarnings: "$8,250",
    changePercentage: "+15.5%",
    changeDirection: "up",
    monthlyData: [
      { month: "Jan", earnings: 1200, projects: 1 },
      { month: "Feb", earnings: 1800, projects: 2 },
      { month: "Mar", earnings: 2200, projects: 3 },
      { month: "Apr", earnings: 3000, projects: 4 },
      { month: "May", earnings: 2500, projects: 3 },
      { month: "Jun", earnings: 3850, projects: 5 },
    ],
    bySource: [
      { source: "Development", amount: 5200, percentage: 63 },
      { source: "Design", amount: 2200, percentage: 27 },
      { source: "Consulting", amount: 850, percentage: 10 },
    ],
  },
  [ROLES.COMPANY]: null, // Company doesn't have earnings data
  [ROLES.JOBSEEKER]: null, // Jobseeker doesn't have earnings data
};

/**
 * NEW: Team data for company dashboard
 */
export const TEAM_DATA = {
  [ROLES.COMPANY]: {
    totalMembers: 24,
    activeMembers: 21,
    departments: [
      { name: "Engineering", count: 12, active: 11 },
      { name: "Design", count: 5, active: 4 },
      { name: "Marketing", count: 4, active: 3 },
      { name: "Sales", count: 3, active: 3 },
    ],
    hiringGoals: {
      target: 8,
      current: 3,
      remaining: 5,
    },
  },
};

/**
 * NEW: Job applications for jobseeker dashboard
 */
export const JOB_APPLICATIONS = {
  [ROLES.JOBSEEKER]: [
    {
      id: 1,
      title: "Frontend Developer at TechCorp",
      status: "applied",
      date: "Dec 15",
      company: "TechCorp",
      stage: "Applied",
      icon: CheckCircle,
    },
    {
      id: 2,
      title: "UI Designer at CreativeLab",
      status: "interview",
      date: "Dec 12",
      company: "CreativeLab",
      stage: "Interview Scheduled",
      icon: Calendar,
    },
    {
      id: 3,
      title: "Product Manager at StartupXYZ",
      status: "offer",
      date: "Dec 10",
      company: "StartupXYZ",
      stage: "Offer Received",
      icon: Award,
    },
    {
      id: 4,
      title: "Full Stack Developer at WebSolutions",
      status: "rejected",
      date: "Dec 5",
      company: "WebSolutions",
      stage: "Not Selected",
      icon: XCircle,
    },
  ],
  [ROLES.FREELANCER]: [
    {
      id: 1,
      title: "React Developer Project",
      status: "active",
      date: "Dec 18",
      client: "TechCorp",
      stage: "In Progress",
      icon: Briefcase,
    },
    {
      id: 2,
      title: "UI Design Contract",
      status: "pending",
      date: "Dec 16",
      client: "DesignStudio",
      stage: "Proposal Sent",
      icon: Send,
    },
  ],
};

/**
 * NEW: Skill analysis for jobseeker and freelancer
 */
export const SKILL_ANALYSIS = {
  [ROLES.JOBSEEKER]: {
    matchedSkills: ["React", "TypeScript", "CSS", "Git"],
    missingSkills: ["Next.js", "GraphQL", "Testing"],
    matchPercentage: 87,
    recommendations: [
      "Complete Advanced React Course",
      "Learn Next.js Framework",
      "Practice GraphQL Queries",
    ],
  },
  [ROLES.FREELANCER]: {
    matchedSkills: ["React", "Node.js", "UI/UX Design", "Project Management"],
    missingSkills: ["AWS Certification", "TypeScript Advanced", "DevOps"],
    matchPercentage: 92,
    recommendations: [
      "Get AWS Certified",
      "Master TypeScript Advanced Features",
      "Learn Basic DevOps",
    ],
  },
};

/**
 * NEW: Performance metrics for all roles
 */
export const PERFORMANCE_METRICS = {
  [ROLES.CLIENT]: {
    projectCompletionRate: 92,
    clientSatisfaction: 4.8,
    onTimeDelivery: 88,
    budgetAdherence: 94,
  },
  [ROLES.FREELANCER]: {
    projectCompletionRate: 100,
    clientSatisfaction: 5.0,
    onTimeDelivery: 95,
    repeatClients: 4,
  },
  [ROLES.COMPANY]: {
    employeeRetention: 94,
    hiringSuccessRate: 88,
    timeToFill: 14,
    offerAcceptanceRate: 85,
  },
  [ROLES.JOBSEEKER]: {
    applicationResponseRate: 42,
    interviewConversionRate: 33,
    skillImprovementRate: 15,
    profileCompleteness: 78,
  },
};

// ==================== HELPER CONFIGURATIONS (NEW) ====================

/**
 * Priority configuration with colors and icons
 */
export const PRIORITY_CONFIG = {
  high: {
    label: "High",
    color: "var(--color-danger)",
    icon: AlertCircle,
    bgColor: "var(--color-danger-light)",
  },
  medium: {
    label: "Medium",
    color: "var(--color-warning)",
    icon: AlertCircle,
    bgColor: "var(--color-warning-light)",
  },
  low: {
    label: "Low",
    color: "var(--color-info)",
    icon: AlertCircle,
    bgColor: "var(--color-info-light)",
  },
};

/**
 * Activity type icons mapping
 */
export const ACTIVITY_ICONS = {
  proposal: FileText,
  message: MessageSquare,
  job: Briefcase,
  completion: CheckCircle,
  connection: Users,
  payment: DollarSign,
  interview: Calendar,
  hiring: UserPlus,
  review: Star,
  application: CheckCircle,
  profile: UserPlus,
  recommendation: Star,
  meeting: Calendar,
  update: FileText,
};

/**
 * Status configuration
 */
export const STATUS_CONFIG = {
  active: {
    label: "Active",
    color: "var(--color-success)",
    icon: CheckCircle,
  },
  pending: {
    label: "Pending",
    color: "var(--color-warning)",
    icon: Clock,
  },
  completed: {
    label: "Completed",
    color: "var(--color-info)",
    icon: CheckCircle,
  },
  draft: {
    label: "Draft",
    color: "var(--color-secondary)",
    icon: FileText,
  },
  applied: {
    label: "Applied",
    color: "var(--color-primary)",
    icon: CheckCircle,
  },
  interview: {
    label: "Interview",
    color: "var(--color-accent)",
    icon: Calendar,
  },
  offer: {
    label: "Offer",
    color: "var(--color-success)",
    icon: Award,
  },
  rejected: {
    label: "Rejected",
    color: "var(--color-danger)",
    icon: XCircle,
  },
};

/**
 * Metric colors for trends
 */
export const METRIC_COLORS = {
  up: {
    color: "var(--color-success)",
    icon: ArrowUp,
    bgColor: "var(--color-success-light)",
  },
  down: {
    color: "var(--color-danger)",
    icon: ArrowDown,
    bgColor: "var(--color-danger-light)",
  },
};

// ==================== EXISTING NAVIGATION ====================

export const ROLE_NAVIGATION = {
  [ROLES.CLIENT]: [
    { id: "overview", label: "Overview", icon: Home, path: "/dashboard" },
    { id: "profile", label: "Profile", icon: Users, path: "/dashboard/profile" },
    {
      id: "projects",
      label: "Projects",
      icon: Briefcase,
      path: "/dashboard/projects",
    },
    {
      id: "talent",
      label: "Talent Pool",
      icon: Users,
      path: "/dashboard/talent",
    },
    {
      id: "messages",
      label: "Messages",
      icon: Mail,
      path: "/dashboard/messages",
    },
    {
      id: "reports",
      label: "Reports",
      icon: BarChart,
      path: "/dashboard/reports",
    },
  ],
  [ROLES.FREELANCER]: [
    { id: "overview", label: "Overview", icon: Home, path: "/dashboard" },
    {
      id: "projects",
      label: "Projects",
      icon: Briefcase,
      path: "/dashboard/projects",
    },
    {
      id: "proposals",
      label: "Proposals",
      icon: Send,
      path: "/dashboard/proposals",
    },
    {
      id: "earnings",
      label: "Earnings",
      icon: DollarSign,
      path: "/dashboard/earnings",
    },
    {
      id: "profile",
      label: "Profile",
      icon: UserPlus,
      path: "/dashboard/profile",
    },
  ],
  [ROLES.COMPANY]: [
    { id: "overview", label: "Overview", icon: Home, path: "/dashboard" },
    { id: "team", label: "Team", icon: Users, path: "/dashboard/team" },
    { id: "profile", label: "Profile", icon: Users, path: "/dashboard/profile" },
    {
      id: "hiring",
      label: "Hiring",
      icon: Briefcase,
      path: "/dashboard/hiring",
    },
    {
      id: "reports",
      label: "Reports",
      icon: BarChart,
      path: "/dashboard/reports",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      path: "/dashboard/settings",
    },
  ],
  [ROLES.JOBSEEKER]: [
    { id: "overview", label: "Overview", icon: Home, path: "/dashboard" },
    {
      id: "profile",
      label: "Profile",
      icon: UserPlus,
      path: "/dashboard/profile",
    },
    {
      id: "saved-jobs",
      label: "Saved Jobs",
      icon: Bookmark,
      path: "/dashboard/saved-jobs",
    },
    {
      id: "applications",
      label: "Applications",
      icon: FolderOpen,
      path: "/dashboard/applications",
    },
    {
      id: "recommended-jobs",
      label: "Recommended Jobs",
      icon: Briefcase,
      path: "/dashboard/recommended-jobs",
    },
  ],
  [ROLES.ADMIN]: [
    { id: "overview", label: "Overview", icon: Home, path: "/dashboard" },
    {
      id: "users",
      label: "User Management",
      icon: Users,
      path: "/dashboard/users",
    },
    {
      id: "jobs",
      label: "Job Management",
      icon: Briefcase,
      path: "/dashboard/jobs",
    },
    {
      id: "content",
      label: "Content Moderation",
      icon: FileText,
      path: "/dashboard/content",
    },
    {
      id: "payments",
      label: "Payments",
      icon: DollarSign,
      path: "/dashboard/payments",
    },
    {
      id: "reports",
      label: "Reports",
      icon: BarChart,
      path: "/dashboard/reports",
    },
    {
      id: "staff",
      label: "Staff Management",
      icon: UserPlus,
      path: "/dashboard/staff",
    },
  ],
};

// Header navigation (common for all roles)
export const HEADER_NAVIGATION = [
  { id: "notifications", icon: Bell, label: "Notifications", hasBadge: true },
  { id: "help", icon: HelpCircle, label: "Help & Support" },
  { id: "settings", icon: Settings, label: "Settings" },
  { id: "logout", icon: LogOut, label: "Logout" },
];

// ==================== EXISTING THEME & VISIBILITY ====================

// Theme settings
export const THEME_SETTINGS = {
  light: {
    primaryColor: "var(--color-primary)",
    accentColor: "var(--color-accent-pink)",
    backgroundColor: "var(--color-background)",
  },
  dark: {
    primaryColor: "var(--color-primary)",
    accentColor: "var(--color-accent-pink)",
    backgroundColor: "var(--color-background)",
  },
};

// Component visibility configuration by role
export const COMPONENT_VISIBILITY = {
  [ROLES.CLIENT]: {
    showMetrics: true,
    showRecentActivity: true,
    showRecentJobPosts: true,
    showPendingActions: true,
    showEarnings: false,
    showApplications: false,
    showTeamActivity: false,
  },
  [ROLES.FREELANCER]: {
    showMetrics: true,
    showRecentActivity: true,
    showRecentJobPosts: true,
    showPendingActions: true,
    showEarnings: true,
    showApplications: true,
    showTeamActivity: false,
  },
  [ROLES.COMPANY]: {
    showMetrics: true,
    showRecentActivity: true,
    showRecentJobPosts: true,
    showPendingActions: true,
    showEarnings: false,
    showApplications: false,
    showTeamActivity: true,
  },
  [ROLES.JOBSEEKER]: {
    showMetrics: true,
    showRecentActivity: true,
    showRecentJobPosts: true,
    showPendingActions: true,
    showEarnings: false,
    showApplications: true,
    showTeamActivity: false,
  },
  [ROLES.ADMIN]: {
    showMetrics: true,
    showRecentActivity: true,
    showRecentJobPosts: false, // Admins don't see job posts
    showPendingActions: true,
    showEarnings: false,
    showApplications: false,
    showTeamActivity: false,
    showAdminControls: true,
  },
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get complete dashboard data for a specific role
 * @param {string} role - The role identifier
 * @returns {Object} Complete dashboard data for the role
 */
export const getCompleteDashboardData = (role) => {
  return {
    // Existing data
    metrics: ROLE_METRICS[role]?.metrics || [],
    activities: SAMPLE_ACTIVITIES[role] || [],
    pendingActions: SAMPLE_PENDING_ACTIONS[role] || [],
    recentJobPosts: SAMPLE_JOB_POSTS[role] || [],

    // New data structures
    earningsData: EARNINGS_DATA[role] || null,
    teamData: TEAM_DATA[role] || null,
    jobApplications: JOB_APPLICATIONS[role] || [],
    skillAnalysis: SKILL_ANALYSIS[role] || null,
    performanceMetrics: PERFORMANCE_METRICS[role] || {},

    // Role info
    title: ROLE_METRICS[role]?.title || "",
    description: ROLE_METRICS[role]?.description || "",
  };
};

/**
 * Get metrics for a specific role
 * @param {string} role - The role identifier
 * @returns {Array} Metrics array for the role
 */
export const getRoleMetrics = (role) => {
  return ROLE_METRICS[role]?.metrics || [];
};

/**
 * Get activities for a specific role
 * @param {string} role - The role identifier
 * @returns {Array} Activities array for the role
 */
export const getRoleActivities = (role) => {
  return SAMPLE_ACTIVITIES[role] || [];
};

/**
 * Get pending actions for a specific role
 * @param {string} role - The role identifier
 * @returns {Array} Pending actions array for the role
 */
export const getRolePendingActions = (role) => {
  return SAMPLE_PENDING_ACTIONS[role] || [];
};

// ==================== EXISTING DEFAULT DATA ====================

// Default data when no real data is available
export const DEFAULT_DATA = {
  activities: [],
  pendingActions: [],
  recentJobs: [],
  metrics: [],
};

// Export role display names
export const ROLE_DISPLAY_NAMES = {
  [ROLES.CLIENT]: "Client",
  [ROLES.FREELANCER]: "Freelancer",
  [ROLES.COMPANY]: "Company",
  [ROLES.JOBSEEKER]: "Job Seeker",
  [ROLES.ADMIN]: "Administrator",
};

/**
 * COMPREHENSIVE JOB SEEKER TEST DATA
 * Based on SRS Requirements FR-701.1 to FR-701.5
 */

// ==================== JOB SEEKER SPECIFIC DATA ====================

/**
 * Detailed job seeker profile data
 */
export const JOB_SEEKER_PROFILE = {
  id: "js_001",
  name: "Sherif Talaat",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ST",
  headline: "Senior Frontend Developer | React & TypeScript Expert",
  location: "Cairo, Egypt",
  email: "sherif.talaat@example.com",
  phone: "+20 100 000 0000",
  summary: "Experienced Frontend Developer with 5+ years building scalable web applications. Specialized in React ecosystem, TypeScript, and modern JavaScript. Passionate about UI/UX, performance optimization, and clean code architecture.",
  completionPercentage: 85,
  verification: {
    email: true,
    phone: true,
    identity: true,
    resume: true
  },
  stats: {
    applications: 24,
    interviews: 8,
    offers: 3,
    profileViews: 156,
    responseRate: "65%",
    averageSalary: "$85,000"
  }
};

/**
 * Detailed recommended jobs for job seeker (FR-701.3)
 */
export const JOB_SEEKER_RECOMMENDED_JOBS = [
  {
    id: "job_001",
    title: "Senior React Developer",
    company: "TechCorp Egypt",
    location: "Cairo, Egypt",
    salary: "EGP 25,000 - 35,000",
    type: "Full-time",
    postedDate: "2025-01-18",
    matchScore: 95,
    isUrgent: true,
    isRemote: true,
    isSaved: true,
    skills: ["React", "TypeScript", "Next.js", "Redux", "Tailwind CSS", "GraphQL"],
    duration: "Full-time",
    description: "We're looking for a Senior React Developer to join our product team. You'll be responsible for building and maintaining our customer-facing web applications, working closely with designers and backend engineers.",
    requirements: [
      "5+ years experience with React and TypeScript",
      "Strong understanding of Next.js and SSR",
      "Experience with state management (Redux, Zustand)",
      "Knowledge of modern CSS (Tailwind, Styled Components)",
      "Experience with GraphQL and REST APIs",
      "Familiarity with testing frameworks (Jest, React Testing Library)"
    ],
    benefits: [
      "Competitive salary with bonuses",
      "Medical insurance",
      "Flexible remote work policy",
      "Learning & development budget",
      "Annual company retreat"
    ],
    companyInfo: {
      size: "201-500 employees",
      industry: "Technology",
      founded: 2015,
      website: "https://techcorp-egypt.com"
    }
  },
  {
    id: "job_002",
    title: "Frontend Team Lead",
    company: "Innovate Solutions",
    location: "Giza, Egypt",
    salary: "EGP 30,000 - 40,000",
    type: "Full-time",
    postedDate: "2025-01-15",
    matchScore: 88,
    isUrgent: false,
    isRemote: true,
    isSaved: false,
    skills: ["React", "TypeScript", "Leadership", "Architecture", "Team Management", "Agile"],
    duration: "Full-time",
    description: "Lead a team of 5-7 frontend developers, define technical architecture, and ensure best practices. Mentor junior developers and collaborate with product managers on roadmap planning.",
    requirements: [
      "7+ years in frontend development",
      "2+ years in a leadership role",
      "Expert in React and TypeScript",
      "Experience with micro-frontend architecture",
      "Strong communication and mentorship skills",
      "Bachelor's in Computer Science or equivalent"
    ],
    companyInfo: {
      size: "501-1000 employees",
      industry: "FinTech",
      founded: 2018,
      website: "https://innovate-solutions.com"
    }
  },
  {
    id: "job_003",
    title: "Full Stack Developer (React/Node)",
    company: "StartupXYZ",
    location: "Remote",
    salary: "$4,000 - $6,000",
    type: "Contract",
    postedDate: "2025-01-20",
    matchScore: 82,
    isUrgent: true,
    isRemote: true,
    isSaved: true,
    skills: ["React", "Node.js", "MongoDB", "AWS", "Docker", "TypeScript"],
    duration: "6 months",
    description: "Join our fast-growing startup as a Full Stack Developer. You'll work on both frontend and backend, building features from concept to deployment.",
    requirements: [
      "3+ years with React and Node.js",
      "Experience with MongoDB or similar NoSQL databases",
      "Knowledge of AWS services (Lambda, S3, EC2)",
      "Understanding of Docker and containerization",
      "Experience with CI/CD pipelines",
      "Ability to work in a fast-paced startup environment"
    ],
    companyInfo: {
      size: "11-50 employees",
      industry: "SaaS",
      founded: 2022,
      website: "https://startupxyz.com"
    }
  },
  {
    id: "job_004",
    title: "UI/UX Developer",
    company: "DesignStudio Pro",
    location: "Alexandria, Egypt",
    salary: "EGP 18,000 - 25,000",
    type: "Full-time",
    postedDate: "2025-01-12",
    matchScore: 75,
    isUrgent: false,
    isRemote: false,
    isSaved: false,
    skills: ["React", "Figma", "UI/UX", "CSS", "Animation", "Design Systems"],
    duration: "Full-time",
    description: "Bridge the gap between design and development. Implement pixel-perfect UIs from Figma designs and contribute to our design system.",
    requirements: [
      "Strong eye for design and attention to detail",
      "3+ years with React",
      "Experience with design tools (Figma, Sketch)",
      "Expert in CSS and animation libraries",
      "Portfolio of previous work",
      "Understanding of accessibility standards"
    ],
    companyInfo: {
      size: "51-200 employees",
      industry: "Design & Development",
      founded: 2019,
      website: "https://designstudiopro.com"
    }
  },
  {
    id: "job_005",
    title: "React Native Developer",
    company: "MobileFirst",
    location: "Remote",
    salary: "$3,500 - $5,500",
    type: "Contract",
    postedDate: "2025-01-22",
    matchScore: 70,
    isUrgent: false,
    isRemote: true,
    isSaved: false,
    skills: ["React Native", "iOS", "Android", "TypeScript", "Mobile Development", "Firebase"],
    duration: "4 months",
    description: "Build cross-platform mobile applications using React Native. Work on new features and optimize existing functionality for performance.",
    requirements: [
      "2+ years with React Native",
      "Published apps on App Store/Google Play",
      "Experience with native modules (iOS/Android)",
      "Knowledge of mobile app architecture",
      "Familiarity with Firebase services",
      "Understanding of mobile UI/UX best practices"
    ],
    companyInfo: {
      size: "11-50 employees",
      industry: "Mobile Development",
      founded: 2021,
      website: "https://mobilefirst.com"
    }
  },
  {
    id: "job_006",
    title: "Frontend Developer (Vue.js)",
    company: "VueTech Solutions",
    location: "New Cairo, Egypt",
    salary: "EGP 22,000 - 30,000",
    type: "Full-time",
    postedDate: "2025-01-19",
    matchScore: 65,
    isUrgent: false,
    isRemote: true,
    isSaved: false,
    skills: ["Vue.js", "JavaScript", "Vuex", "Vuetify", "REST APIs", "Testing"],
    duration: "Full-time",
    description: "Join our Vue.js team to build enterprise-level applications. While we focus on Vue, experience with React is a plus as we consider expanding our tech stack.",
    requirements: [
      "4+ years with Vue.js",
      "Experience with Vue ecosystem (Vuex, Vue Router)",
      "Knowledge of UI frameworks (Vuetify, Quasar)",
      "Understanding of JavaScript ES6+",
      "Experience with testing (Vitest, Jest)",
      "Willingness to learn new technologies"
    ],
    companyInfo: {
      size: "101-500 employees",
      industry: "Enterprise Software",
      founded: 2017,
      website: "https://vuetech.com"
    }
  },
  {
    id: "job_007",
    title: "Software Engineer II (Frontend)",
    company: "GlobalTech Inc.",
    location: "Remote (US Hours)",
    salary: "$6,000 - $8,500",
    type: "Full-time",
    postedDate: "2025-01-16",
    matchScore: 92,
    isUrgent: true,
    isRemote: true,
    isSaved: true,
    skills: ["React", "TypeScript", "Next.js", "GraphQL", "Micro-frontends", "Testing"],
    duration: "Full-time",
    description: "Work on our core platform used by millions of users. You'll be part of a distributed team building scalable frontend architecture.",
    requirements: [
      "5+ years professional experience",
      "Expert in React and TypeScript",
      "Experience with Next.js and SSR",
      "Knowledge of GraphQL and Apollo",
      "Understanding of micro-frontend architecture",
      "Experience with large-scale applications"
    ],
    companyInfo: {
      size: "5000+ employees",
      industry: "Technology",
      founded: 2010,
      website: "https://globaltech.com"
    }
  },
  {
    id: "job_008",
    title: "Frontend Developer (Entry Level)",
    company: "TechTrainee Program",
    location: "Cairo, Egypt",
    salary: "EGP 10,000 - 15,000",
    type: "Full-time",
    postedDate: "2025-01-21",
    matchScore: 60,
    isUrgent: false,
    isRemote: false,
    isSaved: false,
    skills: ["JavaScript", "HTML", "CSS", "React Basics", "Git", "Problem Solving"],
    duration: "Full-time",
    description: "Join our trainee program for fresh graduates. Get mentorship, training, and hands-on experience with real projects.",
    requirements: [
      "Bachelor's in Computer Science or related",
      "Basic understanding of JavaScript",
      "Knowledge of HTML/CSS",
      "Familiarity with React (academic or personal projects)",
      "Strong problem-solving skills",
      "Willingness to learn and grow"
    ],
    companyInfo: {
      size: "1001-5000 employees",
      industry: "Education & Training",
      founded: 2016,
      website: "https://techtrainee.com"
    }
  }
];

/**
 * Detailed job applications for job seeker (FR-701.4)
 */
export const JOB_SEEKER_APPLICATIONS = [
  {
    id: "app_001",
    jobId: "job_001",
    jobTitle: "Senior React Developer",
    company: "TechCorp Egypt",
    appliedDate: "2025-01-15",
    status: "interview",
    stage: "Technical Interview",
    statusDate: "2025-01-20",
    matchScore: 95,
    salary: "EGP 25,000 - 35,000",
    location: "Cairo, Egypt",
    nextAction: "Complete coding challenge by Jan 25",
    notes: "Positive feedback from HR screening. Technical interview scheduled with engineering manager.",
    timeline: [
      { date: "2025-01-15", action: "Application submitted", status: "completed" },
      { date: "2025-01-16", action: "HR screening", status: "completed" },
      { date: "2025-01-20", action: "Technical interview", status: "scheduled" },
      { date: "2025-01-25", action: "Coding challenge", status: "pending" },
      { date: "2025-01-30", action: "Final interview", status: "pending" }
    ]
  },
  {
    id: "app_002",
    jobId: "job_007",
    jobTitle: "Software Engineer II (Frontend)",
    company: "GlobalTech Inc.",
    appliedDate: "2025-01-10",
    status: "offer",
    stage: "Offer Received",
    statusDate: "2025-01-18",
    matchScore: 92,
    salary: "$6,000 - $8,500",
    location: "Remote (US Hours)",
    nextAction: "Review offer details and respond by Jan 28",
    notes: "Offer package received. Includes base salary, stock options, and benefits.",
    offerDetails: {
      baseSalary: "$7,500/month",
      signingBonus: "$5,000",
      stockOptions: "1000 RSUs",
      benefits: "Health insurance, 401k matching, remote work stipend",
      startDate: "2025-02-15"
    }
  },
  {
    id: "app_003",
    jobId: "job_003",
    jobTitle: "Full Stack Developer (React/Node)",
    company: "StartupXYZ",
    appliedDate: "2025-01-18",
    status: "review",
    stage: "Under Review",
    statusDate: "2025-01-19",
    matchScore: 82,
    salary: "$4,000 - $6,000",
    location: "Remote",
    nextAction: "Await initial screening call",
    notes: "Application submitted. Portfolio review in progress by hiring team."
  },
  {
    id: "app_004",
    jobId: "job_002",
    jobTitle: "Frontend Team Lead",
    company: "Innovate Solutions",
    appliedDate: "2025-01-05",
    status: "rejected",
    stage: "Not Selected",
    statusDate: "2025-01-12",
    matchScore: 88,
    salary: "EGP 30,000 - 40,000",
    location: "Giza, Egypt",
    nextAction: "None - position filled",
    notes: "Position filled internally. Hiring manager suggested reapplying for future openings.",
    feedback: "Strong technical skills but limited leadership experience in current role."
  },
  {
    id: "app_005",
    jobId: "job_005",
    jobTitle: "React Native Developer",
    company: "MobileFirst",
    appliedDate: "2025-01-14",
    status: "interview",
    stage: "Second Interview",
    statusDate: "2025-01-22",
    matchScore: 70,
    salary: "$3,500 - $5,500",
    location: "Remote",
    nextAction: "Prepare for technical presentation",
    notes: "First interview went well. Second interview scheduled with CTO.",
    timeline: [
      { date: "2025-01-14", action: "Application submitted", status: "completed" },
      { date: "2025-01-17", action: "Initial screening", status: "completed" },
      { date: "2025-01-19", action: "First interview", status: "completed" },
      { date: "2025-01-22", action: "Second interview", status: "scheduled" }
    ]
  },
  {
    id: "app_006",
    jobId: "job_004",
    jobTitle: "UI/UX Developer",
    company: "DesignStudio Pro",
    appliedDate: "2025-01-08",
    status: "withdrawn",
    stage: "Application Withdrawn",
    statusDate: "2025-01-10",
    matchScore: 75,
    salary: "EGP 18,000 - 25,000",
    location: "Alexandria, Egypt",
    nextAction: "None",
    notes: "Withdrawn application due to accepting another offer.",
    reason: "Accepted offer from GlobalTech Inc."
  }
];

/**
 * Saved jobs for job seeker (FR-701.5)
 */
export const JOB_SEEKER_SAVED_JOBS = [
  {
    id: "save_001",
    jobId: "job_001",
    jobTitle: "Senior React Developer",
    company: "TechCorp Egypt",
    savedDate: "2025-01-16",
    hasApplied: true,
    matchScore: 95,
    salary: "EGP 25,000 - 35,000",
    location: "Cairo, Egypt",
    type: "Full-time"
  },
  {
    id: "save_002",
    jobId: "job_003",
    jobTitle: "Full Stack Developer (React/Node)",
    company: "StartupXYZ",
    savedDate: "2025-01-20",
    hasApplied: true,
    matchScore: 82,
    salary: "$4,000 - $6,000",
    location: "Remote",
    type: "Contract"
  },
  {
    id: "save_003",
    jobId: "job_007",
    jobTitle: "Software Engineer II (Frontend)",
    company: "GlobalTech Inc.",
    savedDate: "2025-01-10",
    hasApplied: true,
    matchScore: 92,
    salary: "$6,000 - $8,500",
    location: "Remote (US Hours)",
    type: "Full-time"
  },
  {
    id: "save_004",
    jobId: "job_008",
    jobTitle: "Frontend Developer (Entry Level)",
    company: "TechTrainee Program",
    savedDate: "2025-01-22",
    hasApplied: false,
    matchScore: 60,
    salary: "EGP 10,000 - 15,000",
    location: "Cairo, Egypt",
    type: "Full-time"
  }
];

/**
 * Skills analysis for job seeker
 */
export const JOB_SEEKER_SKILLS_ANALYSIS = {
  matchedSkills: [
    { name: "React", level: 95, category: "Frontend", demand: "Very High" },
    { name: "TypeScript", level: 90, category: "Frontend", demand: "High" },
    { name: "Next.js", level: 85, category: "Frontend", demand: "High" },
    { name: "JavaScript", level: 95, category: "Frontend", demand: "Very High" },
    { name: "HTML/CSS", level: 90, category: "Frontend", demand: "High" },
    { name: "Redux", level: 80, category: "State Management", demand: "Medium" },
    { name: "Tailwind CSS", level: 85, category: "Styling", demand: "High" },
    { name: "Git", level: 85, category: "Tools", demand: "Very High" }
  ],
  missingSkills: [
    { name: "GraphQL", reason: "Required by 40% of high-paying jobs", priority: "High", learningTime: "2-3 months" },
    { name: "AWS", reason: "Cloud knowledge for full-stack roles", priority: "Medium", learningTime: "3-4 months" },
    { name: "Docker", reason: "DevOps skills for modern workflows", priority: "Medium", learningTime: "1-2 months" },
    { name: "Testing (Jest/Cypress)", reason: "Quality assurance requirements", priority: "High", learningTime: "1-2 months" }
  ],
  overallMatch: 87,
  inDemandSkills: ["TypeScript", "Next.js", "GraphQL", "AWS", "Testing"],
  recommendations: [
    "Complete GraphQL course to unlock 40% more job opportunities",
    "Learn AWS basics for cloud deployment skills",
    "Improve testing knowledge with Jest and React Testing Library",
    "Consider learning Node.js for full-stack capabilities"
  ],
  skillGaps: [
    { skill: "GraphQL", currentLevel: 30, targetLevel: 70, impact: "High" },
    { skill: "AWS", currentLevel: 20, targetLevel: 60, impact: "Medium" },
    { skill: "Testing", currentLevel: 50, targetLevel: 80, impact: "High" }
  ]
};

/**
 * Recent activity for job seeker
 */
export const JOB_SEEKER_RECENT_ACTIVITY = [
  {
    id: "act_001",
    type: "application",
    title: "Application submitted for Senior React Developer",
    description: "Applied to TechCorp Egypt",
    date: "2025-01-15",
    time: "10:30 AM",
    status: "success",
    icon: "📄"
  },
  {
    id: "act_002",
    type: "interview",
    title: "Interview scheduled with GlobalTech Inc.",
    description: "Technical interview with engineering team",
    date: "2025-01-18",
    time: "2:00 PM",
    status: "upcoming",
    icon: "🎯"
  },
  {
    id: "act_003",
    type: "offer",
    title: "Offer received from GlobalTech Inc.",
    description: "Software Engineer II position",
    date: "2025-01-19",
    time: "4:45 PM",
    status: "success",
    icon: "💰"
  },
  {
    id: "act_004",
    type: "profile",
    title: "Profile viewed by 5 companies",
    description: "TechCorp, Innovate Solutions, StartupXYZ",
    date: "2025-01-20",
    time: "9:15 AM",
    status: "info",
    icon: "👁️"
  },
  {
    id: "act_005",
    type: "skill",
    title: "Skill assessment completed",
    description: "React proficiency: Advanced (95%)",
    date: "2025-01-21",
    time: "11:00 AM",
    status: "info",
    icon: "📊"
  },
  {
    id: "act_006",
    type: "job",
    title: "New job recommendation",
    description: "Frontend Team Lead at DesignStudio Pro",
    date: "2025-01-22",
    time: "3:30 PM",
    status: "info",
    icon: "🎯"
  }
];

/**
 * Performance metrics for job seeker
 */
export const JOB_SEEKER_PERFORMANCE = {
  applicationMetrics: {
    totalApplied: 24,
    interviews: 8,
    offers: 3,
    rejectionRate: 25,
    avgResponseTime: "3.2 days",
    conversionRate: "12.5%"
  },
  profileMetrics: {
    completeness: 85,
    viewsThisMonth: 156,
    avgViewTime: "2m 45s",
    searchAppearances: 342
  },
  skillMetrics: {
    avgMatchScore: 87,
    inDemandSkills: 8,
    skillGaps: 4,
    learningProgress: 65
  },
  marketMetrics: {
    avgSalaryRange: "$75k - $95k",
    inDemandRoles: ["Senior React Dev", "Frontend Lead", "Full Stack"],
    hiringTrend: "High",
    competitionLevel: "Medium"
  }
};

// ==================== UPDATE EXISTING CONFIGURATIONS ====================

// Update the existing SAMPLE_JOB_POSTS for jobseeker role
export const UPDATED_SAMPLE_JOB_POSTS = {
  ...SAMPLE_JOB_POSTS,
  [ROLES.JOBSEEKER]: JOB_SEEKER_RECOMMENDED_JOBS
};

// Update the existing JOB_APPLICATIONS for jobseeker role
export const UPDATED_JOB_APPLICATIONS = {
  ...JOB_APPLICATIONS,
  [ROLES.JOBSEEKER]: JOB_SEEKER_APPLICATIONS
};

// Update the existing SKILL_ANALYSIS for jobseeker role
export const UPDATED_SKILL_ANALYSIS = {
  ...SKILL_ANALYSIS,
  [ROLES.JOBSEEKER]: JOB_SEEKER_SKILLS_ANALYSIS
};

// Update the existing PERFORMANCE_METRICS for jobseeker role
export const UPDATED_PERFORMANCE_METRICS = {
  ...PERFORMANCE_METRICS,
  [ROLES.JOBSEEKER]: JOB_SEEKER_PERFORMANCE
};

// ==================== ENHANCED HELPER FUNCTIONS ====================

/**
 * Get comprehensive job seeker dashboard data
 * @param {string} role - The role identifier
 * @returns {Object} Complete dashboard data for job seeker
 */
export const getJobSeekerDashboardData = (role = ROLES.JOBSEEKER) => {
  if (role !== ROLES.JOBSEEKER) {
    return getCompleteDashboardData(role);
  }

  return {
    // Profile data
    profile: JOB_SEEKER_PROFILE,
    
    // Recommended jobs (FR-701.3)
    recommendedJobs: JOB_SEEKER_RECOMMENDED_JOBS,
    
    // Job applications (FR-701.4)
    applications: JOB_SEEKER_APPLICATIONS,
    
    // Saved jobs (FR-701.5)
    savedJobs: JOB_SEEKER_SAVED_JOBS,
    
    // Skills analysis
    skillsAnalysis: JOB_SEEKER_SKILLS_ANALYSIS,
    
    // Recent activity
    recentActivity: JOB_SEEKER_RECENT_ACTIVITY,
    
    // Performance metrics
    performance: JOB_SEEKER_PERFORMANCE,
    
    // Existing dashboard data
    metrics: ROLE_METRICS[ROLES.JOBSEEKER]?.metrics || [],
    activities: SAMPLE_ACTIVITIES[ROLES.JOBSEEKER] || [],
    pendingActions: SAMPLE_PENDING_ACTIONS[ROLES.JOBSEEKER] || [],
    recentJobPosts: JOB_SEEKER_RECOMMENDED_JOBS,
    jobApplications: JOB_SEEKER_APPLICATIONS,
    
    // Role info
    title: ROLE_METRICS[ROLES.JOBSEEKER]?.title || "",
    description: ROLE_METRICS[ROLES.JOBSEEKER]?.description || "",
    
    // Additional data
    earningsData: null, // Job seeker doesn't have earnings
    teamData: null, // Job seeker doesn't have team data
    skillAnalysis: JOB_SEEKER_SKILLS_ANALYSIS
  };
};

/**
 * Calculate job seeker statistics
 * @returns {Object} Various statistics for dashboard
 */
export const getJobSeekerStatistics = () => {
  const applications = JOB_SEEKER_APPLICATIONS;
  const stats = {
    totalApplications: applications.length,
    activeApplications: applications.filter(app => 
      ["applied", "review", "interview"].includes(app.status)
    ).length,
    interviewsScheduled: applications.filter(app => 
      app.status === "interview"
    ).length,
    offersReceived: applications.filter(app => 
      app.status === "offer"
    ).length,
    averageMatchScore: Math.round(
      applications.reduce((sum, app) => sum + app.matchScore, 0) / applications.length
    ) || 0
  };
  
  return stats;
};

/**
 * Get job application status summary
 * @returns {Object} Status counts for applications
 */
export const getApplicationStatusSummary = () => {
  const statusCounts = JOB_SEEKER_APPLICATIONS.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});
  
  return {
    total: JOB_SEEKER_APPLICATIONS.length,
    byStatus: statusCounts,
    recentApplications: JOB_SEEKER_APPLICATIONS
      .sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate))
      .slice(0, 5)
  };
};

/**
 * Get saved jobs summary
 * @returns {Object} Saved jobs statistics
 */
export const getSavedJobsSummary = () => {
  return {
    totalSaved: JOB_SEEKER_SAVED_JOBS.length,
    appliedFromSaved: JOB_SEEKER_SAVED_JOBS.filter(job => job.hasApplied).length,
    pendingReview: JOB_SEEKER_SAVED_JOBS.filter(job => !job.hasApplied).length,
    byType: JOB_SEEKER_SAVED_JOBS.reduce((acc, job) => {
      acc[job.type] = (acc[job.type] || 0) + 1;
      return acc;
    }, {})
  };
};

// ==================== EXPORT EVERYTHING ====================

export default {
  ROLES,
  ROLE_METRICS,
  ROLE_NAVIGATION,
  HEADER_NAVIGATION,
  SAMPLE_ACTIVITIES,
  SAMPLE_PENDING_ACTIONS,
  SAMPLE_JOB_POSTS,
  DEFAULT_DATA,
  ROLE_DISPLAY_NAMES,
  THEME_SETTINGS,
  COMPONENT_VISIBILITY,
  EARNINGS_DATA,
  TEAM_DATA,
  JOB_APPLICATIONS,
  SKILL_ANALYSIS,
  PERFORMANCE_METRICS,
  PRIORITY_CONFIG,
  ACTIVITY_ICONS,
  STATUS_CONFIG,
  METRIC_COLORS,
  getCompleteDashboardData,
  getRoleMetrics,
  getRoleActivities,
  getRolePendingActions,

  // new exports (jobseeker data for testing)
  JOB_SEEKER_PROFILE,
  JOB_SEEKER_RECOMMENDED_JOBS,
  JOB_SEEKER_APPLICATIONS,
  JOB_SEEKER_SAVED_JOBS,
  JOB_SEEKER_SKILLS_ANALYSIS,
  JOB_SEEKER_RECENT_ACTIVITY,
  JOB_SEEKER_PERFORMANCE,
  getJobSeekerDashboardData,
  getJobSeekerStatistics,
  getApplicationStatusSummary,
  getSavedJobsSummary
};
