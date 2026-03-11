import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// For Android emulator, localhost is 10.0.2.2.
// For iOS Simulator, it's localhost (or 127.0.0.1).
// For physical devices on the same Wi-Fi, use your machine's local IP address (e.g. 192.168.X.X).
const getBaseUrl = () => {
    // If you're testing on a physical device, hardcode your local IP here:
    // return 'http://192.168.1.100:8000/api'; 

    if (Platform.OS === 'android') {
        return 'http://10.0.2.2:8000/api';
    }
    return 'http://127.0.0.1:8000/api';
};

const api = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('innovista_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        // If we get a 401 Unauthorized, we might want to clear the token
        if (error.response && error.response.status === 401) {
            await AsyncStorage.removeItem('innovista_token');
            console.warn("API: 401 Unauthorized intercept - Token cleared.");
        }
        return Promise.reject(error);
    }
);

export default api;
