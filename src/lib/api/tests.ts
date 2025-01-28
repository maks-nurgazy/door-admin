import {api} from "@/lib/axios";

export interface Test {
    id: number;
    title: string;
    description: string;
    status: 'ACTIVE' | 'IN_ACTIVE';
    startDate: string;
    endDate: string;
    attemptLimitPerWeek: number;
    durationMinutes: number;
    questions: number;
    createdAt: string;
}

export interface TestSection {
    id: number;
    title: string;
    durationMinutes: number;
    numberOfQuestions: number;
}

export interface TestsResponse {
    data: Test[];
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export interface TestFilters {
    search?: string;
    page?: number;
    size?: number;
}

export interface CreateTestDto {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    attemptLimitPerWeek: number;
    status: 'ACTIVE' | 'IN_ACTIVE';
}

export type UpdateTestDto = CreateTestDto

export const testsApi = {
    getTests: async (filters?: TestFilters): Promise<TestsResponse> => {
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
            const url = `/admin/tests${queryString ? `?${queryString}` : ''}`;

            const response = await api.get(url);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch tests:', error);
            throw error;
        }
    },

    getTest: async (id: number): Promise<Test> => {
        try {
            const response = await api.get(`/admin/tests/${id}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch test:', error);
            throw error;
        }
    },

    createTest: async (test: CreateTestDto): Promise<Test> => {
        try {
            const response = await api.post('/admin/tests', test);
            return response.data;
        } catch (error) {
            console.error('Failed to create test:', error);
            throw error;
        }
    },

    updateTest: async (id: number, test: UpdateTestDto): Promise<Test> => {
        try {
            const response = await api.put(`/admin/tests/${id}`, test);
            return response.data;
        } catch (error) {
            console.error('Failed to update test:', error);
            throw error;
        }
    },

    deleteTest: async (id: number): Promise<void> => {
        try {
            await api.delete(`/admin/tests/${id}`);
        } catch (error) {
            console.error('Failed to delete test:', error);
            throw error;
        }
    },

    getTestSections: async (id: number): Promise<TestSection[]> => {
        try {
            const response = await api.get(`/admin/tests/${id}/sections`);
            return response.data;
        } catch (error) {
            console.error('Failed to get test sections:', error);
            throw error;
        }
    },

    updateTestSections: async (testId: number, sectionIds: number[], action: 'assign' | 'remove' = 'assign'): Promise<Test> => {
        try {
            const response = await api.put(`/admin/tests/${testId}/sections?action=${action}`, sectionIds);
            return response.data;
        } catch (error) {
            console.error('Failed to update test sections:', error);
            throw error;
        }
    }
};