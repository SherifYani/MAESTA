let tokenCache = null;

export const tokenService = {
  // Store token in sessionStorage first, fallback to localStorage
  setToken: (token) => {
    tokenCache = token;
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("auth_token", token);
      }
    } catch (e) {
      try {
        localStorage.setItem("auth_token", token);
      } catch (err) {
        console.error("Failed to store token:", err);
      }
    }
  },

  // Retrieve token with expiration check
  getToken: () => {
    if (tokenCache) return tokenCache;

    try {
      if (typeof window !== "undefined") {
        const token =
          sessionStorage.getItem("auth_token") ||
          localStorage.getItem("auth_token");
        if (token) tokenCache = token;
        return token;
      }
    } catch (e) {
      console.error("Failed to retrieve token:", e);
    }
    return null;
  },

  // Clear token from storage
  clearToken: () => {
    tokenCache = null;
    try {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("auth_token");
        localStorage.removeItem("auth_token");
      }
    } catch (e) {
      console.error("Failed to clear token:", e);
    }
  },

  // Check if token exists and is valid
  hasValidToken: () => {
    return !!tokenService.getToken();
  },

  // Get auth headers for API calls
  getAuthHeaders: () => {
    const token = tokenService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
};
