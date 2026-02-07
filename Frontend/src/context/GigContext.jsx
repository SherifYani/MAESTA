/**
 * @file GigContext.jsx
 * @description Context provider for gigs (projects) management
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 05-02-2026
**/

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import gigService from '../services/gigService';

/**
 * @typedef {Object} GigState
 * @property {Array} gigs - List of gigs
 * @property {Object|null} currentGig - Currently selected gig
 * @property {Array} bids - Bids for current gig
 * @property {Array} userGigs - User's gigs
 * @property {Object|null} workspace - Current workspace data
 * @property {boolean} isLoading - Loading state
 * @property {string|null} error - Error message
 */

const initialState = {
    gigs: [],
    currentGig: null,
    bids: [],
    userGigs: [],
    workspace: null,
    isLoading: false,
    error: null
};

const GigContext = createContext();

/**
 * Gig actions enum
 */
const ACTIONS = {
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    SET_GIGS: 'SET_GIGS',
    SET_CURRENT_GIG: 'SET_CURRENT_GIG',
    SET_BIDS: 'SET_BIDS',
    SET_USER_GIGS: 'SET_USER_GIGS',
    SET_WORKSPACE: 'SET_WORKSPACE',
    ADD_GIG: 'ADD_GIG',
    UPDATE_GIG: 'UPDATE_GIG',
    DELETE_GIG: 'DELETE_GIG',
    ADD_BID: 'ADD_BID',
    UPDATE_BID: 'UPDATE_BID'
};

/**
 * Gig reducer function
 * @param {GigState} state - Current state
 * @param {Object} action - Action to perform
 * @returns {GigState} New state
 */
const gigReducer = (state, action) => {
    switch (action.type) {
        case ACTIONS.SET_LOADING:
            return { ...state, isLoading: action.payload };

        case ACTIONS.SET_ERROR:
            return { ...state, error: action.payload, isLoading: false };

        case ACTIONS.SET_GIGS:
            return { ...state, gigs: action.payload, isLoading: false };

        case ACTIONS.SET_CURRENT_GIG:
            return { ...state, currentGig: action.payload, isLoading: false };

        case ACTIONS.SET_BIDS:
            return { ...state, bids: action.payload, isLoading: false };

        case ACTIONS.SET_USER_GIGS:
            return { ...state, userGigs: action.payload, isLoading: false };

        case ACTIONS.SET_WORKSPACE:
            return { ...state, workspace: action.payload, isLoading: false };

        case ACTIONS.ADD_GIG:
            return { ...state, gigs: [...state.gigs, action.payload], isLoading: false };

        case ACTIONS.UPDATE_GIG:
            return {
                ...state,
                gigs: state.gigs.map(gig =>
                    gig.id === action.payload.id ? action.payload : gig
                ),
                currentGig: state.currentGig?.id === action.payload.id ? action.payload : state.currentGig,
                isLoading: false
            };

        case ACTIONS.DELETE_GIG:
            return {
                ...state,
                gigs: state.gigs.filter(gig => gig.id !== action.payload),
                currentGig: state.currentGig?.id === action.payload ? null : state.currentGig,
                isLoading: false
            };

        case ACTIONS.ADD_BID:
            return {
                ...state,
                bids: [...state.bids, action.payload],
                isLoading: false
            };

        case ACTIONS.UPDATE_BID:
            return {
                ...state,
                bids: state.bids.map(bid =>
                    bid.id === action.payload.id ? action.payload : bid
                ),
                isLoading: false
            };

        default:
            return state;
    }
};

/**
 * Gig provider component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Gig provider
 */
export const GigProvider = ({ children }) => {
    const [state, dispatch] = useReducer(gigReducer, initialState);

    /**
     * Set loading state
     * @param {boolean} loading - Loading state
     */
    const setLoading = useCallback((loading) => {
        dispatch({ type: ACTIONS.SET_LOADING, payload: loading });
    }, []);

    /**
     * Set error state
     * @param {string|null} error - Error message
     */
    const setError = useCallback((error) => {
        dispatch({ type: ACTIONS.SET_ERROR, payload: error });
    }, []);

    /**
     * Fetch gigs with optional filters
     * @param {Object} filters - Filter criteria
     * @param {number} page - Page number
     * @param {number} limit - Items per page
     */
    const fetchGigs = useCallback(async (filters = {}, page = 1, limit = 20) => {
        try {
            setLoading(true);
            setError(null);
            const response = await gigService.getGigs(filters, page, limit);
            dispatch({ type: ACTIONS.SET_GIGS, payload: response.data });
        } catch (error) {
            setError(error.message || 'Failed to fetch gigs');
        }
    }, [setLoading, setError]);

    /**
     * Fetch gig by ID
     * @param {string|number} gigId - Gig ID
     */
    const fetchGigById = useCallback(async (gigId) => {
        try {
            setLoading(true);
            setError(null);
            const response = await gigService.getGigById(gigId);
            dispatch({ type: ACTIONS.SET_CURRENT_GIG, payload: response.data });
        } catch (error) {
            setError(error.message || 'Failed to fetch gig');
        }
    }, [setLoading, setError]);

    /**
     * Create new gig
     * @param {Object} gigData - Gig data
     * @returns {Promise<Object>} Created gig
     */
    const createGig = useCallback(async (gigData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await gigService.createGig(gigData);
            dispatch({ type: ACTIONS.ADD_GIG, payload: response.data });
            return response.data;
        } catch (error) {
            setError(error.message || 'Failed to create gig');
            throw error;
        }
    }, [setLoading, setError]);

    /**
     * Update existing gig
     * @param {string|number} gigId - Gig ID
     * @param {Object} gigData - Updated gig data
     * @returns {Promise<Object>} Updated gig
     */
    const updateGig = useCallback(async (gigId, gigData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await gigService.updateGig(gigId, gigData);
            dispatch({ type: ACTIONS.UPDATE_GIG, payload: response.data });
            return response.data;
        } catch (error) {
            setError(error.message || 'Failed to update gig');
            throw error;
        }
    }, [setLoading, setError]);

    /**
     * Delete gig
     * @param {string|number} gigId - Gig ID
     */
    const deleteGig = useCallback(async (gigId) => {
        try {
            setLoading(true);
            setError(null);
            await gigService.deleteGig(gigId);
            dispatch({ type: ACTIONS.DELETE_GIG, payload: gigId });
        } catch (error) {
            setError(error.message || 'Failed to delete gig');
            throw error;
        }
    }, [setLoading, setError]);

    /**
     * Submit bid for gig
     * @param {string|number} gigId - Gig ID
     * @param {Object} bidData - Bid data
     * @returns {Promise<Object>} Created bid
     */
    const submitBid = useCallback(async (gigId, bidData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await gigService.submitBid(gigId, bidData);
            dispatch({ type: ACTIONS.ADD_BID, payload: response.data });
            return response.data;
        } catch (error) {
            setError(error.message || 'Failed to submit bid');
            throw error;
        }
    }, [setLoading, setError]);

    /**
     * Fetch bids for gig
     * @param {string|number} gigId - Gig ID
     */
    const fetchGigBids = useCallback(async (gigId) => {
        try {
            setLoading(true);
            setError(null);
            const response = await gigService.getGigBids(gigId);
            dispatch({ type: ACTIONS.SET_BIDS, payload: response.data });
        } catch (error) {
            setError(error.message || 'Failed to fetch bids');
        }
    }, [setLoading, setError]);

    /**
     * Accept or reject bid
     * @param {string|number} bidId - Bid ID
     * @param {Object} decision - Decision data
     * @returns {Promise<Object>} Updated bid
     */
    const decideOnBid = useCallback(async (bidId, decision) => {
        try {
            setLoading(true);
            setError(null);
            const response = await gigService.decideOnBid(bidId, decision);
            dispatch({ type: ACTIONS.UPDATE_BID, payload: response.data });
            return response.data;
        } catch (error) {
            setError(error.message || 'Failed to process bid decision');
            throw error;
        }
    }, [setLoading, setError]);

    /**
     * Fetch workspace data
     * @param {string|number} gigId - Gig ID
     */
    const fetchWorkspace = useCallback(async (gigId) => {
        try {
            setLoading(true);
            setError(null);
            const response = await gigService.getWorkspace(gigId);
            dispatch({ type: ACTIONS.SET_WORKSPACE, payload: response.data });
        } catch (error) {
            setError(error.message || 'Failed to fetch workspace');
        }
    }, [setLoading, setError]);

    /**
     * Fetch user's gigs
     * @param {string} userType - 'client' or 'freelancer'
     * @param {string} status - Filter by status
     */
    const fetchUserGigs = useCallback(async (userType = 'client', status = null) => {
        try {
            setLoading(true);
            setError(null);
            const response = await gigService.getUserGigs(userType, status);
            dispatch({ type: ACTIONS.SET_USER_GIGS, payload: response.data });
        } catch (error) {
            setError(error.message || 'Failed to fetch user gigs');
        }
    }, [setLoading, setError]);

    const value = {
        ...state,
        setLoading,
        setError,
        fetchGigs,
        fetchGigById,
        createGig,
        updateGig,
        deleteGig,
        submitBid,
        fetchGigBids,
        decideOnBid,
        fetchWorkspace,
        fetchUserGigs
    };

    return (
        <GigContext.Provider value={value}>
            {children}
        </GigContext.Provider>
    );
};

/**
 * Custom hook to use gig context
 * @returns {Object} Gig context value
 */
export const useGig = () => {
    const context = useContext(GigContext);
    if (!context) {
        throw new Error('useGig must be used within a GigProvider');
    }
    return context;
};

export default GigContext;