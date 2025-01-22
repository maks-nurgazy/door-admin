import axios, {AxiosInstance} from 'axios';
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

export const axiosClient: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_SERVER_BASE_URL || '',
    timeout: 10000,
});

axiosClient.interceptors.request.use(
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
