import { api } from "@/lib/axios";
import axios from "axios";

export type UserStatus = 'PENDING_PAYMENT' | 'PAYMENT_SUBMITTED' | 'ACTIVE' | 'BANNED';

export interface User {
    id: number;
    phone: string | null;
    email: string | null;
    username: string;
    firstName: string;
    lastName: string;
    status: UserStatus;
    createdAt: string;
}

export interface UsersResponse {
    content: User[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
}

export interface UserFilters {
    search?: string;
    status?: UserStatus;
    page?: number;
    size?: number;
}

export const usersApi = {
    getUsers: async (filters?: UserFilters): Promise<UsersResponse> => {
        try {
            const params = new URLSearchParams();
            if (filters?.page !== undefined) params.set('page', String(filters.page));
            if (filters?.size !== undefined) params.set('size', String(filters.size));
            if (filters?.search) params.set('search', filters.search);
            if (filters?.status) params.set('status', filters.status);
            const qs = params.toString();
            const response = await api.get(`/users${qs ? `?${qs}` : ''}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) throw new Error(`Server error: ${error.response.data?.message || error.message}`);
                if (error.request) throw new Error('No response received from server. Please check your connection.');
            }
            throw new Error('Failed to fetch users');
        }
    },

    updateUserStatus: async (id: number, status: UserStatus): Promise<User> => {
        try {
            const response = await api.put(`/users/${id}/status?status=${status}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) throw new Error(`Failed to update user status: ${error.response.data?.message || error.message}`);
            }
            throw new Error('Failed to update user status');
        }
    },
};
