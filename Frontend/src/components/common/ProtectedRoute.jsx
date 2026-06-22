/**
 * @file ProtectedRoute.jsx
 * @description Route guard component that enforces authentication and optional role checks.
 *              Preserves the attempted URL so the user is redirected back after login.
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 05-03-2026
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * Wraps a route to require authentication (and optionally a specific role).
 *
 * @param {Object}  props
 * @param {React.ReactNode} props.children      – The protected content to render
 * @param {string|string[]}  [props.allowedRoles]        – If set, user must have one of these roles
 * @returns {JSX.Element}
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    // Wait for auth state to hydrate from localStorage before deciding
    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--color-bg)' }}>
                <Loader2 className="animate-spin" size={32} style={{ color: 'var(--color-primary)' }} />
            </div>
        );
    }

    if (!isAuthenticated) {
        // Save the page the user tried to visit so we can redirect there after login
        localStorage.setItem('redirectAfterLogin', location.pathname + location.search);
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles) {
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
        if (!roles.includes(user?.role?.toLowerCase())) {
            // Authenticated but wrong role — send to home, not login
            return <Navigate to="/" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
