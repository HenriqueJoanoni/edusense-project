import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
const API_PATH = process.env.REACT_APP_API_PATH || '/api';
const API_TIMEOUT = parseInt(process.env.REACT_APP_API_TIMEOUT) || 10000;
const ENABLE_LOGS = process.env.REACT_APP_ENABLE_API_LOGS === 'true';

const api = axios.create({
    baseURL: `${API_BASE_URL}${API_PATH}`,
    timeout: API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (ENABLE_LOGS) {
            console.log('🚀 API Request:', {
                method: config.method?.toUpperCase(),
                url: config.url,
                data: config.data,
            });
        }

        return config;
    },
    (error) => {
        if (ENABLE_LOGS) {
            console.error('❌ Request Error:', error);
        }
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        if (ENABLE_LOGS) {
            console.log('✅ API Response:', {
                status: response.status,
                url: response.config.url,
                data: response.data,
            });
        }

        return response;
    },
    (error) => {
        if (error.response) {
            const {status, data} = error.response;

            if (ENABLE_LOGS) {
                console.error('❌ API Error Response:', {
                    status,
                    url: error.config?.url,
                    message: data?.message || error.message,
                    data,
                });
            }

            switch (status) {
                case 401:
                    console.warn('🔒 Unauthorized - Token may be expired');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('accessLevel');

                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login';
                    }
                    break;

                case 403:
                    console.warn('🚫 Forbidden - Insufficient permissions');
                    break;

                case 404:
                    console.warn('🔍 Not Found');
                    break;

                case 422:
                    console.warn('⚠️ Validation Error:', data?.errors);
                    break;

                case 500:
                    console.error('💥 Server Error');
                    break;

                default:
                    console.error(`❌ HTTP Error ${status}`);
            }
            error.userMessage = data?.message || 'An error occurred. Please try again.';
        } else if (error.request) {
            console.error('📡 Network Error - No response received:', error.message);
            error.userMessage = 'Network error. Please check your connection.';

        } else {
            console.error('⚠️ Error:', error.message);
            error.userMessage = error.message;
        }

        return Promise.reject(error);
    }
);

/**
 * Set authentication token
 * @param {string} token - JWT token
 */
export const setAuthToken = (token) => {
    if (token) {
        localStorage.setItem('token', token);
    } else {
        localStorage.removeItem('token');
    }
};

/**
 * Clear authentication data
 */
export const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('accessLevel');
};

/**
 * Get current auth token
 * @returns {string|null}
 */
export const getAuthToken = () => {
    return localStorage.getItem('token');
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

export default api;
