// ===================================================================
// Divine Travelers - API Service Layer
// সব API calls এখান থেকে হবে
// ===================================================================

// API Base URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Get auth token
const getToken = () => {
    if (typeof window !== "undefined") {
        const auth = localStorage.getItem("visapro-auth");
        if (auth) {
            try {
                return JSON.parse(auth).token;
            } catch {
                return null;
            }
        }
    }
    return null;
};

// Fetch wrapper with auth
export const apiFetch = async (endpoint, options = {}) => {
    const token = getToken();

    const config = {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
    };

    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
        // Auto-logout + redirect ONLY when an authenticated request's token
        // expired/invalidated (i.e. a token was actually sent). A failed LOGIN
        // also returns 401 but has no token — that must surface as an error
        // (toast), not a full-page redirect that swallows the message.
        if (response.status === 401 && token && typeof window !== "undefined") {
            localStorage.removeItem("visapro-auth");
            window.location.href = "/login";
            return;
        }
        const error = new Error(data.message || "Something went wrong");
        error.errorSources = data.errorSources;
        error.data = data;
        throw error;
    }

    return data;
};

// ==================== AUTH SERVICE ====================
export const authService = {
    login: (credentials) => apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),

    getMe: () => apiFetch('/api/users/me'),

    updateProfile: (data) => apiFetch('/api/users/me', { method: 'PATCH', body: JSON.stringify(data) }),

    changePassword: (data) => apiFetch('/api/users/change-password', { method: 'PATCH', body: JSON.stringify(data) }),
};

// ==================== USER SERVICE (Admin) ====================
export const userService = {
    getAll: (params = "") => {
        const queryString = typeof params === 'object'
            ? '?' + new URLSearchParams(params).toString()
            : params;
        return apiFetch(`/api/users/admin/all${queryString}`);
    },

    getById: (id) => apiFetch(`/api/users/admin/${id}`),

    create: (data) => apiFetch('/api/users/admin/create', { method: 'POST', body: JSON.stringify(data) }),

    update: (id, data) => apiFetch(`/api/users/admin/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

    delete: (id) => apiFetch(`/api/users/admin/${id}`, { method: 'DELETE' }),

    getStats: () => apiFetch('/api/users/admin/stats'),
};

// ==================== BLOG SERVICE ====================
export const blogService = {
    getAll: (params = "") => {
        const queryString = typeof params === 'object'
            ? '?' + new URLSearchParams(params).toString()
            : params;
        return apiFetch(`/api/blogs${queryString}`);
    },

    getById: (id) => apiFetch(`/api/blogs/${id}`),

    getBySlug: (slug) => apiFetch(`/api/blogs/slug/${slug}`),

    create: (data) => apiFetch("/api/blogs", { method: "POST", body: JSON.stringify(data) }),

    update: (id, data) => apiFetch(`/api/blogs/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

    delete: (id) => apiFetch(`/api/blogs/${id}`, { method: "DELETE" }),
};

// ==================== UPLOAD SERVICE ====================
export const uploadService = {
    uploadImage: async (file) => {
        const token = getToken();
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(`${API_BASE}/api/upload/single`, {
            method: 'POST',
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: formData,
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Upload failed');
        return data;
    },
};

// ==================== ANALYTICS SERVICE ====================
export const analyticsService = {
    getDashboard: () => apiFetch('/api/analytics/dashboard'),
};

// ==================== HOME CONTENT SERVICE ====================
export const homeContentService = {
    getAll: () => apiFetch('/api/home-content'),
    getSection: (section) => apiFetch(`/api/home-content/${section}`),
    updateSection: (section, data) => apiFetch(`/api/home-content/${section}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    seed: () => apiFetch('/api/home-content/seed', { method: 'POST' }),
};

// ==================== LEGAL POLICY SERVICE ====================
// Privacy Policy & Refund/Cancellation Policy (type: 'privacy' | 'refund')
export const legalPolicyService = {
    getAll: () => apiFetch('/api/legal-policies'),
    getOne: (type) => apiFetch(`/api/legal-policies/${type}`),
    update: (type, data) => apiFetch(`/api/legal-policies/${type}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    seed: () => apiFetch('/api/legal-policies/seed', { method: 'POST' }),
};
