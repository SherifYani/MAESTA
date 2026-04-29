/**
 * @file useRole.js
 * @description Hook for checking user roles and permissions
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 05-02-2026
**/

import { useAuth } from '../context/AuthContext';

/**
 * Custom hook for role-based access control
 * @returns {Object} Role checking utilities
 */
export const useRole = () => {
    const { user } = useAuth();

    /**
     * Check if user has specific role
     * @param {string} role - Role to check
     * @returns {boolean} True if user has role
     */
    const hasRole = (role) => {
        return user?.role === role;
    };

    /**
     * Check if user has any of the specified roles
     * @param {Array<string>} roles - Roles to check
     * @returns {boolean} True if user has any of the roles
     */
    const hasAnyRole = (roles) => {
        return roles.includes(user?.role);
    };

    /**
     * Check if user is client (can post gigs)
     * @returns {boolean} True if user is client
     */
    const isClient = () => {
        return user?.role === 'client' || user?.role === 'employer';
    };

    /**
     * Check if user is freelancer (can bid on gigs)
     * @returns {boolean} True if user is freelancer
     */
    const isFreelancer = () => {
        return user?.role === 'freelancer';
    };

    /**
     * Check if user can post gigs
     * @returns {boolean} True if user can post gigs
     */
    const canPostGigs = () => {
        return isClient() && user?.isVerified;
    };

    /**
     * Check if user can bid on gigs
     * @returns {boolean} True if user can bid on gigs
     */
    const canBidOnGigs = () => {
        return isFreelancer() && user?.isVerified;
    };

    return {
        hasRole,
        hasAnyRole,
        isClient,
        isFreelancer,
        canPostGigs,
        canBidOnGigs,
        currentRole: user?.role
    };
};