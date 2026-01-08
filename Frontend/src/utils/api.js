import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api',
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = Cookies.get('jwt');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;