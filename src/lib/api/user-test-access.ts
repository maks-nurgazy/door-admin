import axios from 'axios';
import { api } from '@/lib/axios';

export interface UserTestAccess {
    id: number;
    userId: number;
    userEmail: string;
    userName: string;
    testId: number;
    testTitle: string;
    grantedAt: string;
    grantedBy: string;
    isActive: boolean;
}

export interface UserTestAccessCreate {
    userId: number;
    testId: number;
    grantedBy?: string;
}

export interface UserTestAccessResponse {
    data: UserTestAccess[];
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export const userTestAccessApi = {
    getAllAccess: async (page: number = 0, size: number = 10): Promise<UserTestAccessResponse> => {
        try {
            const response = await api.get(`/admin/user-test-access?page=${page}&size=${size}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    throw new Error(`Server error: ${error.response.data?.message || error.message}`);
                } else if (error.request) {
                    throw new Error('No response received from server. Please check your connection.');
                }
            }
            throw new Error('Failed to fetch user-test access data');
        }
    },

    grantAccess: async (accessData: UserTestAccessCreate): Promise<UserTestAccess> => {
        try {
            const response = await api.post('/admin/user-test-access', accessData);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    throw new Error(`Failed to grant access: ${error.response.data?.message || error.message}`);
                }
            }
            throw new Error('Failed to grant access');
        }
    },

    revokeAccess: async (userId: number, testId: number): Promise<void> => {
        try {
            await api.delete(`/admin/user-test-access/${userId}/${testId}`);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    throw new Error(`Failed to revoke access: ${error.response.data?.message || error.message}`);
                }
            }
            throw new Error('Failed to revoke access');
        }
    },

    getAccessByUserId: async (userId: number): Promise<UserTestAccess[]> => {
        try {
            const response = await api.get(`/admin/user-test-access/user/${userId}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    throw new Error(`Server error: ${error.response.data?.message || error.message}`);
                }
            }
            throw new Error('Failed to fetch user access data');
        }
    },

    getAccessByTestId: async (testId: number): Promise<UserTestAccess[]> => {
        try {
            const response = await api.get(`/admin/user-test-access/test/${testId}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    throw new Error(`Server error: ${error.response.data?.message || error.message}`);
                }
            }
            throw new Error('Failed to fetch test access data');
        }
    },

    checkAccess: async (userId: number, testId: number): Promise<boolean> => {
        try {
            const response = await api.get(`/admin/user-test-access/check/${userId}/${testId}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    throw new Error(`Server error: ${error.response.data?.message || error.message}`);
                }
            }
            throw new Error('Failed to check access');
        }
    }
};
