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
// Mock data removed - fetching from API

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
            throw error;
        }
    },

    // Get proposals for a gig (client)
    getGigProposals: async (gigId) => {
        try {
            const response = await ApiService.get(`/api/gigs/${gigId}/proposals`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update proposal status
    updateProposal: async (proposalId, proposalData) => {
        try {
            const status = proposalData?.status || proposalData;
            const response = await ApiService.put(`/api/gigs/proposals/${proposalId}/status`,
                JSON.stringify(status),
                { headers: { 'Content-Type': 'application/json' } }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Withdraw proposal
    withdrawProposal: async (proposalId) => {
        try {
            const response = await ApiService.delete(`/api/gigs/proposals/${proposalId}`);
            return response.data;
        } catch (error) {
            throw error;
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
            throw error;
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
            throw error;
        }
    },

    // ==================== Contracts ====================

    // Create contract from accepted proposal
    createContract: async (proposalId, contractData) => {
        try {
            const response = await ApiService.post(`/api/contracts`, { proposalId, ...contractData });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get my contracts
    getMyContracts: async () => {
        try {
            const response = await ApiService.get('/api/contracts/my-contracts');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get contract by ID
    getContractById: async (contractId) => {
        try {
            const response = await ApiService.get(`/api/contracts/${contractId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update contract status is not supported by the current backend API.
    updateContractStatus: async () => {
        throw new Error('Updating contract status is not supported by the current backend API.');
    },

    // ==================== Milestones ====================

    // Add milestone is not supported after contract creation by the current backend API.
    addMilestone: async () => {
        throw new Error('Adding milestones after contract creation is not supported by the current backend API.');
    },

    // Update milestone status
    updateMilestone: async (milestoneId, milestoneData) => {
        try {
            const status = milestoneData?.status || milestoneData;
            const response = await ApiService.put(`/api/contracts/milestones/${milestoneId}/status`,
                JSON.stringify(status),
                { headers: { 'Content-Type': 'application/json' } }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Complete contract delivery
    completeMilestone: async (contractId, deliveryData = {}) => {
        try {
            const response = await ApiService.post(`/api/contracts/${contractId}/deliver`, {
                fileUrl: deliveryData.fileUrl || deliveryData.url || '',
                message: deliveryData.message || deliveryData.description || 'Delivery submitted'
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Approve milestone (client) — maps to approve delivery
    approveMilestone: async (milestoneId) => {
        try {
            const response = await ApiService.put(`/api/contracts/deliveries/${milestoneId}/approve`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // ==================== Client Gig Management ====================

    // Get client's posted gigs
    getClientGigs: async () => {
        try {
            const response = await ApiService.get('/api/gigs/my-gigs');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get gig statistics
    getGigStatistics: async (gigId) => {
        try {
            const [gigRes, proposalsRes] = await Promise.all([
                ApiService.get(`/api/gigs/${gigId}`),
                ApiService.get(`/api/gigs/${gigId}/proposals`)
            ]);
            const gig = gigRes.data;
            const proposals = proposalsRes.data;
            return {
                views: 0,
                proposals: proposals?.length || 0,
                active: gig?.isActive ?? true
            };
        } catch (error) {
            throw error;
        }
    },

    // ==================== Categories ====================

    // Get gig categories
    getCategories: async () => {
        try {
            const response = await ApiService.get('/api/categories');
            return response.data;
        } catch (error) {
            console.error("Error fetching categories:", error);
            return [];
        }
    },

    // Get skills list (using autocomplete with empty term as a fallback if needed)
    getSkills: async (term = "") => {
        try {
            const response = await ApiService.get('/api/skills/autocomplete', { params: { term } });
            return response.data;
        } catch (error) {
            console.error("Error fetching skills:", error);
            return [];
        }
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

    // Get workspace data (gig + related contract details when available)
    getWorkspace: async (gigId) => {
        try {
            const [gigResponse, contractsResponse] = await Promise.all([
                ApiService.get(`/api/gigs/${gigId}`),
                ApiService.get('/api/contracts/my-contracts')
            ]);

            const gig = gigResponse.data;
            const contracts = contractsResponse.data?.items || contractsResponse.data || [];
            const contract = contracts.find(c => String(c.projectId || c.gigId) === String(gigId));

            return {
                data: {
                    ...(gig?.data || gig),
                    id: gigId,
                    title: gig?.title || gig?.projectTitle || contract?.projectTitle || 'Workspace',
                    contract,
                    milestones: contract?.milestones || [],
                    messages: [],
                    files: [],
                    participants: [
                        contract?.clientName && { name: contract.clientName, role: 'client' },
                        contract?.freelancerName && { name: contract.freelancerName, role: 'freelancer' }
                    ].filter(Boolean)
                }
            };
        } catch (error) {
            throw error;
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
            throw error;
        }
    }
};

export default gigService;
