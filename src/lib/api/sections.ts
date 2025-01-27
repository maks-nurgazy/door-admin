import axios from 'axios';
import {api} from "@/lib/axios";

export interface Section {
    id: number;
    title: string;
    durationMinutes: number;
    numberOfQuestions: number;
}

export interface SectionsResponse {
    data: Section[];
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export interface SectionFilters {
    search?: string;
    page?: number;
    size?: number;
}

export interface CreateSectionDto {
    title: string;
    durationMinutes: number;
}

export interface UpdateSectionDto {
    title: string;
    durationMinutes: number;
}

export const sectionsApi = {
    getSections: async (filters?: SectionFilters): Promise<SectionsResponse> => {
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
            const url = `/admin/sections${queryString ? `?${queryString}` : ''}`;

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
            throw new Error('Failed to fetch sections data');
        }
    },

    createSection: async (section: CreateSectionDto): Promise<Section> => {
        try {
            const response = await api.post('/admin/sections', section);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    throw new Error(`Failed to create section: ${error.response.data?.message || error.message}`);
                }
            }
            throw new Error('Failed to create section');
        }
    },

    updateSection: async (id: number, section: UpdateSectionDto): Promise<Section> => {
        try {
            const response = await api.put(`/admin/sections/${id}`, section);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    throw new Error(`Failed to update section: ${error.response.data?.message || error.message}`);
                }
            }
            throw new Error('Failed to update section');
        }
    },

    deleteSection: async (id: number): Promise<void> => {
        try {
            await api.delete(`/admin/sections/${id}`);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    throw new Error(`Failed to delete section: ${error.response.data?.message || error.message}`);
                }
            }
            throw new Error('Failed to delete section');
        }
    },

    updateSectionQuestions: async (sectionId: number, questionIds: number[], action: 'assign' | 'remove' = 'assign'): Promise<Section> => {
        try {
            const response = await api.put(`/admin/sections/${sectionId}/questions?action=${action}`, questionIds);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    throw new Error(`Failed to update section questions: ${error.response.data?.message || error.message}`);
                }
            }
            throw new Error('Failed to update section questions');
        }
    }
};