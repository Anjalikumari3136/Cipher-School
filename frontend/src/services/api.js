import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

export const executeQuery = async (query) => {
    try {
        const response = await api.post('/execute', { query });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getHint = async (query, assignmentContext) => {
    try {
        const response = await api.post('/hint', { query, assignmentContext });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getAssignments = async () => {
    try {
        const response = await api.get('/assignments');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const saveAttempt = async (attemptData) => {
    try {
        const response = await api.post('/attempts', attemptData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getAttempts = async (assignmentId) => {
    try {
        const response = await api.get(`/attempts/${assignmentId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export default api;
