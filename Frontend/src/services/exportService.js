/**
 * @file exportService.js
 * @description Export API service with mock data.
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 2026-05-04
 */
import ApiService from './ApiService';

const USE_MOCK_DATA = true;

const mockExportTypes = {
    success: true,
    data: [
        { id: 'applicants', name: 'Applicants', description: 'All applicants for company jobs' },
        { id: 'jobs', name: 'Jobs', description: 'All published job postings' },
        { id: 'analytics', name: 'Analytics', description: 'Job performance and application analytics' },
        { id: 'applications', name: 'Applications', description: 'All job applications received' },
    ],
};

export const getExportTypes = async () => {
    if (USE_MOCK_DATA) return mockExportTypes;
    const response = await ApiService.get('/api/company/export/types');
    return response.data;
};

export const generateExport = async (exportType, dateRange, filters, format) => {
    if (USE_MOCK_DATA) {
        return {
            success: true,
            data: {
                exportId: `export_${Date.now()}`,
                exportType,
                format,
                generatedAt: new Date().toISOString(),
                recordCount: 150,
                downloadUrl: `/mock-export/${exportType}.${format}`,
            },
        };
    }
    const response = await ApiService.post('/api/company/export/generate', { exportType, dateRange, filters, format });
    return response.data;
};

export const downloadExport = async (exportId) => {
    if (USE_MOCK_DATA) {
        window.open(`/mock-download/${exportId}`, '_blank');
        return { success: true };
    }
    const response = await ApiService.get(`/api/company/export/download/${exportId}`, { responseType: 'blob' });
    return response.data;
};

export const getExportHistory = async () => {
    if (USE_MOCK_DATA) return { success: true, data: [] };
    const response = await ApiService.get('/api/company/export/history');
    return response.data;
};