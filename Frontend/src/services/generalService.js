/**
 * @file generalService.js
 * @description General public API services (stats, autocomplete, categories).
 * @author Antigravity (AI)
 * @date 2026-05-09
 */

import ApiService from './ApiService';

export const getPublicStats = async () => {
    const response = await ApiService.get('/api/stats/public');
    return response.data;
};

export const getCategories = async () => {
    const response = await ApiService.get('/api/categories');
    return response.data;
};

export const autocompleteSkills = async (term) => {
    const response = await ApiService.get('/api/skills/autocomplete', { params: { term } });
    return response.data;
};

export const autocompleteLocations = async (term) => {
    const response = await ApiService.get('/api/locations/autocomplete', { params: { term } });
    return response.data;
};

export const getPublicCompany = async (companyId) => {
    const response = await ApiService.get(`/api/companies/${companyId}/public`);
    return response.data;
};

export const searchCompanies = async (query) => {
    const response = await ApiService.get('/api/companies/search', { params: { query } });
    return response.data;
};

const generalService = {
    getPublicStats,
    getCategories,
    autocompleteSkills,
    autocompleteLocations,
    getPublicCompany,
    searchCompanies
};

export default generalService;
