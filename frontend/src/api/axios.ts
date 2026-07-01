import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'ngrok-skip-browser-warning': 'true',
    },
});

export default api;
