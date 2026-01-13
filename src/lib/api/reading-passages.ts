import axios from 'axios';
import {api} from "@/lib/axios";

export interface ReadingPassage {
    id: number;
    title: string;
    passageText?: string;
    passageFileUrl?: string;
    description?: string;
    questionCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface ReadingPassageListItem {
    id: number;
    title: string;
    description?: string;
    hasText: boolean;
    hasFile: boolean;
    passageFileUrl?: string;
    questionCount: number;
    createdAt: string;
}

export interface CreateReadingPassageDto {
    title: string;
    passageText?: string;
    passageFileUrl?: string;
    description?: string;
}

export interface UpdateReadingPassageDto {
    title: string;
    passageText?: string;
    passageFileUrl?: string;
    description?: string;
}

export interface ReadingPassagesResponse {
    content: ReadingPassageListItem[];
    currentPage: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
}

export interface ReadingPassageFilters {
    search?: string;
    page?: number;
    size?: number;
}

export const readingPassagesApi = {
    getPassages: async (filters?: ReadingPassageFilters): Promise<ReadingPassagesResponse> => {
        try {
            const searchQueries: string[] = [];

            if (filters?.page !== undefined) {
                searchQueries.push(`page=${filters.page}`);
            }

            if (filters?.size !== undefined) {
                searchQueries.push(`size=${filters.size}`);
            }

            if (filters?.search) {
                searchQueries.push(`search=${filters.search}`);
            }

            const queryString = searchQueries.join('&');
            const url = `/admin/reading-passages${queryString ? `?${queryString}` : ''}`;
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
            throw new Error('Failed to fetch reading passages');
        }
    },

    getAllPassagesForDropdown: async (): Promise<ReadingPassageListItem[]> => {
        try {
            const response = await api.get('/admin/reading-passages/all');
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    throw new Error(`Server error: ${error.response.data?.message || error.message}`);
                }
            }
            throw new Error('Failed to fetch reading passages for dropdown');
        }
    },

    getPassageById: async (id: number): Promise<ReadingPassage> => {
        try {
            const response = await api.get(`/admin/reading-passages/${id}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    throw new Error(`Failed to fetch passage: ${error.response.data?.message || error.message}`);
                }
            }
            throw new Error('Failed to fetch passage details');
        }
    },

    createPassage: async (passage: CreateReadingPassageDto): Promise<ReadingPassage> => {
        try {
            const response = await api.post('/admin/reading-passages', passage);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    throw new Error(`Failed to create passage: ${error.response.data?.message || error.message}`);
                }
            }
            throw new Error('Failed to create passage');
        }
    },

    updatePassage: async (id: number, passage: UpdateReadingPassageDto): Promise<ReadingPassage> => {
        try {
            const response = await api.put(`/admin/reading-passages/${id}`, passage);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    throw new Error(`Failed to update passage: ${error.response.data?.message || error.message}`);
                }
            }
            throw new Error('Failed to update passage');
        }
    },

    deletePassage: async (id: number): Promise<void> => {
        try {
            await api.delete(`/admin/reading-passages/${id}`);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    throw new Error(`Failed to delete passage: ${error.response.data?.message || error.message}`);
                }
            }
            throw new Error('Failed to delete passage');
        }
    }
};
