import adminService from '../../../../../services/adminService';
import jobService from '../../../../../services/jobService';
import paymentService from '../../../../../services/paymentService';

export const getAdminStats = async () => {
    try {
        const metrics = await adminService.getDashboardMetrics();
        const pendingReports = await adminService.getPendingReports();
        return {
            totalUsers: metrics?.totalUsers || 0,
            activeJobs: metrics?.activeJobs || metrics?.totalJobs || 0,
            pendingModeration: (metrics?.pendingModeration || metrics?.pendingReportsCount || 0) + (pendingReports?.length || 0),
            totalRevenue: metrics?.totalRevenue || 0,
            userGrowth: metrics?.userGrowth || "0%",
            revenueGrowth: metrics?.revenueGrowth || "0%",
            activeSessions: metrics?.activeSessions || 0,
            avgResponseTime: metrics?.avgResponseTime || "N/A",
            successRate: metrics?.successRate || "N/A"
        };
    } catch (error) {
        return {
            totalUsers: 0, activeJobs: 0, pendingModeration: 0, totalRevenue: 0,
            userGrowth: "0%", revenueGrowth: "0%", activeSessions: 0,
            avgResponseTime: "N/A", successRate: "N/A"
        };
    }
};

export const getUsersData = async () => {
    try {
        const result = await adminService.getUsers({ page: 1, pageSize: 100 });
        const users = result?.data?.users || result?.items || result || [];
        return users.map((u, i) => ({
            id: u.userId || u.id,
            name: u.name || u.userName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'Unknown',
            email: u.email || '',
            role: u.role || u.userType || u.userRole || u.roles?.[0] || 'unknown',
            status: u.status || (u.isDeleted ? 'banned' : u.isActive ? 'active' : 'inactive'),
            joinDate: u.createdAt || u.joinDate || null,
            lastActive: u.lastActive || u.lastLoginAt || null
        }));
    } catch (error) {
        return [];
    }
};

export const getJobsData = async () => {
    try {
        const response = await adminService.getJobsForModeration({ page: 1, pageSize: 100 });
        const jobs = response?.data?.jobs || response?.items || response || [];
        return jobs.map((j, i) => ({
            id: j.jobId || j.id,
            title: j.title || j.jobTitle || 'Untitled',
            company: j.company || j.companyName || j.postedByEmail || 'Unknown',
            type: j.type || j.jobType || 'Unspecified',
            status: j.status || (j.isDeleted ? 'deleted' : j.isActive ? 'active' : 'inactive'),
            postedDate: j.createdAt || j.postedDate || null,
            applications: j.applications || j.applicationsCount || 0,
            reports: j.reports || j.reportsCount || 0
        }));
    } catch (error) {
        return [];
    }
};

export const getReportsData = async () => {
    try {
        const response = await adminService.getPendingReports();
        const reports = response?.items || response || [];
        return reports.map((r, i) => ({
            id: r.reportId || r.id,
            type: r.entityType || r.type || r.targetType || 'Unknown',
            targetId: r.entityId || r.targetId || '',
            reason: r.reason || '',
            status: r.status || 'pending',
            date: r.createdAt || r.date || null,
            reporter: r.reporterName || r.reporter || r.reportedBy || 'Unknown'
        }));
    } catch (error) {
        return [];
    }
};

export const getActivitiesData = async () => {
    try {
        const response = await adminService.getActivities();
        const activities = response?.data?.activities || response?.activities || [];
        return activities.map((a, i) => ({
            id: a.id || a.activityId || i + 1,
            type: a.type || 'activity',
            user: a.user || a.userName || a.userEmail || (a.userId ? `User #${a.userId}` : 'System'),
            userId: a.userId || null,
            userEmail: a.userEmail || '',
            userType: a.userType || '',
            action: a.action || a.levelOrAction || a.description || '',
            details: a.details || a.message || a.metadata || '',
            ipAddress: a.ipAddress || null,
            time: a.time || a.timestamp || a.createdAt || null,
            timestamp: a.timestamp || a.createdAt || null
        }));
    } catch (error) {
        return [];
    }
};

export const getPendingActionsData = async () => {
    try {
        const response = await adminService.getPendingActions();
        const items = response?.data?.items || response?.items || response || [];
        return items.map((item, i) => ({
            id: item.userId || item.id || i + 1,
            title: item.title || item.name || item.email || `Pending item #${i + 1}`,
            count: item.count || 1,
            priority: item.priority || 'medium'
        }));
    } catch (error) {
        return [];
    }
};

export const getHealthData = async () => {
    try {
        const result = await adminService.getHealth();
        const metrics = result?.data || result || {};
        return {
            uptime: metrics?.uptime || "N/A",
            api: { status: metrics?.api || "operational", latency: metrics?.avgResponseTime || "N/A" },
            database: { status: metrics?.database || "operational", load: metrics?.dbLoad || "N/A" },
            storage: { status: "operational", usage: metrics?.storageUsage || "N/A" }
        };
    } catch (error) {
        return {
            uptime: "N/A", api: { status: "unknown", latency: "N/A" },
            database: { status: "unknown", load: "N/A" },
            storage: { status: "unknown", usage: "N/A" }
        };
    }
};

export const getSubscriptionsData = async () => {
    try {
        const response = await adminService.getSubscriptions();
        const subscriptions = response?.data || response?.items || [];
        return subscriptions.map((s, i) => ({
            id: s.subscriptionId || s.id,
            user: s.user || s.userName || s.userEmail || null,
            plan: s.plan || s.planName || s.planId || 'Current plan',
            status: s.status || (s.isActive ? 'active' : 'cancelled'),
            amount: s.amount || s.price || s.nextBillingAmount || 0,
            nextBilling: s.nextBilling || s.nextBillingDate || s.renewDate || s.endDate || '-',
            users: s.users || s.seats || 1,
            startDate: s.startDate || s.currentPeriodStart || '-',
            paymentMethod: s.paymentMethod || 'card',
            invoiceId: s.invoiceId || null
        }));
    } catch (error) {
        return [];
    }
};

export const getStaffData = async () => {
    try {
        const response = await adminService.getUsers();
        const users = response?.data?.users || response?.items || response || [];
        return users
            .filter(u => u.role === 'admin' || u.userType === 'Admin' || u.userType === 'admin' || u.roles?.includes('Admin'))
            .map((u, i) => ({
                id: u.userId || u.id,
                name: u.name || u.userName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'Unknown',
                email: u.email || '',
                role: u.role || u.userType || 'Admin',
                lastLogin: u.lastActive || u.lastLogin || 'N/A',
                status: u.status || (u.isActive ? 'active' : 'inactive'),
                permissions: u.permissions || []
            }));
    } catch (error) {
        return [];
    }
};

export const getUserGrowthData = async () => {
    try {
        const result = await adminService.getMonthlyAnalytics(12);
        return result?.data?.userGrowth || [];
    } catch (error) {
        return [];
    }
};

export const getRevenueData = async () => {
    try {
        const result = await adminService.getMonthlyAnalytics(12);
        return result?.data?.revenue || [];
    } catch (error) {
        return [];
    }
};

export const getJobPostingsData = async () => {
    try {
        const result = await adminService.getMonthlyAnalytics(12);
        return result?.data?.jobPostings || [];
    } catch (error) {
        return [];
    }
};
