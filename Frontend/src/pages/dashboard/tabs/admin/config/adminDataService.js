import adminService from '../../../../../services/adminService';
import jobService from '../../../../../services/jobService';
import paymentService from '../../../../../services/paymentService';

export const getAdminStats = async () => {
    try {
        const metrics = await adminService.getDashboardMetrics();
        const pendingReports = await adminService.getPendingReports();
        return {
            totalUsers: metrics?.totalUsers || 0,
            activeJobs: metrics?.activeJobs || 0,
            pendingModeration: (metrics?.pendingModeration || 0) + (pendingReports?.length || 0),
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
        const result = await adminService.getPendingApprovals();
        const users = result?.data?.users || result?.items || result || [];
        return users.map((u, i) => ({
            id: u.userId || u.id,
            name: u.name || u.userName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'Unknown',
            email: u.email || '',
            role: u.role || u.userType || u.userRole || 'unknown',
            status: u.status || u.isActive ? 'active' : 'inactive',
            joinDate: u.createdAt || u.joinDate || null,
            lastActive: u.lastActive || u.lastLoginAt || null
        }));
    } catch (error) {
        return [];
    }
};

export const getJobsData = async () => {
    try {
        const response = await jobService.getJobs({ page: 1, limit: 50 });
        const jobs = response?.items || response || [];
        return jobs.map((j, i) => ({
            id: j.jobId || j.id,
            title: j.title || j.jobTitle || 'Untitled',
            company: j.company || j.companyName || 'Unknown',
            type: j.type || j.jobType || 'Unspecified',
            status: j.status || j.isPublished ? 'active' : 'inactive',
            postedDate: j.createdAt || j.postedDate || null,
            reports: j.reports || 0
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
            type: a.type || 'system',
            user: a.user || a.userName || null,
            action: a.action || a.description || '',
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
        const metrics = await adminService.getDashboardMetrics();
        return {
            uptime: metrics?.uptime || "N/A",
            api: { status: "operational", latency: metrics?.avgResponseTime || "N/A" },
            database: { status: "operational", load: metrics?.dbLoad || "N/A" },
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
        const response = await paymentService.getCurrentSubscription();
        const subscriptions = response?.items || (response ? [response] : []);
        return subscriptions.map((s, i) => ({
            id: s.subscriptionId || s.id,
            user: s.user || s.userName || null,
            plan: s.plan || s.planName || s.planId || 'Current plan',
            status: s.status || 'active',
            amount: s.amount || s.nextBillingAmount || 0,
            nextBilling: s.nextBilling || s.nextBillingDate || '-',
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
            .filter(u => u.role === 'admin' || u.userType === 'admin')
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
        const metrics = await adminService.getDashboardMetrics();
        return [
            { name: 'Total', users: metrics?.totalUsers || 0, newUsers: metrics?.newUsers || 0 }
        ];
    } catch (error) {
        return [{ name: 'Total', users: 0, newUsers: 0 }];
    }
};

export const getRevenueData = async () => {
    try {
        const metrics = await adminService.getDashboardMetrics();
        return [
            { name: 'Revenue', revenue: metrics?.totalRevenue || 0, profit: metrics?.profit || 0 }
        ];
    } catch (error) {
        return [{ name: 'Revenue', revenue: 0, profit: 0 }];
    }
};

export const getJobPostingsData = async () => {
    try {
        const response = await jobService.getJobs({ page: 1, limit: 50 });
        const jobs = response?.items || response || [];
        return [
            { name: 'Total', jobs: jobs.length, active: jobs.filter(j => j.isPublished).length }
        ];
    } catch (error) {
        return [{ name: 'Total', jobs: 0, active: 0 }];
    }
};
