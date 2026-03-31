/**
 * @file gigService.js
 * @description Gig/Project management services - handles freelance projects, proposals, and contracts
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 05-02-2026
**/

import ApiService from './ApiService';
import { gigsData, gigCategories, gigSkills } from '../pages/gigs/config/gigsMockData';

const gigService = {
    // ==================== Gig CRUD Operations ====================

    // Get all gigs with filters
    // Get all gigs with filters
    // Get all gigs with filters
    getGigs: async (filters = {}) => {
        // Reuse search logic for filtering
        return gigService.searchGigs(filters);
    },

    // Get single gig by ID
    // Get single gig by ID
    getGigById: async (gigId) => {
        // MOCK DATA RETURN
        const gig = gigsData.find(g => g.id === gigId) || gigsData[0];
        return { data: gig };
    },

    // Create new gig/project (client)
    createGig: async (gigData) => {
        try {
            const response = await ApiService.post('/api/gigs', gigData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update gig
    updateGig: async (gigId, gigData) => {
        try {
            const response = await ApiService.put(`/api/gigs/${gigId}`, gigData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete gig
    deleteGig: async (gigId) => {
        try {
            const response = await ApiService.delete(`/api/gigs/${gigId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // ==================== Gig Search & Discovery ====================

    // Search gigs
    // Search gigs
    // Search gigs
    searchGigs: async (searchParams) => {
        // MOCK DATA RETURN WITH CLIENT-SIDE FILTERING
        let filteredGigs = [...gigsData];
        const {
            search,
            budget,
            duration,
            skills,
            experienceLevel,
            page = 1,
            limit = 10
        } = searchParams;

        if (search) {
            const lowerSearch = search.toLowerCase();
            filteredGigs = filteredGigs.filter(gig =>
                gig.title.toLowerCase().includes(lowerSearch) ||
                gig.description.toLowerCase().includes(lowerSearch) ||
                gig.client.name.toLowerCase().includes(lowerSearch) ||
                gig.skills.some(skill => skill.toLowerCase().includes(lowerSearch))
            );
        }

        if (budget && (budget.min || budget.max)) {
            filteredGigs = filteredGigs.filter(gig => {
                const gigMin = gig.budget?.min || 0;
                const gigMax = gig.budget?.max || Infinity;
                const filterMin = parseInt(budget.min) || 0;
                const filterMax = parseInt(budget.max) || Infinity;

                // Check for overlap
                return gigMax >= filterMin && gigMin <= filterMax;
            });
        }

        if (duration) {
            // Exact match or contains
            filteredGigs = filteredGigs.filter(gig =>
                gig.duration.toLowerCase().includes(duration.toLowerCase())
            );
        }

        if (experienceLevel) {
            filteredGigs = filteredGigs.filter(gig =>
                gig.experienceLevel.toLowerCase().includes(experienceLevel.toLowerCase())
            );
        }

        if (skills && skills.length > 0) {
            filteredGigs = filteredGigs.filter(gig =>
                skills.every(filterSkill =>
                    gig.skills.some(gigSkill => gigSkill.toLowerCase() === filterSkill.toLowerCase())
                )
            );
        }

        // Pagination
        const total = filteredGigs.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const paginatedGigs = filteredGigs.slice(startIndex, startIndex + limit);

        return {
            data: paginatedGigs,
            total,
            totalPages
        };
    },

    // Get recommended gigs for freelancer
    // Get recommended gigs for freelancer
    getRecommendedGigs: async () => {
        return gigsData.slice(0, 3);
    },

    // Get gigs by category
    getGigsByCategory: async (categoryId) => {
        try {
            const response = await ApiService.get(`/api/gigs/category/${categoryId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // ==================== Proposals ====================

    // Submit proposal (freelancer)
    submitProposal: async (gigId, proposalData) => {
        try {
            const response = await ApiService.post(`/api/gigs/${gigId}/proposals`, proposalData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get my proposals (freelancer)
    getMyProposals: async () => {
        try {
            const response = await ApiService.get('/api/proposals/my');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get proposals for a gig (client)
    getGigProposals: async (gigId) => {
        try {
            const response = await ApiService.get(`/api/gigs/${gigId}/proposals`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update proposal
    updateProposal: async (proposalId, proposalData) => {
        try {
            const response = await ApiService.put(`/api/proposals/${proposalId}`, proposalData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Withdraw proposal
    withdrawProposal: async (proposalId) => {
        try {
            const response = await ApiService.delete(`/api/proposals/${proposalId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Accept proposal (client)
    acceptProposal: async (proposalId) => {
        try {
            const response = await ApiService.post(`/api/proposals/${proposalId}/accept`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Reject proposal (client)
    rejectProposal: async (proposalId) => {
        try {
            const response = await ApiService.post(`/api/proposals/${proposalId}/reject`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // ==================== Contracts ====================

    // Create contract from accepted proposal
    createContract: async (proposalId, contractData) => {
        try {
            const response = await ApiService.post(`/api/proposals/${proposalId}/contract`, contractData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get my contracts
    getMyContracts: async () => {
        try {
            const response = await ApiService.get('/api/contracts/my');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get contract by ID
    getContractById: async (contractId) => {
        try {
            const response = await ApiService.get(`/api/contracts/${contractId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update contract status
    updateContractStatus: async (contractId, status) => {
        try {
            const response = await ApiService.put(`/api/contracts/${contractId}/status`, { status });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // ==================== Milestones ====================

    // Add milestone to contract
    addMilestone: async (contractId, milestoneData) => {
        try {
            const response = await ApiService.post(`/api/contracts/${contractId}/milestones`, milestoneData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update milestone
    updateMilestone: async (milestoneId, milestoneData) => {
        try {
            const response = await ApiService.put(`/api/milestones/${milestoneId}`, milestoneData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Complete milestone
    completeMilestone: async (milestoneId) => {
        try {
            const response = await ApiService.post(`/api/milestones/${milestoneId}/complete`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Approve milestone (client)
    approveMilestone: async (milestoneId) => {
        try {
            const response = await ApiService.post(`/api/milestones/${milestoneId}/approve`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // ==================== Client Gig Management ====================

    // Get client's posted gigs
    getClientGigs: async () => {
        try {
            const response = await ApiService.get('/api/gigs/my-postings');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get gig statistics
    getGigStatistics: async (gigId) => {
        try {
            const response = await ApiService.get(`/api/gigs/${gigId}/statistics`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // ==================== Categories ====================

    // Get gig categories
    // Get gig categories
    getCategories: async () => {
        return gigCategories;
    },

    // Get skills list
    // Get skills list
    getSkills: async () => {
        return gigSkills;
    },

    // ==================== Context Compatibility Adapters ====================

    // Adapter for submitBid
    submitBid: async (gigId, bidData) => {
        return gigService.submitProposal(gigId, bidData);
    },

    // Adapter for getGigBids
    getGigBids: async (gigId) => {
        return gigService.getGigProposals(gigId);
    },

    // Adapter for decideOnBid
    decideOnBid: async (bidId, decision) => {
        // decision: { status: 'accepted' | 'rejected', ... }
        if (decision.status === 'accepted') {
            return gigService.acceptProposal(bidId);
        } else if (decision.status === 'rejected') {
            return gigService.rejectProposal(bidId);
        }
        throw new Error('Invalid decision status');
    },

    // Get workspace data (gig + active contract + milestones + chat)
    getWorkspace: async (gigId) => {
        try {
            // In a real app, this might be a specific endpoint aggregating data
            const response = await ApiService.get(`/api/gigs/${gigId}/workspace`);
            return response.data;
        } catch (error) {
            // Fallback mock if endpoint missing during dev
            console.warn("Fetching mock workspace data");
            return {
                data: {
                    id: gigId,
                    title: "Mock Workspace Gig",
                    milestones: [],
                    messages: [],
                    files: [],
                    participants: []
                }
            };
            // throw error.response?.data || error.message;
        }
    },

    // Get user gigs (unified)
    getUserGigs: async (userType, status) => {
        try {
            let endpoint = '';
            if (userType === 'client') {
                endpoint = '/api/gigs/my-postings';
            } else {
                endpoint = '/api/proposals/my'; // Or a dedicated /api/gigs/my-jobs for freelancers
            }

            const response = await ApiService.get(endpoint, { params: { status } });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default gigService;
