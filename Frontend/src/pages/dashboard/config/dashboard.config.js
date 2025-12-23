/**
 * @file dashboard.config.js
 * @description Dashboard configuration for all roles and components with complete data structure
 * @author Sherif Talaat
 * @version 2.1.0
 * @date 2025-12-19
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2025-12-21
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
    { id: "projects", label: "Projects", icon: Briefcase, path: "/projects" },
    { id: "talent", label: "Talent Pool", icon: Users, path: "/talent" },
    { id: "messages", label: "Messages", icon: Mail, path: "/messages" },
    { id: "reports", label: "Reports", icon: BarChart, path: "/reports" },
  ],
  [ROLES.FREELANCER]: [
    { id: "overview", label: "Overview", icon: Home, path: "/dashboard" },
    { id: "projects", label: "Projects", icon: Briefcase, path: "/projects" },
    { id: "proposals", label: "Proposals", icon: Send, path: "/proposals" },
    { id: "earnings", label: "Earnings", icon: DollarSign, path: "/earnings" },
    { id: "profile", label: "Profile", icon: UserPlus, path: "/profile" },
  ],
  [ROLES.COMPANY]: [
    { id: "overview", label: "Overview", icon: Home, path: "/dashboard" },
    { id: "team", label: "Team", icon: Users, path: "/team" },
    { id: "hiring", label: "Hiring", icon: Briefcase, path: "/hiring" },
    { id: "reports", label: "Reports", icon: BarChart, path: "/reports" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
  ],
  [ROLES.JOBSEEKER]: [
    { id: "overview", label: "Overview", icon: Home, path: "/dashboard" },
    // {
    //   id: "profile",
    //   label: "Profile",
    //   icon: UserPlus,
    //   path: "/dashboard/profile",
    // },
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
    { id: "skills", label: "Skills", icon: Award, path: "/dashboard/skills" },
  ],
  [ROLES.ADMIN]: [
    { id: "overview", label: "Overview", icon: Home, path: "/dashboard" },
    {
      id: "users",
      label: "User Management",
      icon: Users,
      path: "/admin/users",
    },
    {
      id: "jobs",
      label: "Job Management",
      icon: Briefcase,
      path: "/admin/jobs",
    },
    {
      id: "content",
      label: "Content Moderation",
      icon: FileText,
      path: "/admin/content",
    },
    {
      id: "payments",
      label: "Payments",
      icon: DollarSign,
      path: "/admin/payments",
    },
    { id: "reports", label: "Reports", icon: BarChart, path: "/admin/reports" },
    {
      id: "staff",
      label: "Staff Management",
      icon: UserPlus,
      path: "/admin/staff",
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

  // New exports
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
};
