import { api } from "@/lib/axios";
import axios from "axios";

export type PaymentStatus =
    | 'PENDING'
    | 'SUBMITTED'
    | 'PROCESSING'
    | 'APPROVED'
    | 'COMPLETED'
    | 'FAILED'
    | 'REJECTED'
    | 'REFUNDED';

export type PaymentMethod = 'MANUAL_RECEIPT' | 'CARD';
export type PaymentProvider = 'MANUAL' | 'FINIK';

export interface Payment {
    id: number;
    userId: number;
    userFirstName: string | null;
    userLastName: string | null;
    userUsername: string;
    userPhone: string | null;
    amount: number;
    currency: string;
    status: PaymentStatus;
    paymentMethod: PaymentMethod;
    paymentProvider: PaymentProvider;
    receiptUrl: string | null;
    validFrom: string | null;
    validUntil: string | null;
    createdAt: string;
    submittedAt: string | null;
    processedAt: string | null;
    adminNotes: string | null;
    rejectionReason: string | null;
}

export interface PaymentsResponse {
    content: Payment[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
}

export interface PaymentFilters {
    status?: PaymentStatus;
    page?: number;
    size?: number;
}

export const paymentsApi = {
    getPayments: async (filters?: PaymentFilters): Promise<PaymentsResponse> => {
        try {
            const params = new URLSearchParams();
            if (filters?.page !== undefined) params.set('page', String(filters.page));
            if (filters?.size !== undefined) params.set('size', String(filters.size));
            if (filters?.status) params.set('status', filters.status);
            const qs = params.toString();
            const response = await api.get(`/payments${qs ? `?${qs}` : ''}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) throw new Error(`Server error: ${error.response.data?.message || error.message}`);
                if (error.request) throw new Error('No response received from server. Please check your connection.');
            }
            throw new Error('Failed to fetch payments');
        }
    },

    approvePayment: async (id: number, notes?: string): Promise<Payment> => {
        try {
            const response = await api.post(`/payments/${id}/approve`, notes ? { notes } : {});
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) throw new Error(`Failed to approve payment: ${error.response.data?.message || error.message}`);
            }
            throw new Error('Failed to approve payment');
        }
    },

    rejectPayment: async (id: number, reason: string): Promise<Payment> => {
        try {
            const response = await api.post(`/payments/${id}/reject`, { reason });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) throw new Error(`Failed to reject payment: ${error.response.data?.message || error.message}`);
            }
            throw new Error('Failed to reject payment');
        }
    },

    createManualPayment: async (data: {
        userId: number;
        amount: number;
        currency: string;
        receiptUrl: string;
    }): Promise<Payment> => {
        try {
            const response = await api.post('/payments/create', data);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) throw new Error(`Failed to create payment: ${error.response.data?.message || error.message}`);
            }
            throw new Error('Failed to create payment');
        }
    },
};
