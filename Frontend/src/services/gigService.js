/**
 * @file gigService.js
 * @description Gig/Project management services - handles freelance projects, proposals, and contracts.
 *              Falls back to mock data when the backend is unavailable.
 * @author Sherif Talaat
 * @version 2.1.0
 * @date 2026-04-29
**/

import ApiService from './ApiService';
import {
    isNetworkError,
    MOCK_GIGS,
    MOCK_GIGS_RESPONSE,
    MOCK_PROPOSALS,
    MOCK_CONTRACTS,
    MOCK_CATEGORIES,
    MOCK_SKILLS,
} from './mockData';

const gigService = {
    // ==================== Gig CRUD Operations ====================

    // Get all gigs with optional filters
    getGigs: async (filters = {}) => {
        try {
            const response = await ApiService.get('/api/gigs', { params: filters });
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[gigService] getGigs — mock fallback');
                return MOCK_GIGS_RESPONSE;
            }
            throw error;
        }
    },

    // Get single gig by ID
    getGigById: async (gigId) => {
        try {
            const response = await ApiService.get(`/api/gigs/${gigId}`);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[gigService] getGigById — mock fallback');
                return MOCK_GIGS.find(g => g.id === gigId) || MOCK_GIGS[0];
            }
            throw error;
        }
    },

    // Create new gig/project (client)
    createGig: async (gigData) => {
        try {
            const response = await ApiService.post('/api/gigs', gigData);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[gigService] createGig — mock fallback');
                return { id: `gig-mock-${Date.now()}`, ...gigData, status: 'open', proposals: 0 };
            }
            throw error;
        }
    },

    // Update gig
    updateGig: async (gigId, gigData) => {
        try {
            const response = await ApiService.put(`/api/gigs/${gigId}`, gigData);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[gigService] updateGig — mock fallback');
                return { id: gigId, ...gigData };
            }
            throw error;
        }
    },

    // Delete gig
    deleteGig: async (gigId) => {
        try {
            const response = await ApiService.delete(`/api/gigs/${gigId}`);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[gigService] deleteGig — mock fallback');
                return { message: 'Gig deleted (mock).' };
            }
            throw error;
        }
    },

    // ==================== Gig Search & Discovery ====================

    // Search gigs — delegates filtering/sorting/pagination to the backend
    searchGigs: async (searchParams) => {
        try {
            const response = await ApiService.get('/api/gigs', { params: searchParams });
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[gigService] searchGigs — mock fallback');
                return MOCK_GIGS_RESPONSE;
            }
            throw error;
        }
    },

    // Get gigs posted by the authenticated client
    getMyGigs: async () => {
        try {
            const response = await ApiService.get('/api/gigs/my-gigs');
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[gigService] getMyGigs — mock fallback');
                return { items: MOCK_GIGS.slice(0, 2), totalItems: 2 };
            }
            throw error;
        }
    },

    // ==================== Proposals ====================

    // Submit proposal (freelancer)
    submitProposal: async (gigId, proposalData) => {
        try {
            const response = await ApiService.post(`/api/gigs/${gigId}/proposals`, proposalData);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[gigService] submitProposal — mock fallback');
                return {
                    id: `prop-mock-${Date.now()}`,
                    gigId,
                    ...proposalData,
                    status: 'pending',
                    submittedAt: new Date().toISOString(),
                };
            }
            throw error;
        }
    },

    // Get my proposals (freelancer)
    getMyProposals: async () => {
        try {
            const response = await ApiService.get('/api/gigs/proposals/my');
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[gigService] getMyProposals — mock fallback');
                return { items: MOCK_PROPOSALS, totalItems: MOCK_PROPOSALS.length };
            }
            throw error;
        }
    },

    // Get proposals for a gig (client)
    getGigProposals: async (gigId) => {
        try {
            const response = await ApiService.get(`/api/gigs/${gigId}/proposals`);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[gigService] getGigProposals — mock fallback');
                return { items: MOCK_PROPOSALS, totalItems: MOCK_PROPOSALS.length };
            }
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
            if (isNetworkError(error)) {
                console.warn('[gigService] updateProposal — mock fallback');
                return { id: proposalId, status: proposalData?.status || proposalData };
            }
            throw error;
        }
    },

    // Withdraw proposal
    withdrawProposal: async (proposalId) => {
        try {
            const response = await ApiService.delete(`/api/gigs/proposals/${proposalId}`);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[gigService] withdrawProposal — mock fallback');
                return { message: 'Proposal withdrawn (mock).' };
            }
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
            if (isNetworkError(error)) {
                console.warn('[gigService] acceptProposal — mock fallback');
                return { id: proposalId, status: 'accepted' };
            }
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
            if (isNetworkError(error)) {
                console.warn('[gigService] rejectProposal — mock fallback');
                return { id: proposalId, status: 'rejected' };
            }
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
            if (isNetworkError(error)) {
                console.warn('[gigService] createContract — mock fallback');
                return { id: `contract-mock-${Date.now()}`, proposalId, ...contractData, status: 'active' };
            }
            throw error;
        }
    },

    // Get my contracts
    getMyContracts: async () => {
        try {
            const response = await ApiService.get('/api/contracts/my-contracts');
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[gigService] getMyContracts — mock fallback');
                return { items: MOCK_CONTRACTS, totalItems: MOCK_CONTRACTS.length };
            }
            throw error;
        }
    },

    // Get contract by ID
    getContractById: async (contractId) => {
        try {
            const response = await ApiService.get(`/api/contracts/${contractId}`);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[gigService] getContractById — mock fallback');
                return MOCK_CONTRACTS.find(c => c.id === contractId) || MOCK_CONTRACTS[0];
            }
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
            if (isNetworkError(error)) {
                console.warn('[gigService] updateMilestone — mock fallback');
                return { id: milestoneId, status: milestoneData?.status || milestoneData };
            }
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
            if (isNetworkError(error)) {
                console.warn('[gigService] completeMilestone — mock fallback');
                return { message: 'Delivery submitted (mock).' };
            }
            throw error;
        }
    },

    // Approve milestone (client) — maps to approve delivery
    approveMilestone: async (milestoneId) => {
        try {
            const response = await ApiService.put(`/api/contracts/deliveries/${milestoneId}/approve`);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[gigService] approveMilestone — mock fallback');
                return { id: milestoneId, status: 'approved' };
            }
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
            if (isNetworkError(error)) {
                console.warn('[gigService] getClientGigs — mock fallback');
                return { items: MOCK_GIGS, totalItems: MOCK_GIGS.length };
            }
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
            console.warn('[gigService] getGigStatistics — mock fallback');
            return { views: 0, proposals: 0, active: true };
        }
    },

    // ==================== Categories ====================

    // Get gig categories
    getCategories: async () => {
        try {
            const response = await ApiService.get('/api/categories');
            return response.data;
        } catch (error) {
            console.warn('[gigService] getCategories — mock fallback');
            return MOCK_CATEGORIES;
        }
    },

    // Get skills list (using autocomplete with empty term as a fallback if needed)
    getSkills: async (term = "") => {
        try {
            const response = await ApiService.get('/api/skills/autocomplete', { params: { term } });
            return response.data;
        } catch (error) {
            console.warn('[gigService] getSkills — mock fallback');
            const lc = term.toLowerCase();
            return lc
                ? MOCK_SKILLS.filter(s => s.toLowerCase().includes(lc))
                : MOCK_SKILLS;
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
            if (isNetworkError(error)) {
                console.warn('[gigService] getWorkspace — mock fallback');
                const mockContract = MOCK_CONTRACTS[0];
                return {
                    data: {
                        id: gigId,
                        title: mockContract.projectTitle,
                        contract: mockContract,
                        milestones: mockContract.milestones,
                        messages: [],
                        files: [],
                        participants: [
                            { name: mockContract.clientName, role: 'client' },
                            { name: mockContract.freelancerName, role: 'freelancer' },
                        ]
                    }
                };
            }
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
                endpoint = '/api/gigs/proposals/my';
            }

            const response = await ApiService.get(endpoint, { params: { status } });
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[gigService] getUserGigs — mock fallback');
                return userType === 'client'
                    ? { items: MOCK_GIGS, totalItems: MOCK_GIGS.length }
                    : { items: MOCK_PROPOSALS, totalItems: MOCK_PROPOSALS.length };
            }
            throw error;
        }
    }
};

export default gigService;
