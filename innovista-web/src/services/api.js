import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

// Create an Axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to automatically attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('innovista_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle token expiration (401s)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // If unauthorized, clear token and optionally redirect to login
            // localStorage.removeItem('innovista_token');
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
