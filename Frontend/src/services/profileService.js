/**
 * @file profileService.js
 * @description Profile services - handles user profiles for all roles (jobseeker, freelancer, company, client)
 * @author Sherif Talaat
 * @version 1.1.0
 * @date 05-02-2026
 *
 * @last-modified-by Antigravity
 * @last-modified-date 2026-05-27
 *
 * @update:
 * - Standardized all catch blocks to always throw Error objects (never raw objects or strings)
 *   so callers can reliably read err.message.
**/

import ApiService from './ApiService';

/**
 * Extracts a human-readable error message from an Axios error.
 * Prefers the backend response message, then falls back to the JS error message.
 * @param {unknown} error - The caught error value.
 * @returns {string} A user-friendly error message.
 */
const extractErrorMessage = (error) => {
    const errorData = error?.response?.data;
    if (typeof errorData === 'object' && errorData !== null && errorData.message) {
        return errorData.message;
    }
    return error?.message || 'An unexpected error occurred';
};

const profileService = {
    // ==================== General Profile Operations ====================

    // Get current user profile
    getMyProfile: async () => {
        try {
            const response = await ApiService.get('/api/Profile/me');
            return response.data;
        } catch (error) {
            throw new Error(extractErrorMessage(error));
        }
    },

    // Get profile by user ID
    getProfileById: async (userId) => {
        try {
            const response = await ApiService.get(`/api/Profile/${userId}`);
            return response.data;
        } catch (error) {
            throw new Error(extractErrorMessage(error));
        }
    },

    // Update profile
    updateProfile: async (profileData) => {
        try {
            const response = await ApiService.put('/api/Profile/me', profileData);
            return response.data;
        } catch (error) {
            throw new Error(extractErrorMessage(error));
        }
    },

    // Upload profile picture
    uploadProfilePicture: async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('bucketName', 'avatars');

            const response = await ApiService.post('/api/Files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            throw new Error(extractErrorMessage(error));
        }
    },

    // Delete profile picture
    deleteProfilePicture: async (fileName) => {
        try {
            if (!fileName) throw new Error("fileName is required to delete profile picture");
            const response = await ApiService.delete(`/api/Files/avatars/${fileName}`);
            return response.data;
        } catch (error) {
            throw new Error(extractErrorMessage(error));
        }
    },

    // ==================== Jobseeker Profile ====================

    // Get jobseeker profile
    getJobseekerProfile: async (userId = null) => {
        try {
            const endpoint = userId
                ? `/api/JobSeeker/${userId}`
                : '/api/JobSeeker/me';
            const response = await ApiService.get(endpoint);
            return response.data;
        } catch (error) {
            throw new Error(extractErrorMessage(error));
        }
    },

    // Update jobseeker profile
    updateJobseekerProfile: async (profileData) => {
        try {
            const response = await ApiService.put('/api/JobSeeker/me', profileData);
            return response.data;
        } catch (error) {
            throw new Error(extractErrorMessage(error));
        }
    },

    uploadResume: async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('bucketName', 'resumes');

            const response = await ApiService.post('/api/Files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            throw new Error(extractErrorMessage(error));
        }
    },

    // Add work experience
    addWorkExperience: async (experienceData) => {
        try {
            const response = await ApiService.post('/api/JobSeeker/experience', experienceData);
            return response.data;
        } catch (error) {
            throw new Error(extractErrorMessage(error));
        }
    },

    // Update work experience
    updateWorkExperience: async (experienceId, experienceData) => {
        try {
            const response = await ApiService.put(`/api/JobSeeker/experience/${experienceId}`, experienceData);
            return response.data;
        } catch (error) {
            throw new Error(extractErrorMessage(error));
        }
    },

    // Delete work experience
    deleteWorkExperience: async (experienceId) => {
        try {
            const response = await ApiService.delete(`/api/JobSeeker/experience/${experienceId}`);
            return response.data;
        } catch (error) {
            throw new Error(extractErrorMessage(error));
        }
    },

    // Add education
    addEducation: async (educationData) => {
        try {
            const response = await ApiService.post('/api/JobSeeker/education', educationData);
            return response.data;
        } catch (error) {
            throw new Error(extractErrorMessage(error));
        }
    },

    // Update education
    updateEducation: async (educationId, educationData) => {
        try {
            const response = await ApiService.put(`/api/JobSeeker/education/${educationId}`, educationData);
            return response.data;
        } catch (error) {
            throw new Error(extractErrorMessage(error));
        }
    },

    // Delete education
    deleteEducation: async (educationId) => {
        try {
            const response = await ApiService.delete(`/api/JobSeeker/education/${educationId}`);
            return response.data;
        } catch (error) {
            throw new Error(extractErrorMessage(error));
        }
    },

    // Update skills
    updateSkills: async (skills) => {
        try {
            const response = await ApiService.put('/api/JobSeeker/skills', { skills });
            return response.data;
        } catch (error) {
            throw new Error(extractErrorMessage(error));
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
            throw new Error(extractErrorMessage(error));
        }
    },

    // Update freelancer profile
    updateFreelancerProfile: async (profileData) => {
        try {
            const response = await ApiService.put('/api/freelancers/me', profileData);
            return response.data;
        } catch (error) {
            throw new Error(extractErrorMessage(error));
        }
    },

    // Add portfolio item
    addPortfolioItem: async (portfolioData) => {
        try {
            const response = await ApiService.post('/api/freelancers/portfolio', portfolioData);
            return response.data;
        } catch (error) {
            throw new Error(extractErrorMessage(error));
        }
    },

    // Update portfolio item
    updatePortfolioItem: async (portfolioId, portfolioData) => {
        try {
            const response = await ApiService.put(`/api/freelancers/portfolio/${portfolioId}`, portfolioData);
            return response.data;
        } catch (error) {
            throw new Error(extractErrorMessage(error));
        }
    },

    // Delete portfolio item
    deletePortfolioItem: async (portfolioId) => {
        try {
            const response = await ApiService.delete(`/api/freelancers/portfolio/${portfolioId}`);
            return response.data;
        } catch (error) {
            throw new Error(extractErrorMessage(error));
        }
    },

    // Update hourly rate
    updateHourlyRate: async (hourlyRate) => {
        try {
            // Backend doesn't have a specific /rate endpoint.
            // Fetch current profile, merge the new rate, and update.
            const profile = await profileService.getFreelancerProfile();
            const updatedProfile = { ...profile, hourlyRate };
            const response = await ApiService.put('/api/freelancers/me', updatedProfile);
            return response.data;
        } catch (error) {
            throw new Error(extractErrorMessage(error));
        }
    },

    // ==================== Company Profile ====================

    // Get company profile
    getCompanyProfile: async (companyId = null) => {
        try {
            const endpoint = companyId
                ? `/api/Companies/${companyId}`
                : '/api/Companies/me';
            const response = await ApiService.get(endpoint);
            return response.data;
        } catch (error) {
            throw new Error(extractErrorMessage(error));
        }
    },

    // Update company profile
    updateCompanyProfile: async (profileData) => {
        try {
            const response = await ApiService.put('/api/Companies/me', profileData);
            return response.data;
        } catch (error) {
            throw new Error(extractErrorMessage(error));
        }
    },

    // Upload company logo
    uploadCompanyLogo: async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('bucketName', 'avatars');

            const response = await ApiService.post('/api/Files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            throw new Error(extractErrorMessage(error));
        }
    },

    // Add team member
    addTeamMember: async (memberData) => {
        try {
            const response = await ApiService.post('/api/Companies/team', memberData);
            return response.data;
        } catch (error) {
            throw new Error(extractErrorMessage(error));
        }
    },

    // Remove team member
    removeTeamMember: async (memberId) => {
        try {
            const response = await ApiService.delete(`/api/Companies/team/${memberId}`);
            return response.data;
        } catch (error) {
            throw new Error(extractErrorMessage(error));
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
            throw new Error(extractErrorMessage(error));
        }
    },

    // Update client profile
    updateClientProfile: async (profileData) => {
        try {
            const response = await ApiService.put('/api/clients/me', profileData);
            return response.data;
        } catch (error) {
            throw new Error(extractErrorMessage(error));
        }
    },

    // ==================== Profile Visibility & Settings ====================

    // Update profile visibility
    updateVisibility: async (isPublic) => {
        try {
            // MOCKED: Not implemented in backend yet.
            console.warn("updateVisibility is mocked");
            return { success: true, isPublic };
            // const response = await ApiService.put('/api/profile/visibility', { isPublic });
            // return response.data;
        } catch (error) {
            throw new Error(extractErrorMessage(error));
        }
    },

    // Update notification preferences
    updateNotificationPreferences: async (preferences) => {
        try {
            const response = await ApiService.put('/api/Profile/me/settings', preferences);
            return response.data;
        } catch (error) {
            throw new Error(extractErrorMessage(error));
        }
    },

    // Delete account
    deleteAccount: async (password) => {
        try {
            // Note: If backend DeleteAccount does not accept password in body, it may ignore it.
            const response = await ApiService.delete('/api/Profile/me', { data: { password } });
            return response.data;
        } catch (error) {
            throw new Error(extractErrorMessage(error));
        }
    }
};

export default profileService;
