import axios, {AxiosInstance} from 'axios';
import {getServerSession} from "next-auth";
import {getSession} from "next-auth/react";
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
        let accessToken: string | undefined;

        if (typeof window === "undefined") {
            // Server-side: use getServerSession
            const session = await getServerSession(authOptions);
            accessToken = session?.accessToken;
        } else {
            // Client-side: use getSession
            const session = await getSession();
            accessToken = session?.accessToken;
        }

        if (accessToken) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
