import {api} from "@/lib/axios";
import axios from "axios";

export interface PaymentUser {
    phone: string | null;
    email: string | null;
    username: string;
    firstName: string | null;
    lastName: string | null;
}

export interface Payment {
    id: number;
    user: PaymentUser;
    receipt: string | null;
    amount: number;
    currency: string;
    paymentDate: string;
    status: 'PAID' | 'UNPAID' | 'PENDING';
    notes: string | null;
    paymentMethod: string;
}

export interface PaymentsResponse {
    data: Payment[];
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export interface PaymentFilters {
    search?: string;
    status?: string;
    page?: number;
}

export interface CreatePaymentDto {
    userId: number;
    amount: number;
    currency: string;
    paymentMethod: string;
    notes?: string;
}

export const paymentsApi = {
    getPayments: async (filters?: PaymentFilters): Promise<PaymentsResponse> => {
        try {
            const searchQueries: string[] = [];

            if (filters?.page !== undefined) {
                searchQueries.push(`page=${filters.page}`);
            }

            if (filters?.search) {
                searchQueries.push(`search=user.firstName:like:${filters.search}`);
            }

            if (filters?.status && filters.status !== 'all') {
                searchQueries.push(`search=status:=:${filters.status}`);
            }

            const queryString = searchQueries.join('&');
            const url = `/admin/payments${queryString ? `?${queryString}` : ''}`;

            const response = await api.get(url);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    throw new Error(`Server error: ${error.response.data?.message || error.message}`);
                } else if (error.request) {
                    throw new Error('No response received from server. Please check your connection.');
                }
            }
            throw new Error('Failed to fetch payments data');
        }
    },

    createPayment: async (payment: CreatePaymentDto): Promise<Payment> => {
        try {
            const response = await api.post('/admin/payments', payment);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    throw new Error(`Failed to create payment: ${error.response.data?.message || error.message}`);
                }
            }
            throw new Error('Failed to create payment');
        }
    },

    updatePaymentStatus: async (id: number, status: string): Promise<Payment> => {
        try {
            const response = await api.post(`/admin/payments/${id}/${status}`, {status});
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    throw new Error(`Failed to update payment status: ${error.response.data?.message || error.message}`);
                }
            }
            throw new Error('Failed to update payment status');
        }
    }
};