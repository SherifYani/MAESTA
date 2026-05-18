/**
 * @file gigService.js
 * @description Gig/Project management services - handles freelance projects, proposals, and contracts.
 *              Wired to the real JobMagnet API backend.
 * @author Sherif Talaat
 * @version 2.0.0
 * @date 2026-04-29
 *
 * @last-modified-by Antigravity (AI)
 * @last-modified-date 2026-04-29
**/

import ApiService from './ApiService';
// Mock data retained only for categories/skills until backend provides those endpoints
import { gigCategories, gigSkills } from '../pages/gigs/config/gigsMockData';

const gigService = {
    // ==================== Gig CRUD Operations ====================

    // Get all gigs with optional filters
    getGigs: async (filters = {}) => {
        const response = await ApiService.get('/api/gigs', { params: filters });
        return response.data;
    },

    // Get single gig by ID
    getGigById: async (gigId) => {
        const response = await ApiService.get(`/api/gigs/${gigId}`);
        return response.data;
    },

    // Create new gig/project (client)
    createGig: async (gigData) => {
        const response = await ApiService.post('/api/gigs', gigData);
        return response.data;
    },

    // Update gig
    updateGig: async (gigId, gigData) => {
        const response = await ApiService.put(`/api/gigs/${gigId}`, gigData);
        return response.data;
    },

    // Delete gig
    deleteGig: async (gigId) => {
        const response = await ApiService.delete(`/api/gigs/${gigId}`);
        return response.data;
    },

    // ==================== Gig Search & Discovery ====================

    // Search gigs — delegates filtering/sorting/pagination to the backend
    searchGigs: async (searchParams) => {
        const response = await ApiService.get('/api/gigs', { params: searchParams });
        return response.data;
    },

    // Get gigs posted by the authenticated client
    // Backend: GET api/gigs/my-gigs
    getMyGigs: async () => {
        const response = await ApiService.get('/api/gigs/my-gigs');
        return response.data;
    },

    // NOTE: /api/gigs/recommended and /api/gigs/category/{id} do not exist on
    // the real GigsController. Use getGigs() with filters instead.

    // ==================== Proposals ====================

    // Submit proposal (freelancer)
    submitProposal: async (gigId, proposalData) => {
        const response = await ApiService.post(`/api/gigs/${gigId}/proposals`, proposalData);
        return response.data;
    },

    // Get my proposals (freelancer)
    getMyProposals: async () => {
        try {
            const response = await ApiService.get('/api/gigs/proposals/my');
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
            // MOCKED: Not implemented in backend yet.
            console.warn("updateProposal is mocked");
            return { success: true, id: proposalId, ...proposalData };
            // const response = await ApiService.put(`/api/proposals/${proposalId}`, proposalData);
            // return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Withdraw proposal
    withdrawProposal: async (proposalId) => {
        try {
            const response = await ApiService.delete(`/api/gigs/proposals/${proposalId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Accept proposal (client)
    acceptProposal: async (proposalId) => {
        try {
            const response = await ApiService.put(`/api/gigs/proposals/${proposalId}/status`, 
                JSON.stringify("accepted"), 
                { headers: { 'Content-Type': 'application/json' } }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Reject proposal (client)
    rejectProposal: async (proposalId) => {
        try {
            const response = await ApiService.put(`/api/gigs/proposals/${proposalId}/status`, 
                JSON.stringify("rejected"), 
                { headers: { 'Content-Type': 'application/json' } }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // ==================== Contracts ====================

    // Create contract from accepted proposal
    createContract: async (proposalId, contractData) => {
        try {
            const response = await ApiService.post(`/api/contracts`, { proposalId, ...contractData });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get my contracts
    getMyContracts: async () => {
        try {
            const response = await ApiService.get('/api/contracts/my-contracts');
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
            // MOCKED: Not implemented in backend yet. Use milestone/delivery status instead.
            console.warn("updateContractStatus is mocked");
            return { success: true, id: contractId, status };
            // const response = await ApiService.put(`/api/contracts/${contractId}/status`, { status });
            // return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // ==================== Milestones ====================

    // Add milestone to contract
    addMilestone: async (contractId, milestoneData) => {
        try {
            // MOCKED: Not implemented in backend yet.
            console.warn("addMilestone is mocked");
            return { success: true, id: Math.floor(Math.random() * 1000), ...milestoneData };
            // const response = await ApiService.post(`/api/contracts/${contractId}/milestones`, milestoneData);
            // return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update milestone
    updateMilestone: async (milestoneId, milestoneData) => {
        try {
            // MOCKED: Not implemented in backend yet.
            console.warn("updateMilestone is mocked");
            return { success: true, id: milestoneId, ...milestoneData };
            // const response = await ApiService.put(`/api/milestones/${milestoneId}`, milestoneData);
            // return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Complete milestone
    completeMilestone: async (milestoneId) => {
        try {
            // MOCKED: Not implemented in backend yet. 
            // In the future this might map to submitDelivery or updateMilestoneStatus
            console.warn("completeMilestone is mocked");
            return { success: true, id: milestoneId, status: 'completed' };
            // const response = await ApiService.post(`/api/milestones/${milestoneId}/complete`);
            // return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Approve milestone (client)
    approveMilestone: async (milestoneId) => {
        try {
            // MOCKED: Not implemented in backend yet.
            console.warn("approveMilestone is mocked");
            return { success: true, id: milestoneId, status: 'approved' };
            // const response = await ApiService.post(`/api/milestones/${milestoneId}/approve`);
            // return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // ==================== Client Gig Management ====================

    // Get client's posted gigs
    getClientGigs: async () => {
        try {
            const response = await ApiService.get('/api/gigs/my-gigs');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get gig statistics
    getGigStatistics: async (gigId) => {
        try {
            // MOCKED: Not implemented in backend yet.
            console.warn("getGigStatistics is mocked");
            return { views: 0, proposals: 0, active: true };
            // const response = await ApiService.get(`/api/gigs/${gigId}/statistics`);
            // return response.data;
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
                endpoint = '/api/gigs/my-gigs';
            } else {
                endpoint = '/api/gigs/proposals/my'; // Or a dedicated /api/gigs/my-jobs for freelancers
            }

            const response = await ApiService.get(endpoint, { params: { status } });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default gigService;
