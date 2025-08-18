import axios, {AxiosInstance} from 'axios';
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";

export const api: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_SERVER_BASE_URL || '',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

api.interceptors.request.use(
    async (config) => {
        // 1. Only run in the server environment
        //    (getServerSession won't work on the client)
        if (typeof window === "undefined") {
            const session = await getServerSession(authOptions);
            if (session?.accessToken) {
                config.headers = config.headers || {};
                config.headers.Authorization = `Bearer ${session.accessToken}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
