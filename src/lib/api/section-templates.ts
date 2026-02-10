import axios from 'axios';
import { api } from "@/lib/axios";

export interface SectionTemplate {
    id: number;
    title: string;
    description: string | null;
    durationMinutes: number;
    displayOrder: number;
    shuffleQuestions: boolean;
    numberOfQuestions: number;
}

export interface SectionTemplateListDto {
    id: number;
    title: string;
    description: string | null;
    durationMinutes: number;
    displayOrder: number;
    numberOfQuestions: number;
}

export interface SectionTemplatesResponse {
    data: SectionTemplateListDto[];
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export interface SectionTemplateFilters {
    search?: string;
    page?: number;
    size?: number;
}

export interface CreateSectionTemplateDto {
    title: string;
    description?: string;
    durationMinutes: number;
    displayOrder?: number;
    shuffleQuestions?: boolean;
    numberOfQuestions?: number;
}

export interface UpdateSectionTemplateDto {
    title: string;
    description?: string;
    durationMinutes: number;
    displayOrder?: number;
    shuffleQuestions?: boolean;
    numberOfQuestions?: number;
}

export const sectionTemplatesApi = {
    getSectionTemplates: async (filters?: SectionTemplateFilters): Promise<SectionTemplatesResponse> => {
        try {
            const searchQueries: string[] = [];

            if (filters?.page !== undefined) {
                searchQueries.push(`page=${filters.page}`);
            }

            if (filters?.size !== undefined) {
                searchQueries.push(`size=${filters.size}`);
            }

            if (filters?.search) {
                searchQueries.push(`search=title:like:${filters.search}`);
            }

            const queryString = searchQueries.join('&');
            const url = `/section-templates${queryString ? `?${queryString}` : ''}`;

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
            throw new Error('Failed to fetch section templates data');
        }
    },

    getAllSectionTemplates: async (): Promise<SectionTemplate[]> => {
        try {
            const url = `/section-templates/all`;
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
            throw new Error('Failed to fetch section templates data');
        }
    },

    getSectionTemplate: async (id: number): Promise<SectionTemplate> => {
        try {
            const response = await api.get(`/section-templates/${id}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    throw new Error(`Failed to get section template: ${error.response.data?.message || error.message}`);
                }
            }
            throw new Error('Failed to get section template');
        }
    },

    createSectionTemplate: async (template: CreateSectionTemplateDto): Promise<SectionTemplate> => {
        try {
            const response = await api.post('/section-templates', template);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    throw new Error(`Failed to create section template: ${error.response.data?.message || error.message}`);
                }
            }
            throw new Error('Failed to create section template');
        }
    },

    updateSectionTemplate: async (id: number, template: UpdateSectionTemplateDto): Promise<SectionTemplate> => {
        try {
            const response = await api.put(`/section-templates/${id}`, template);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    throw new Error(`Failed to update section template: ${error.response.data?.message || error.message}`);
                }
            }
            throw new Error('Failed to update section template');
        }
    },

    deleteSectionTemplate: async (id: number): Promise<void> => {
        try {
            await api.delete(`/section-templates/${id}`);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    throw new Error(`Failed to delete section template: ${error.response.data?.message || error.message}`);
                }
            }
            throw new Error('Failed to delete section template');
        }
    },

    getTemplateCount: async (): Promise<number> => {
        try {
            const response = await api.get('/section-templates/count');
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    throw new Error(`Failed to get template count: ${error.response.data?.message || error.message}`);
                }
            }
            throw new Error('Failed to get template count');
        }
    }
};
