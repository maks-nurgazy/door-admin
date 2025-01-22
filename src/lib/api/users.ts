import axios from 'axios';

const API_URL = 'https://389d-5-59-231-14.ngrok-free.app/api/v1/admin';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface User {
    id: number;
    phone: string;
    email: string | null;
    firstName: string;
    lastName: string;
    username: string;
    status: string;
    paymentStatus: string | null;
    createdAt: string;
}

export interface UsersResponse {
    data: User[];
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export interface UserFilters {
    name?: string;
    status?: 'PENDING' | 'APPROVED' | 'BANNED';
    paymentStatus?: 'PAID' | 'UNPAID' | 'PENDING';
    page?: number;
}

export const usersApi = {
    getUsers: async (filters?: UserFilters): Promise<UsersResponse> => {
        try {
            const searchParams = new URLSearchParams();

            if (filters?.page !== undefined) {
                searchParams.append('page', filters.page.toString());
            }

            if (filters?.name) {
                searchParams.append('search', `firstName:like:${filters.name}`);
            }

            if (filters?.status) {
                searchParams.append('search', `status:=:${filters.status}`);
            }

            if (filters?.paymentStatus) {
                searchParams.append('search', `paymentStatus:=:${filters.paymentStatus}`);
            }

            const queryString = searchParams.toString();
            const url = `/users${queryString ? `?${queryString}` : ''}`;

            const response = await api.get(url);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch users:', error);
            throw error;
        }
    },

    updateUser: async (id: number, userData: Partial<User>): Promise<User> => {
        try {
            const response = await api.put(`/users/${id}`, userData);
            return response.data;
        } catch (error) {
            console.error('Failed to update user:', error);
            throw error;
        }
    },

    updateUserStatus: async (id: number, status: string): Promise<User> => {
        try {
            const response = await api.patch(`/users/${id}/status`, { status });
            return response.data;
        } catch (error) {
            console.error('Failed to update user status:', error);
            throw error;
        }
    }
};