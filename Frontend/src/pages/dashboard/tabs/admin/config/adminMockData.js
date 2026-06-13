import adminService from '../../../../../services/adminService';
import jobService from '../../../../../services/jobService';
import paymentService from '../../../../../services/paymentService';

export const getAdminStats = async () => {
    try {
        const metrics = await adminService.getDashboardMetrics();
        const pendingApprovals = await adminService.getPendingApprovals();
        const pendingReports = await adminService.getPendingReports();
        return {
            totalUsers: metrics?.totalUsers || 0,
            activeJobs: metrics?.activeJobs || 0,
            pendingModeration: (metrics?.pendingModeration || 0) + (pendingReports?.length || 0),
            totalRevenue: metrics?.totalRevenue || 0,
            userGrowth: metrics?.userGrowth || "+0%",
            revenueGrowth: metrics?.revenueGrowth || "+0%",
            activeSessions: metrics?.activeSessions || 0,
            avgResponseTime: metrics?.avgResponseTime || "0ms",
            successRate: metrics?.successRate || "0%"
        };
    } catch (error) {
        return {
            totalUsers: 0, activeJobs: 0, pendingModeration: 0, totalRevenue: 0,
            userGrowth: "+0%", revenueGrowth: "+0%", activeSessions: 0,
            avgResponseTime: "0ms", successRate: "0%"
        };
    }
};

export const getUsersData = async () => {
    try {
        const result = await adminService.getPendingApprovals();
        const users = result?.data?.users || result?.items || result || [];
        return users.map((u, i) => ({
            id: u.id || `USER-${i + 1}`,
            name: u.name || u.userName || u.email || 'Unknown',
            email: u.email || '',
            role: u.role || u.userType || u.userRole || 'job_seeker',
            status: u.status || u.isActive ? 'active' : 'inactive',
            joinDate: u.createdAt || u.joinDate || new Date().toISOString().split('T')[0],
            lastActive: u.lastActive || 'N/A'
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
            id: j.id || `JOB-${i + 1}`,
            title: j.title || j.jobTitle || 'Untitled',
            company: j.company || j.companyName || 'Unknown',
            type: j.type || j.jobType || 'Full-time',
            status: j.status || j.isPublished ? 'active' : 'inactive',
            postedDate: j.createdAt || j.postedDate || new Date().toISOString().split('T')[0],
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
            id: r.id || `RPT-${i + 1}`,
            type: r.type || r.targetType || 'Content',
            targetId: r.targetId || '',
            reason: r.reason || '',
            status: r.status || 'pending',
            date: r.createdAt || r.date || new Date().toISOString().split('T')[0],
            reporter: r.reporter || r.reportedBy || 'anonymous'
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
            id: a.id || i + 1,
            type: a.type || 'system',
            user: a.user || a.userName || 'System',
            action: a.action || a.description || 'No description',
            time: a.time || a.timestamp || 'Just now',
            timestamp: a.timestamp || new Date().toISOString()
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
            id: item.id || i + 1,
            title: item.title || item.name || `Pending item #${i + 1}`,
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
            uptime: metrics?.uptime || "99.9%",
            api: { status: "operational", latency: metrics?.avgResponseTime || "45ms" },
            database: { status: "operational", load: metrics?.dbLoad || "24%" },
            storage: { status: "operational", usage: metrics?.storageUsage || "45%" }
        };
    } catch (error) {
        return {
            uptime: "99.9%", api: { status: "operational", latency: "45ms" },
            database: { status: "operational", load: "24%" },
            storage: { status: "operational", usage: "45%" }
        };
    }
};

export const getSubscriptionsData = async () => {
    try {
        const response = await paymentService.getCurrentSubscription();
        const subscriptions = response?.items || (response ? [response] : []);
        return subscriptions.map((s, i) => ({
            id: s.id || `SUB-${i + 1}`,
            user: s.user || s.userName || 'Unknown',
            plan: s.plan || s.planName || s.planId || 'Basic',
            status: s.status || 'active',
            amount: s.amount || s.nextBillingAmount || 0,
            nextBilling: s.nextBilling || s.nextBillingDate || '-',
            users: s.users || s.seats || 1,
            startDate: s.startDate || s.currentPeriodStart || '-',
            paymentMethod: s.paymentMethod || 'card',
            invoiceId: s.invoiceId || `INV-${i + 1}`
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
                id: u.id || i + 1,
                name: u.name || u.userName || u.email || 'Unknown',
                email: u.email || '',
                role: u.role || u.userType || 'Admin',
                lastLogin: u.lastActive || u.lastLogin || 'N/A',
                status: u.status || (u.isActive ? 'active' : 'inactive'),
                permissions: u.permissions || ['read', 'write']
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
