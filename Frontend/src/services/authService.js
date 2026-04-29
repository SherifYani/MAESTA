/**
 * @file authService.js
 * @description Authentication services - handles user registration, login, password reset, and 2FA.
 *              Currently implemented as a simulated frontend mock using realistic API patterns.
 * @author Sherif Talaat
 * @version 2.0.0
 * @date 05-02-2026
 **/

// import ApiService from './ApiService'; // Not used in mock version

// --- Simulated Backend Data ---
const MOCK_USERS = [
    {
        id: 1,
        email: "admin@maesta.com",
        password: "123456",
        role: "admin",
        name: "Admin User",
        avatarInitials: "AU",
        isVerified: true
    },
    {
        id: 2,
        email: "jobseeker@maesta.com",
        password: "123456",
        role: "jobseeker",
        name: "John Doe",
        avatarInitials: "JD",
        isVerified: true
    },
    {
        id: 3,
        email: "company@maesta.com",
        password: "123456",
        role: "company",
        name: "Acme Inc",
        avatarInitials: "AI",
        isVerified: true
    }
];

// Helper to simulate network delay (300ms - 800ms)
const delay = () => new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 300));

const authService = {
    // Register new user
    register: async (userData) => {
        // FUTURE: const response = await ApiService.post('/api/auth/register', userData); return response.data;
        await delay();
        const newUser = {
            id: Date.now(),
            ...userData,
            role: userData.role || 'jobseeker',
            avatarInitials: userData.name ? userData.name.substring(0, 2).toUpperCase() : 'U',
            isVerified: true
        };
        MOCK_USERS.push(newUser);
        return { message: "Registration successful" };
    },

    // User login
    login: async (credentials) => {
        // FUTURE: const response = await ApiService.post('/api/auth/login', credentials); return response.data;
        await delay();
        const { email, password } = credentials;
        
        const user = MOCK_USERS.find(u => u.email === email);
        if (!user) {
            throw new Error("User not found");
        }
        
        if (user.password !== password) {
            throw new Error("Wrong password");
        }
        
        const token = `fake-jwt-token-${user.id}-${Date.now()}`;
        
        // Return without password
        const { password: _, ...userWithoutPassword } = user;
        
        return {
            token,
            user: userWithoutPassword
        };
    },

    // Forgot password
    forgotPassword: async (email) => {
        // FUTURE: const response = await ApiService.post('/api/auth/forgot-password', { email }); return response.data;
        await delay();
        if (!MOCK_USERS.find(u => u.email === email)) {
            throw new Error("User not found");
        }
        return { message: "Password reset link sent" };
    },

    // Reset password
    resetPassword: async (token, newPassword) => {
        // FUTURE: const response = await ApiService.post('/api/auth/reset-password', { token, newPassword }); return response.data;
        await delay();
        return { message: "Password reset successful" };
    },

    // Verify email
    verifyEmail: async (token) => {
        // FUTURE: const response = await ApiService.get(`/api/auth/verify-email/${token}`); return response.data;
        await delay();
        return { message: "Email verified" };
    },

    // Resend verification email
    resendVerification: async (email) => {
        // FUTURE: const response = await ApiService.post('/api/auth/resend-verification', { email }); return response.data;
        await delay();
        return { message: "Verification email sent" };
    },

    // Google login
    loginWithGoogle: async (token) => {
        // FUTURE: const response = await ApiService.post('/api/auth/google-login', { token }); return response.data;
        await delay();
        throw new Error("Social login not implemented in mock");
    },

    // LinkedIn login
    loginWithLinkedIn: async (token) => {
        // FUTURE: const response = await ApiService.post('/api/auth/linkedin-login', { token }); return response.data;
        await delay();
        throw new Error("Social login not implemented in mock");
    },

    // Logout
    logout: async () => {
        // FUTURE: await ApiService.post('/api/auth/logout');
        await delay();
        return Promise.resolve();
    },

    // Get current user
    getCurrentUser: async () => {
        // FUTURE: const response = await ApiService.get('/api/auth/me'); return response.data;
        await delay();
        const token = localStorage.getItem('token') || sessionStorage.getItem('auth_token');
        if (!token) throw new Error("No token provided");
        
        // Extract id mock: fake-jwt-token-{id}-{timestamp}
        const parts = token.split('-');
        if (parts.length < 4 || parts[0] !== 'fake' || parts[1] !== 'jwt' || parts[2] !== 'token') {
            throw new Error("Invalid token format");
        }

        const id = parseInt(parts[3], 10);
        const user = MOCK_USERS.find(u => u.id === id);
        if (!user) throw new Error("Invalid token");
        
        const { password: _, ...userWithoutPassword } = user;
        return { user: userWithoutPassword };
    },

    // Validate token
    validateToken: async () => {
        // FUTURE: const response = await ApiService.get('/api/auth/validate-token'); return response.data;
        await delay();
        const token = localStorage.getItem('token') || sessionStorage.getItem('auth_token');
        if (!token) throw new Error("Invalid token");
        return { valid: true };
    },

    // Change password
    changePassword: async (currentPassword, newPassword) => {
        // FUTURE: const response = await ApiService.put('/api/auth/change-password', { currentPassword, newPassword }); return response.data;
        await delay();
        return { message: "Password changed successfully" };
    },

    // Enable/Disable 2FA
    toggle2FA: async (enable) => {
        // FUTURE: const endpoint = enable ? '/api/auth/enable-2fa' : '/api/auth/disable-2fa'; const response = await ApiService.post(endpoint); return response.data;
        await delay();
        return { message: `2FA ${enable ? 'enabled' : 'disabled'}` };
    },

    // Verify 2FA code
    verify2FA: async (code) => {
        // FUTURE: const response = await ApiService.post('/api/auth/verify-2fa', { code }); return response.data;
        await delay();
        return { message: "2FA verified" };
    }
};

export default authService;
