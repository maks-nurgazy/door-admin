import { api } from "@/lib/axios";
import axios from "axios";

export interface SectionTemplateDto {
    id: number;
    title: string;
    titleKg: string | null;
    description: string | null;
    durationMinutes: number;
    displayOrder: number | null;
    questionCount: number | null;
}

export interface CreateSectionTemplateRequest {
    title: string;
    titleKg?: string;
    description?: string;
    durationMinutes: number;
    displayOrder?: number;
    questionCount?: number;
}

export interface UpdateSectionTemplateRequest {
    title?: string;
    titleKg?: string;
    description?: string;
    durationMinutes?: number;
    displayOrder?: number;
    questionCount?: number;
}

export const sectionTemplatesApi = {
    getSectionTemplates: async (): Promise<SectionTemplateDto[]> => {
        try {
            const response = await api.get("/sections");
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) throw new Error(`Server error: ${error.response.data?.message || error.message}`);
                if (error.request) throw new Error("No response received from server. Please check your connection.");
            }
            throw new Error("Failed to fetch section templates");
        }
    },

    getSectionTemplate: async (id: number): Promise<SectionTemplateDto> => {
        try {
            const response = await api.get(`/sections/${id}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) throw new Error(`Server error: ${error.response.data?.message || error.message}`);
            }
            throw new Error("Failed to fetch section template");
        }
    },

    createSectionTemplate: async (data: CreateSectionTemplateRequest): Promise<SectionTemplateDto> => {
        try {
            const response = await api.post("/sections", data);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) throw new Error(`Failed to create section template: ${error.response.data?.message || error.message}`);
            }
            throw new Error("Failed to create section template");
        }
    },

    updateSectionTemplate: async (id: number, data: UpdateSectionTemplateRequest): Promise<SectionTemplateDto> => {
        try {
            const response = await api.put(`/sections/${id}`, data);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) throw new Error(`Failed to update section template: ${error.response.data?.message || error.message}`);
            }
            throw new Error("Failed to update section template");
        }
    },

    deleteSectionTemplate: async (id: number): Promise<void> => {
        try {
            await api.delete(`/sections/${id}`);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) throw new Error(`Failed to delete section template: ${error.response.data?.message || error.message}`);
            }
            throw new Error("Failed to delete section template");
        }
    },

    updateSectionQuestions: async (sectionId: number, questionIds: number[], action: 'assign' | 'remove' = 'assign'): Promise<void> => {
        try {
            await api.put(`/sections/${sectionId}/questions?action=${action}`, questionIds);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) throw new Error(`Failed to update section questions: ${error.response.data?.message || error.message}`);
            }
            throw new Error("Failed to update section questions");
        }
    },
};
