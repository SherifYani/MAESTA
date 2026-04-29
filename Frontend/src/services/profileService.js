/**
 * @file profileService.js
 * @description Profile services - handles user profiles for all roles (jobseeker, freelancer, company, client)
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 05-02-2026
**/

import ApiService from './ApiService';

const profileService = {
    // ==================== General Profile Operations ====================

    // Get current user profile
    getMyProfile: async () => {
        try {
            const response = await ApiService.get('/api/profile/me');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get profile by user ID
    getProfileById: async (userId) => {
        try {
            const response = await ApiService.get(`/api/profile/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update profile
    updateProfile: async (profileData) => {
        try {
            const response = await ApiService.put('/api/profile/me', profileData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Upload profile picture
    uploadProfilePicture: async (file) => {
        try {
            const formData = new FormData();
            formData.append('profilePicture', file);

            const response = await ApiService.post('/api/profile/picture', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete profile picture
    deleteProfilePicture: async () => {
        try {
            const response = await ApiService.delete('/api/profile/picture');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // ==================== Jobseeker Profile ====================

    // Get jobseeker profile
    getJobseekerProfile: async (userId = null) => {
        try {
            const endpoint = userId
                ? `/api/jobseekers/${userId}`
                : '/api/jobseekers/me';
            const response = await ApiService.get(endpoint);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update jobseeker profile
    updateJobseekerProfile: async (profileData) => {
        try {
            const response = await ApiService.put('/api/jobseekers/me', profileData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update resume
    uploadResume: async (file) => {
        try {
            const formData = new FormData();
            formData.append('resume', file);

            const response = await ApiService.post('/api/jobseekers/resume', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Add work experience
    addWorkExperience: async (experienceData) => {
        try {
            const response = await ApiService.post('/api/jobseekers/experience', experienceData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update work experience
    updateWorkExperience: async (experienceId, experienceData) => {
        try {
            const response = await ApiService.put(`/api/jobseekers/experience/${experienceId}`, experienceData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete work experience
    deleteWorkExperience: async (experienceId) => {
        try {
            const response = await ApiService.delete(`/api/jobseekers/experience/${experienceId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Add education
    addEducation: async (educationData) => {
        try {
            const response = await ApiService.post('/api/jobseekers/education', educationData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update education
    updateEducation: async (educationId, educationData) => {
        try {
            const response = await ApiService.put(`/api/jobseekers/education/${educationId}`, educationData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete education
    deleteEducation: async (educationId) => {
        try {
            const response = await ApiService.delete(`/api/jobseekers/education/${educationId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update skills
    updateSkills: async (skills) => {
        try {
            const response = await ApiService.put('/api/jobseekers/skills', { skills });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // ==================== Freelancer Profile ====================

    // Get freelancer profile
    getFreelancerProfile: async (userId = null) => {
        try {
            const endpoint = userId
                ? `/api/freelancers/${userId}`
                : '/api/freelancers/me';
            const response = await ApiService.get(endpoint);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update freelancer profile
    updateFreelancerProfile: async (profileData) => {
        try {
            const response = await ApiService.put('/api/freelancers/me', profileData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Add portfolio item
    addPortfolioItem: async (portfolioData) => {
        try {
            const response = await ApiService.post('/api/freelancers/portfolio', portfolioData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update portfolio item
    updatePortfolioItem: async (portfolioId, portfolioData) => {
        try {
            const response = await ApiService.put(`/api/freelancers/portfolio/${portfolioId}`, portfolioData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete portfolio item
    deletePortfolioItem: async (portfolioId) => {
        try {
            const response = await ApiService.delete(`/api/freelancers/portfolio/${portfolioId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update hourly rate
    updateHourlyRate: async (hourlyRate) => {
        try {
            const response = await ApiService.put('/api/freelancers/rate', { hourlyRate });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // ==================== Company Profile ====================

    // Get company profile
    getCompanyProfile: async (companyId = null) => {
        try {
            const endpoint = companyId
                ? `/api/companies/${companyId}`
                : '/api/companies/me';
            const response = await ApiService.get(endpoint);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update company profile
    updateCompanyProfile: async (profileData) => {
        try {
            const response = await ApiService.put('/api/companies/me', profileData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Upload company logo
    uploadCompanyLogo: async (file) => {
        try {
            const formData = new FormData();
            formData.append('logo', file);

            const response = await ApiService.post('/api/companies/logo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Add team member
    addTeamMember: async (memberData) => {
        try {
            const response = await ApiService.post('/api/companies/team', memberData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Remove team member
    removeTeamMember: async (memberId) => {
        try {
            const response = await ApiService.delete(`/api/companies/team/${memberId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // ==================== Client Profile ====================

    // Get client profile
    getClientProfile: async (clientId = null) => {
        try {
            const endpoint = clientId
                ? `/api/clients/${clientId}`
                : '/api/clients/me';
            const response = await ApiService.get(endpoint);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update client profile
    updateClientProfile: async (profileData) => {
        try {
            const response = await ApiService.put('/api/clients/me', profileData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // ==================== Profile Visibility & Settings ====================

    // Update profile visibility
    updateVisibility: async (isPublic) => {
        try {
            const response = await ApiService.put('/api/profile/visibility', { isPublic });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update notification preferences
    updateNotificationPreferences: async (preferences) => {
        try {
            const response = await ApiService.put('/api/profile/notifications', preferences);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Deactivate account
    deactivateAccount: async () => {
        try {
            const response = await ApiService.post('/api/profile/deactivate');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete account
    deleteAccount: async (password) => {
        try {
            const response = await ApiService.delete('/api/profile/delete', { data: { password } });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default profileService;
