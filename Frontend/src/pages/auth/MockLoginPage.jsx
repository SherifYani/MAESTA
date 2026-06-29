/**
 * @file MockLoginPage.jsx
 * @description Demo login page that lets you select a user role and log in
 *              with a fake JWT token stored in localStorage.
 *              Replace with real auth when backend is ready.
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 05-03-2026
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { tokenService } from '../../lib/token-service';
import {
    Briefcase,
    Building2,
    Shield,
    User,
    Wrench,
    LogIn,
    Info,
} from 'lucide-react';
import styles from './MockLoginPage.module.css';

// ΓöÇΓöÇΓöÇ Role Definitions ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

const ROLES = [
    {
        id: 'jobseeker',
        label: 'Job Seeker',
        description: 'Browse jobs, apply, track applications',
        icon: Briefcase,
        color: 'var(--color-chart-2)',
    },
    {
        id: 'company',
        label: 'Company',
        description: 'Post jobs, review applicants, analytics',
        icon: Building2,
        color: 'var(--color-chart-1)',
    },
    // {
    //     id: 'freelancer',
    //     label: 'Freelancer',
    //     description: 'Browse gigs, bid on projects',
    //     icon: Wrench,
    //     color: 'var(--color-chart-3)',
    // },
    // {
    //     id: 'client',
    //     label: 'Client',
    //     description: 'Post gigs, manage workspaces',
    //     icon: User,
    //     color: 'var(--color-chart-4)',
    // },
    {
        id: 'admin',
        label: 'Admin',
        description: 'Manage users, jobs, platform content',
        icon: Shield,
        color: 'var(--color-chart-5)',
    },
];

// ΓöÇΓöÇΓöÇ Component ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

const MockLoginPage = () => {
    const { setUser } = useAuth();
    const navigate = useNavigate();

    const [selectedRole, setSelectedRole] = useState('jobseeker');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    /**
     * Generates a mock user object for the selected role and stores it
     * via AuthContext.login(), then redirects to the intended destination.
     */
    const handleDemoLogin = async () => {
        setIsLoggingIn(true);

        const credentials = {
            email: getDemoEmail(selectedRole),
            password: '123456'
        };

        // Small artificial delay so the button state is visible
        await new Promise((r) => setTimeout(r, 450));

        try {
            // Completely fake the authentication session
            const mockToken = "mock_jwt_token_for_demo_12345";
            tokenService.setToken(mockToken);

            const mockUser = {
                id: `mock-${selectedRole}-123`,
                email: getDemoEmail(selectedRole),
                firstName: getDemoName(selectedRole).split(' ')[0],
                lastName: getDemoName(selectedRole).split(' ')[1] || '',
                name: getDemoName(selectedRole),
                role: selectedRole,
                userType: selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1),
                registrationStatus: 'Completed',
                isActive: true,
                roles: [selectedRole]
            };

            setUser(mockUser);

            // Navigate to the page the user originally wanted, or /dashboard
            const redirectTo =
                localStorage.getItem('redirectAfterLogin') || '/dashboard';
            localStorage.removeItem('redirectAfterLogin');
            navigate(redirectTo, { replace: true });
        } catch (err) {
            console.error('Demo login failed:', err);
            setIsLoggingIn(false);
        }
    };

    return (
        <div className={styles.page}>
            {/* Background decoration */}
            <div className={styles.bgGlow} aria-hidden="true" />

            <div className={styles.card}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.logo}>MAESTA</div>
                    <h1 className={styles.title}>Demo Login</h1>
                    <p className={styles.subtitle}>
                        Select a role to explore the dashboard
                    </p>
                </div>

                {/* Role selector */}
                <div className={styles.rolesGrid} role="radiogroup" aria-label="Select user role">
                    {ROLES.map(({ id, label, description, icon: Icon, color }) => (
                        <button
                            key={id}
                            role="radio"
                            aria-checked={selectedRole === id}
                            className={`${styles.roleCard} ${selectedRole === id ? styles.selected : ''}`}
                            onClick={() => setSelectedRole(id)}
                            style={selectedRole === id ? { '--role-color': color } : {}}
                        >
                            <span className={styles.roleIcon} style={{ color }}>
                                <Icon size={22} />
                            </span>
                            <span className={styles.roleLabel}>{label}</span>
                            <span className={styles.roleDesc}>{description}</span>
                        </button>
                    ))}
                </div>

                {/* Login button */}
                <button
                    className={styles.loginBtn}
                    onClick={handleDemoLogin}
                    disabled={isLoggingIn}
                    aria-busy={isLoggingIn}
                >
                    {isLoggingIn ? (
                        <span className={styles.spinner} aria-hidden="true" />
                    ) : (
                        <LogIn size={18} />
                    )}
                    {isLoggingIn ? 'Logging inΓÇª' : `Continue as ${ROLES.find(r => r.id === selectedRole)?.label}`}
                </button>

                {/* Disclaimer */}
                <div className={styles.notice}>
                    <Info size={14} aria-hidden="true" />
                    <span>
                        This is a <strong>prototype demo</strong>. No credentials required.
                        Data is mocked and nothing is persisted to a server.
                    </span>
                </div>
            </div>
        </div>
    );
};

// ΓöÇΓöÇΓöÇ Helpers ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

function getDemoName(role) {
    const names = {
        jobseeker: 'John Doe',
        company: 'Acme Inc',
        admin: 'Admin User',
    };
    return names[role] || 'Demo User';
}

function getDemoEmail(role) {
    const emails = {
        jobseeker: 'jobseeker@maesta.com',
        company: 'company@maesta.com',
        admin: 'admin@maesta.com',
    };
    return emails[role] || '';
}

function getDemoInitials(role) {
    const map = {
        jobseeker: 'JD',
        company: 'AI',
        admin: 'AU',
    };
    return map[role] || 'DU';
}

export default MockLoginPage;
