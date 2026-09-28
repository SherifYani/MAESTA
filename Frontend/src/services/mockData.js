/**
 * @file mockData.js
 * @description Centralized mock data used as fallback when the backend is unavailable.
 * @version 1.0.0
 */

// ─── Auth / Users ──────────────────────────────────────────────────────────────
export const MOCK_USERS = {
    jobSeeker: {
        id: 'mock-user-jobseeker',
        userId: 'mock-user-jobseeker',
        firstName: 'Alex',
        lastName: 'Johnson',
        name: 'Alex Johnson',
        email: 'alex.johnson@example.com',
        role: 'jobseeker',
        userType: 'JobSeeker',
        roles: ['JobSeeker'],
        registrationStatus: 'Completed',
        isActive: true,
        isEmailVerified: true,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        profilePictureUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        headline: 'Senior React Developer & Frontend Architect',
        createdAt: '2025-01-15T10:00:00Z',
        jobSeekerProfile: {
            title: 'Senior React Developer',
            bio: 'Passionate frontend engineer with 5+ years of experience in React, TypeScript, and modern web applications.',
            skills: ['React', 'TypeScript', 'Redux', 'TailwindCSS', 'Next.js'],
            experienceYears: 5,
        },
    },
    employer: {
        id: 'mock-user-employer',
        userId: 'mock-user-employer',
        firstName: 'Sarah',
        lastName: 'Jenkins',
        name: 'Sarah Jenkins',
        email: 'employer@example.com',
        role: 'company',
        userType: 'Employer',
        roles: ['Employer'],
        registrationStatus: 'Completed',
        isActive: true,
        isEmailVerified: true,
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        profilePictureUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        headline: 'Head of Talent Acquisition @ TechCorp Inc.',
        companyName: 'TechCorp Inc.',
        companyLogo: 'https://i.pravatar.cc/60?img=10',
        createdAt: '2025-02-01T10:00:00Z',
        employerProfile: {
            companyName: 'TechCorp Inc.',
            industry: 'Technology & Software',
            companySize: '50-200',
            website: 'https://techcorp.example.com',
        },
    },
    freelancer: {
        id: 'mock-user-freelancer',
        userId: 'mock-user-freelancer',
        firstName: 'Marcus',
        lastName: 'Chen',
        name: 'Marcus Chen',
        email: 'freelancer@example.com',
        role: 'freelancer',
        userType: 'Freelancer',
        roles: ['Freelancer'],
        registrationStatus: 'Completed',
        isActive: true,
        isEmailVerified: true,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        profilePictureUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        headline: 'Full-Stack Freelance Engineer & Cloud Consultant',
        hourlyRate: 65,
        rating: 4.95,
        reviewCount: 38,
        createdAt: '2025-01-20T10:00:00Z',
    },
    client: {
        id: 'mock-user-client',
        userId: 'mock-user-client',
        firstName: 'Emily',
        lastName: 'Watson',
        name: 'Emily Watson',
        email: 'client@example.com',
        role: 'client',
        userType: 'Client',
        roles: ['Client'],
        registrationStatus: 'Completed',
        isActive: true,
        isEmailVerified: true,
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        profilePictureUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        headline: 'Product Manager & Project Creator',
        createdAt: '2025-03-01T10:00:00Z',
    },
    admin: {
        id: 'mock-user-admin',
        userId: 'mock-user-admin',
        firstName: 'David',
        lastName: 'Miller',
        name: 'David Miller',
        email: 'admin@example.com',
        role: 'admin',
        userType: 'Admin',
        roles: ['Admin'],
        registrationStatus: 'Completed',
        isActive: true,
        isEmailVerified: true,
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        profilePictureUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        headline: 'System Administrator',
        createdAt: '2024-11-01T10:00:00Z',
    },
};

/** Default active mock user */
export const MOCK_USER = MOCK_USERS.jobSeeker;

/**
 * Resolves a mock user by role or email.
 */
export const findMockUser = (emailOrRole = '') => {
    const val = (emailOrRole || '').trim().toLowerCase();
    if (!val) return MOCK_USERS.jobSeeker;

    // Direct role key match (jobseeker, employer, company, freelancer, client, admin)
    if (val === 'company' || val === 'employer') return MOCK_USERS.employer;
    if (val === 'jobseeker') return MOCK_USERS.jobSeeker;
    if (val === 'freelancer') return MOCK_USERS.freelancer;
    if (val === 'client') return MOCK_USERS.client;
    if (val === 'admin') return MOCK_USERS.admin;

    // Check by email or userType
    for (const key of Object.keys(MOCK_USERS)) {
        const u = MOCK_USERS[key];
        if (
            u.email.toLowerCase() === val ||
            u.role.toLowerCase() === val ||
            u.userType.toLowerCase() === val
        ) {
            return u;
        }
    }

    // Keyword heuristics
    if (val.includes('admin')) return MOCK_USERS.admin;
    if (val.includes('employer') || val.includes('company') || val.includes('recruiter')) return MOCK_USERS.employer;
    if (val.includes('freelancer')) return MOCK_USERS.freelancer;
    if (val.includes('client')) return MOCK_USERS.client;

    // Fallback: create dynamic mock user with the provided email
    const username = val.split('@')[0] || 'user';
    const formattedName = username.charAt(0).toUpperCase() + username.slice(1);
    return {
        ...MOCK_USERS.jobSeeker,
        id: `mock-user-${username}`,
        userId: `mock-user-${username}`,
        email: val.includes('@') ? val : `${val}@example.com`,
        firstName: formattedName,
        lastName: 'Demo',
        name: `${formattedName} Demo`,
    };
};

/**
 * Creates an AuthResponse DTO matching backend specifications
 */
export const createMockTokenResponse = (user = MOCK_USER) => ({
    userId: user.userId || user.id,
    email: user.email,
    userType: user.userType,
    role: user.role,
    accessToken: `mock-jwt-token-${user.userId || user.id}`,
    refreshToken: `mock-refresh-token-${user.userId || user.id}`,
    accessTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    requiresTwoFactor: false,
    registrationStatus: 'Completed',
    user: user,
});

export const MOCK_TOKEN_RESPONSE = createMockTokenResponse(MOCK_USERS.jobSeeker);

// ─── Jobs ─────────────────────────────────────────────────────────────────────
export const MOCK_JOBS = [
    {
        id: 'job-1',
        title: 'Senior React Developer',
        company: 'TechCorp Inc.',
        companyLogo: 'https://i.pravatar.cc/60?img=10',
        location: 'Remote',
        type: 'Full-time',
        salary: '$90,000 – $130,000',
        salaryMin: 90000,
        salaryMax: 130000,
        description: 'We are looking for a talented Senior React Developer to join our growing team. You will work on cutting-edge web applications and help define our frontend architecture.',
        requirements: ['5+ years React experience', 'TypeScript proficiency', 'REST API integration', 'Testing (Jest/RTL)'],
        skills: ['React', 'TypeScript', 'Redux', 'GraphQL'],
        category: 'Software Engineering',
        experienceLevel: 'senior',
        isPublished: true,
        isSaved: false,
        views: 342,
        applications: 18,
        postedAt: '2026-09-20T08:00:00Z',
        deadline: '2026-10-20T00:00:00Z',
    },
    {
        id: 'job-2',
        title: 'UX/UI Designer',
        company: 'DesignStudio',
        companyLogo: 'https://i.pravatar.cc/60?img=11',
        location: 'Cairo, Egypt',
        type: 'Full-time',
        salary: '$50,000 – $75,000',
        salaryMin: 50000,
        salaryMax: 75000,
        description: 'Join our creative team as a UX/UI Designer. You will lead the design process for our flagship SaaS products from wireframe to production.',
        requirements: ['3+ years UX/UI experience', 'Figma proficiency', 'User research', 'Design systems'],
        skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
        category: 'Design',
        experienceLevel: 'mid',
        isPublished: true,
        isSaved: true,
        views: 210,
        applications: 12,
        postedAt: '2026-09-22T09:00:00Z',
        deadline: '2026-10-22T00:00:00Z',
    },
    {
        id: 'job-3',
        title: 'Backend Node.js Engineer',
        company: 'StartupXYZ',
        companyLogo: 'https://i.pravatar.cc/60?img=12',
        location: 'Dubai, UAE',
        type: 'Full-time',
        salary: '$70,000 – $100,000',
        salaryMin: 70000,
        salaryMax: 100000,
        description: 'Build scalable microservices and APIs for our next-generation fintech platform.',
        requirements: ['Node.js', 'PostgreSQL', 'Docker', 'AWS'],
        skills: ['Node.js', 'Express', 'PostgreSQL', 'Docker', 'AWS'],
        category: 'Software Engineering',
        experienceLevel: 'mid',
        isPublished: true,
        isSaved: false,
        views: 178,
        applications: 9,
        postedAt: '2026-09-24T11:00:00Z',
        deadline: '2026-10-24T00:00:00Z',
    },
    {
        id: 'job-4',
        title: 'Data Scientist',
        company: 'AI Innovations Ltd.',
        companyLogo: 'https://i.pravatar.cc/60?img=13',
        location: 'Remote',
        type: 'Full-time',
        salary: '$85,000 – $120,000',
        salaryMin: 85000,
        salaryMax: 120000,
        description: 'Leverage machine learning and statistical modeling to drive data-driven decisions across the business.',
        requirements: ['Python', 'ML frameworks', 'SQL', '3+ years experience'],
        skills: ['Python', 'TensorFlow', 'Scikit-learn', 'SQL', 'Tableau'],
        category: 'Data Science',
        experienceLevel: 'senior',
        isPublished: true,
        isSaved: false,
        views: 290,
        applications: 22,
        postedAt: '2026-09-18T07:00:00Z',
        deadline: '2026-10-18T00:00:00Z',
    },
    {
        id: 'job-5',
        title: 'DevOps Engineer',
        company: 'CloudNative Co.',
        companyLogo: 'https://i.pravatar.cc/60?img=14',
        location: 'Remote',
        type: 'Contract',
        salary: '$60,000 – $90,000',
        salaryMin: 60000,
        salaryMax: 90000,
        description: 'Design and maintain CI/CD pipelines, Kubernetes clusters, and cloud infrastructure.',
        requirements: ['Kubernetes', 'Terraform', 'CI/CD', 'Linux'],
        skills: ['Kubernetes', 'Terraform', 'AWS', 'Docker', 'Jenkins'],
        category: 'DevOps',
        experienceLevel: 'mid',
        isPublished: true,
        isSaved: false,
        views: 155,
        applications: 7,
        postedAt: '2026-09-25T12:00:00Z',
        deadline: '2026-10-25T00:00:00Z',
    },
];

export const MOCK_JOBS_RESPONSE = {
    items: MOCK_JOBS,
    totalItems: MOCK_JOBS.length,
    totalPages: 1,
    page: 1,
    pageSize: 20,
};

export const MOCK_MY_APPLICATIONS = [
    {
        id: 'app-1',
        jobId: 'job-1',
        jobTitle: 'Senior React Developer',
        company: 'TechCorp Inc.',
        status: 'pending',
        appliedAt: '2026-09-21T10:00:00Z',
        coverLetter: 'I am excited to apply for this position...',
    },
    {
        id: 'app-2',
        jobId: 'job-2',
        jobTitle: 'UX/UI Designer',
        company: 'DesignStudio',
        status: 'reviewed',
        appliedAt: '2026-09-23T14:00:00Z',
        coverLetter: 'With 4 years of design experience...',
    },
];

export const MOCK_SAVED_JOBS = [MOCK_JOBS[1]];

// ─── Gigs / Freelance ─────────────────────────────────────────────────────────
export const MOCK_GIGS = [
    {
        id: 'gig-1',
        title: 'Build a React E-Commerce Website',
        description: 'Need an experienced React developer to build a full-featured e-commerce site with cart, checkout, and Stripe integration.',
        budget: 1500,
        budgetType: 'fixed',
        skills: ['React', 'Node.js', 'Stripe', 'MongoDB'],
        deadline: '2026-10-30T00:00:00Z',
        postedBy: 'ClientUser Corp',
        status: 'open',
        proposals: 4,
        isActive: true,
        createdAt: '2026-09-20T08:00:00Z',
    },
    {
        id: 'gig-2',
        title: 'Mobile App UI Design (Figma)',
        description: 'Looking for a talented UI designer to create a complete mobile app design in Figma, including all screens and components.',
        budget: 800,
        budgetType: 'fixed',
        skills: ['Figma', 'UI Design', 'Mobile Design'],
        deadline: '2026-10-15T00:00:00Z',
        postedBy: 'StartupABC',
        status: 'open',
        proposals: 7,
        isActive: true,
        createdAt: '2026-09-22T10:00:00Z',
    },
    {
        id: 'gig-3',
        title: 'SEO Optimization & Content Writing',
        description: 'Monthly SEO content creation and on-page optimization for a tech blog targeting 10k+ monthly visitors.',
        budget: 500,
        budgetType: 'monthly',
        skills: ['SEO', 'Content Writing', 'Keyword Research'],
        deadline: null,
        postedBy: 'TechBlog Media',
        status: 'open',
        proposals: 2,
        isActive: true,
        createdAt: '2026-09-24T09:00:00Z',
    },
];

export const MOCK_GIGS_RESPONSE = {
    items: MOCK_GIGS,
    totalItems: MOCK_GIGS.length,
    totalPages: 1,
    page: 1,
    pageSize: 20,
};

export const MOCK_PROPOSALS = [
    {
        id: 'prop-1',
        gigId: 'gig-1',
        gigTitle: 'Build a React E-Commerce Website',
        freelancerName: 'Alex Johnson',
        coverLetter: 'I have 5 years of React experience and have built multiple e-commerce platforms...',
        bidAmount: 1400,
        deliveryTime: 14,
        status: 'pending',
        submittedAt: '2026-09-21T12:00:00Z',
    },
];

export const MOCK_CONTRACTS = [
    {
        id: 'contract-1',
        gigId: 'gig-1',
        projectTitle: 'Build a React E-Commerce Website',
        clientName: 'ClientUser Corp',
        freelancerName: 'Alex Johnson',
        amount: 1400,
        status: 'active',
        startDate: '2026-09-25T00:00:00Z',
        milestones: [
            { id: 'm-1', title: 'Initial Setup & Wireframes', amount: 400, status: 'completed', dueDate: '2026-10-01T00:00:00Z' },
            { id: 'm-2', title: 'Frontend Development', amount: 600, status: 'in_progress', dueDate: '2026-10-10T00:00:00Z' },
            { id: 'm-3', title: 'Integration & Testing', amount: 400, status: 'pending', dueDate: '2026-10-20T00:00:00Z' },
        ],
    },
];

// ─── Profile ───────────────────────────────────────────────────────────────────
export const MOCK_PROFILE = {
    id: 'mock-user-1',
    userId: 'mock-user-1',
    firstName: 'Alex',
    lastName: 'Johnson',
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    headline: 'Senior Frontend Developer | React & TypeScript',
    bio: 'Passionate software engineer with 6+ years of experience building scalable web applications. I specialize in React ecosystem and modern frontend architecture.',
    avatarUrl: 'https://i.pravatar.cc/150?img=3',
    location: 'Cairo, Egypt',
    phone: '+20 100 123 4567',
    website: 'https://alexjohnson.dev',
    linkedIn: 'https://linkedin.com/in/alexjohnson',
    github: 'https://github.com/alexjohnson',
    isProfilePublic: true,
    skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'Redux', 'Next.js'],
    experiences: [
        {
            id: 'exp-1',
            title: 'Senior Frontend Developer',
            company: 'TechCorp Inc.',
            location: 'Remote',
            startDate: '2023-01-01',
            endDate: null,
            isCurrent: true,
            description: 'Lead frontend development for multiple SaaS products.',
        },
        {
            id: 'exp-2',
            title: 'Frontend Developer',
            company: 'StartupXYZ',
            location: 'Cairo, Egypt',
            startDate: '2020-06-01',
            endDate: '2022-12-31',
            isCurrent: false,
            description: 'Built and maintained React applications for B2B clients.',
        },
    ],
    education: [
        {
            id: 'edu-1',
            degree: 'B.Sc. Computer Science',
            institution: 'Cairo University',
            fieldOfStudy: 'Computer Science',
            startYear: 2016,
            endYear: 2020,
            grade: 'Excellent',
        },
    ],
    resumeUrl: null,
    hourlyRate: 45,
    portfolio: [
        {
            id: 'port-1',
            title: 'E-Commerce Platform',
            description: 'Full-stack e-commerce solution with React and Node.js',
            imageUrl: 'https://picsum.photos/400/300?random=1',
            url: 'https://github.com/alexjohnson/ecommerce',
        },
    ],
};

// ─── Dashboard ─────────────────────────────────────────────────────────────────
export const MOCK_DASHBOARD_SUMMARY = {
    totalJobs: 1240,
    activeJobs: 853,
    totalApplications: 4821,
    totalFreelancers: 3200,
    totalClients: 780,
    revenue: 128400,
    pendingApprovals: 12,
    recentActivity: [],
};

// ─── Admin ─────────────────────────────────────────────────────────────────────
export const MOCK_ADMIN_METRICS = {
    totalUsers: 8240,
    activeUsers: 6120,
    totalJobs: 1240,
    activeJobs: 853,
    totalGigs: 520,
    pendingReports: 14,
    revenue: 128400,
    newUsersThisMonth: 342,
};

export const MOCK_ADMIN_USERS = [
    {
        userId: 'u-1', firstName: 'Sara', lastName: 'Ahmed', email: 'sara@example.com',
        isActive: true, roles: ['JobSeeker'], userType: 'JobSeeker', createdAt: '2026-01-10T00:00:00Z',
        registrationStatus: 'Approved',
    },
    {
        userId: 'u-2', firstName: 'John', lastName: 'Smith', email: 'john@company.com',
        isActive: true, roles: ['Employer'], userType: 'Employer', createdAt: '2026-02-14T00:00:00Z',
        registrationStatus: 'Approved',
    },
    {
        userId: 'u-3', firstName: 'Fatima', lastName: 'Hassan', email: 'fatima@freelance.com',
        isActive: false, roles: ['Freelancer'], userType: 'Freelancer', createdAt: '2026-03-05T00:00:00Z',
        registrationStatus: 'PendingApproval',
    },
];

export const MOCK_PENDING_APPROVALS = [
    {
        userId: 'u-3', firstName: 'Fatima', lastName: 'Hassan', email: 'fatima@freelance.com',
        userType: 'Freelancer', createdAt: '2026-03-05T00:00:00Z', registrationStatus: 'PendingApproval',
    },
];

export const MOCK_PENDING_REPORTS = [
    {
        reportId: 'r-1', entityType: 'Job', reason: 'Misleading job description',
        status: 'Pending', createdAt: '2026-09-25T10:00:00Z',
    },
    {
        reportId: 'r-2', entityType: 'User', reason: 'Spam account',
        status: 'Pending', createdAt: '2026-09-26T08:00:00Z',
    },
];

export const MOCK_LOGS = {
    items: [
        { id: 'log-1', userName: 'alex@example.com', action: 'Login', details: 'Successful login', timestamp: '2026-09-28T09:00:00Z' },
        { id: 'log-2', userName: 'sara@example.com', action: 'Job Applied', details: 'Applied to Senior React Developer', timestamp: '2026-09-28T09:30:00Z' },
        { id: 'log-3', userName: 'admin@maesta.io', action: 'User Approved', details: 'Approved user fatima@freelance.com', timestamp: '2026-09-28T10:00:00Z' },
    ],
    totalPages: 1,
    totalItems: 3,
    page: 1,
    pageSize: 50,
};

export const MOCK_FINANCE_SUMMARY = {
    totalRevenue: 128400,
    pendingWithdrawals: 5200,
    completedWithdrawals: 45800,
    pendingRefunds: 1200,
    activeSubscriptions: 340,
    subscriptionRevenue: 34000,
};

export const MOCK_HEALTH = {
    api: 'healthy',
    database: 'healthy',
    storage: 'healthy',
    totalUsers: 8240,
    activeUsers: 6120,
};

export const MOCK_MONTHLY_ANALYTICS = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return {
        month: d.toLocaleString('default', { month: 'short', year: 'numeric' }),
        users: Math.floor(400 + Math.random() * 300),
        jobs: Math.floor(80 + Math.random() * 100),
        revenue: Math.floor(15000 + Math.random() * 10000),
    };
});

// ─── Notifications ─────────────────────────────────────────────────────────────
export const MOCK_NOTIFICATIONS = [
    {
        id: 'notif-1',
        type: 'application_status',
        title: 'Application Update',
        message: 'Your application for "Senior React Developer" has been reviewed.',
        isRead: false,
        createdAt: '2026-09-27T10:00:00Z',
    },
    {
        id: 'notif-2',
        type: 'new_job',
        title: 'New Job Match',
        message: 'A new job matching your skills was posted: "TypeScript Lead at FinTech Co."',
        isRead: true,
        createdAt: '2026-09-26T08:00:00Z',
    },
];

// ─── Chat / Messages ───────────────────────────────────────────────────────────
export const MOCK_CONVERSATIONS = [
    {
        id: 'conv-1',
        participantName: 'HR at TechCorp',
        participantAvatar: 'https://i.pravatar.cc/50?img=20',
        lastMessage: 'We would love to schedule an interview!',
        lastMessageAt: '2026-09-27T15:00:00Z',
        unreadCount: 1,
    },
];

export const MOCK_MESSAGES = [
    {
        id: 'msg-1',
        conversationId: 'conv-1',
        senderId: 'other-1',
        senderName: 'HR at TechCorp',
        content: 'Hi Alex, we reviewed your application and are very impressed.',
        sentAt: '2026-09-27T14:30:00Z',
        isOwn: false,
    },
    {
        id: 'msg-2',
        conversationId: 'conv-1',
        senderId: 'mock-user-1',
        senderName: 'Alex Johnson',
        content: 'Thank you! I am very excited about this opportunity.',
        sentAt: '2026-09-27T14:45:00Z',
        isOwn: true,
    },
    {
        id: 'msg-3',
        conversationId: 'conv-1',
        senderId: 'other-1',
        senderName: 'HR at TechCorp',
        content: 'We would love to schedule an interview!',
        sentAt: '2026-09-27T15:00:00Z',
        isOwn: false,
    },
];

// ─── Categories & Skills ───────────────────────────────────────────────────────
export const MOCK_CATEGORIES = [
    { id: 'cat-1', name: 'Software Engineering', icon: '💻', jobCount: 420 },
    { id: 'cat-2', name: 'Design', icon: '🎨', jobCount: 180 },
    { id: 'cat-3', name: 'Data Science', icon: '📊', jobCount: 95 },
    { id: 'cat-4', name: 'DevOps', icon: '⚙️', jobCount: 75 },
    { id: 'cat-5', name: 'Marketing', icon: '📣', jobCount: 140 },
    { id: 'cat-6', name: 'Product Management', icon: '🗂️', jobCount: 60 },
    { id: 'cat-7', name: 'Finance', icon: '💰', jobCount: 85 },
    { id: 'cat-8', name: 'Customer Support', icon: '🎧', jobCount: 110 },
];

export const MOCK_SKILLS = [
    'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Java', 'Go',
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'GraphQL', 'REST APIs',
    'PostgreSQL', 'MongoDB', 'Redis', 'Figma', 'Adobe XD', 'Tailwind CSS',
    'Next.js', 'Vue.js', 'Angular', 'Django', 'FastAPI', 'Spring Boot',
];

// ─── Payment / Subscription ────────────────────────────────────────────────────
export const MOCK_SUBSCRIPTION = {
    id: 'sub-1',
    plan: 'Professional',
    status: 'active',
    price: 29.99,
    currency: 'USD',
    billingCycle: 'monthly',
    startDate: '2026-09-01T00:00:00Z',
    nextBillingDate: '2026-10-01T00:00:00Z',
    features: ['Unlimited job applications', 'Priority support', 'Analytics dashboard', 'AI resume review'],
};

// ─── Interviews ────────────────────────────────────────────────────────────────
export const MOCK_INTERVIEWS = [
    {
        id: 'int-1',
        jobId: 'job-1',
        jobTitle: 'Senior React Developer',
        company: 'TechCorp Inc.',
        interviewDate: '2026-10-05T14:00:00Z',
        type: 'video',
        status: 'scheduled',
        notes: 'Prepare system design questions.',
        meetingLink: 'https://meet.google.com/mock-link',
    },
];

// ─── Settings ──────────────────────────────────────────────────────────────────
export const MOCK_SETTINGS = {
    isProfilePublic: true,
    emailNotifications: true,
    pushNotifications: false,
    language: 'en',
    theme: 'dark',
    twoFactorEnabled: false,
};

// ─── Community ─────────────────────────────────────────────────────────────────
export const MOCK_COMMUNITY_POSTS = [
    {
        id: 'post-1',
        author: 'Sara Ahmed',
        authorAvatar: 'https://i.pravatar.cc/50?img=5',
        content: 'Just got my first React job offer after 6 months of learning! Huge thanks to this community 🎉',
        likes: 42,
        comments: 8,
        createdAt: '2026-09-27T09:00:00Z',
    },
    {
        id: 'post-2',
        author: 'Omar Hassan',
        authorAvatar: 'https://i.pravatar.cc/50?img=7',
        content: 'Any tips on acing technical interviews for mid-level positions? Especially system design rounds.',
        likes: 15,
        comments: 12,
        createdAt: '2026-09-26T14:00:00Z',
    },
];

// ─── Helper ───────────────────────────────────────────────────────────────────
/** Returns true when the error is a network/connectivity error (backend down) */
export const isNetworkError = (error) => {
    if (!error) return false;
    // Axios network error has no response
    if (error.isAxiosError && !error.response) return true;
    // Connection refused / ECONNREFUSED
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') return true;
    // CORS failure when backend is down also gives network error
    if (error.message && (
        error.message.includes('Network Error') ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('Failed to fetch')
    )) return true;
    return false;
};
