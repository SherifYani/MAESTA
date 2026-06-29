/**
 * @file exportService.js
 * @description Client-side exports built from existing backend data endpoints.
 */
import jobService from './jobService';
import dashboardService from './dashboardService';

const EXPORT_TYPES = [
    { id: 'applicants', name: 'Applicants', description: 'All applicants for company jobs' },
    { id: 'jobs', name: 'Jobs', description: 'All published job postings' },
    { id: 'analytics', name: 'Analytics', description: 'Job performance and application analytics' },
    { id: 'applications', name: 'Applications', description: 'All job applications received' },
];

const exportsById = new Map();

const toRows = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.jobs)) return data.jobs;
    if (Array.isArray(data?.applications)) return data.applications;
    return data ? [data] : [];
};

const filterRows = (rows, filters = {}, dateRange = {}) => rows.filter((row) => {
    if (filters.status && filters.status !== 'all' && (row.status || '').toLowerCase() !== filters.status.toLowerCase()) return false;
    if (filters.jobId && filters.jobId !== 'all' && String(row.jobId || row.id) !== String(filters.jobId)) return false;

    const rowDate = row.appliedAt || row.createdAt || row.postedDate || row.generatedAt;
    if (!rowDate) return true;

    const date = new Date(rowDate);
    if (dateRange?.startDate && date < new Date(dateRange.startDate)) return false;
    if (dateRange?.endDate && date > new Date(dateRange.endDate)) return false;
    return true;
});

const downloadJson = (fileName, data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
};

const loadExportData = async (exportType) => {
    switch (exportType) {
        case 'applicants':
        case 'applications':
            return jobService.getCompanyApplicants();
        case 'jobs':
            return jobService.getCompanyJobs();
        case 'analytics':
            return dashboardService.getCompanyAnalytics();
        default:
            throw new Error(`Unsupported export type: ${exportType}`);
    }
};

export const getExportTypes = async () => ({ success: true, data: EXPORT_TYPES });

export const generateExport = async (exportType, dateRange, filters, format = 'json') => {
    const data = await loadExportData(exportType);
    const rows = filterRows(toRows(data), filters, dateRange);
    const exportId = `${exportType}_${Date.now()}`;
    const exportData = {
        exportId,
        exportType,
        dateRange,
        filters,
        format,
        generatedAt: new Date().toISOString(),
        recordCount: rows.length,
        data: rows,
    };

    exportsById.set(exportId, exportData);
    return { success: true, data: exportData };
};

const convertArrayToCsv = (items) => {
    if (!items || !items.length) return '';
    const headers = Object.keys(items[0]);
    const headerRow = headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',');
    const rows = items.map(item =>
        headers.map(h => {
            const val = item[h] ?? '';
            return `"${String(val).replace(/"/g, '""')}"`;
        }).join(',')
    );
    return headerRow + '\n' + rows.join('\n');
};

const downloadBlob = (fileName, data, mimeType) => {
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
};

export const downloadExport = async (exportId, format) => {
    const exportData = exportsById.get(exportId);
    if (!exportData) throw new Error('Export data is no longer available. Generate it again.');

    const targetFormat = format || exportData.format || 'json';
    const filename = `${exportData.exportType}_${exportId}`;

    if (targetFormat === 'csv' || targetFormat === 'excel') {
        const csvContent = convertArrayToCsv(exportData.data);
        downloadBlob(`${filename}.csv`, csvContent, 'text/csv;charset=utf-8;');
    } else if (targetFormat === 'pdf') {
        // Fallback to CSV for PDF if no generator exists, or clean layout
        const csvContent = convertArrayToCsv(exportData.data);
        downloadBlob(`${filename}.csv`, csvContent, 'text/csv;charset=utf-8;');
    } else {
        downloadJson(`${filename}.json`, exportData.data);
    }
    return { success: true };
};

export const getExportHistory = async () => ({
    success: true,
    data: Array.from(exportsById.values()),
});

const exportService = {
    getExportTypes,
    generateExport,
    downloadExport,
    getExportHistory,
};

export default exportService;
