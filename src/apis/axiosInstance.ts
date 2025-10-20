import axios from 'axios';
import { refreshToken } from './account.api';

const baseURL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Promise<any>[] = [];

const processQueue = (error: any) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error);
        else prom.resolve();
    });
    failedQueue = [];
};

axiosInstance.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => axiosInstance(originalRequest))
                    .catch(err => Promise.reject(err));
            }
            originalRequest._retry = true;
            isRefreshing = true;

            return refreshToken()
                .then(() => {
                    console.log("Token refreshed successfully");
                    processQueue(null);
                    // return axiosInstance(originalRequest);
                })
                .catch((refreshError) => {
                    console.log("Failed to refresh token:", refreshError);
                    processQueue(refreshError, null);

                    // Log the user out by clearing localStorage
                    localStorage.removeItem('user');

                    // Show toast notification
                    // toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                    window.confirm('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');

                    // Redirect to home page
                    window.location.href = '/';
                    // window.location.reload();

                    return Promise.reject(refreshError);
                })
                .finally(() => {
                    isRefreshing = false;
                });
        }
        return Promise.reject(error);
    }
);

export default axiosInstance; 