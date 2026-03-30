import axios from "axios";

export const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

const axiosInstance = axios.create({
    baseURL: apiUrl,
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default axiosInstance;