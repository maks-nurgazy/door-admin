import {api} from "@/lib/axios";

// Enums matching backend
export type TestStatus = 'ACTIVE' | 'IN_ACTIVE';
export type TestType = 'FREE' | 'PAID';

// List view DTO (lightweight)
export interface TestPackageListDto {
    id: number;
    title: string;
    descriptionPreview: string | null;
    status: TestStatus;
    testType: TestType;
    startDate: string | null;
    endDate: string | null;
    isActive: boolean;
    createdAt: string;
}

// Detail view DTO
export interface TestPackageDto {
    id: number;
    title: string;
    description: string | null;
    status: TestStatus;
    testType: TestType;
    startDate: string | null;
    endDate: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface TestSection {
    sectionTemplateId: number;
    title: string;
    description: string | null;
    durationMinutes: number;
    displayOrder: number;
    questionCount: number;
}

export interface TestSectionQuestion {
    id: number;
    questionText: string;
    type: string;
    points: number;
    timeLimitSeconds: number;
    topics: {
        id: number;
        title: string;
    }[];
    topicCount: number;
    createdAt: string;
    updatedAt: string;
}

// Page response matching backend PageResponse
export interface PageResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
}

export type TestsResponse = PageResponse<TestPackageListDto>;

export interface TestFilters {
    search?: string;
    status?: TestStatus;
    testType?: TestType;
    page?: number;
    size?: number;
}

export interface CreateTestPackageRequest {
    title: string;
    description?: string;
    testCode?: string;
    language?: string;
    variant?: number;
    totalDurationMinutes?: number;
    status: TestStatus;
    testType: TestType;
    startDate?: string;
    endDate?: string;
    sectionIds?: number[];
}

export interface UpdateTestPackageRequest {
    title?: string;
    description?: string;
    testCode?: string;
    language?: string;
    variant?: number;
    totalDurationMinutes?: number;
    status?: TestStatus;
    testType?: TestType;
    startDate?: string;
    endDate?: string;
    sectionIds?: number[];
}

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
                searchQueries.push(`search=${encodeURIComponent(filters.search)}`);
            }

            if (filters?.status) {
                searchQueries.push(`status=${filters.status}`);
            }

            if (filters?.testType) {
                searchQueries.push(`testType=${filters.testType}`);
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

    getTest: async (id: number): Promise<TestPackageDto> => {
        try {
            const response = await api.get(`/admin/tests/${id}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch test:', error);
            throw error;
        }
    },

    createTest: async (test: CreateTestPackageRequest): Promise<TestPackageDto> => {
        try {
            const response = await api.post('/admin/tests', test);
            return response.data;
        } catch (error) {
            console.error('Failed to create test:', error);
            throw error;
        }
    },

    updateTest: async (id: number, test: UpdateTestPackageRequest): Promise<TestPackageDto> => {
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

    getTestSections: async (testId: number): Promise<TestSection[]> => {
        try {
            const response = await api.get(`/admin/tests/${testId}/sections`);
            return response.data;
        } catch (error) {
            console.error('Failed to get test sections:', error);
            throw error;
        }
    },

    getTestSectionQuestions: async (testId: number, sectionTemplateId: number): Promise<TestSectionQuestion[]> => {
        try {
            const response = await api.get(`/admin/tests/${testId}/sections/${sectionTemplateId}/questions`);
            return response.data;
        } catch (error) {
            console.error('Failed to get test section questions:', error);
            throw error;
        }
    },

    updateTestSectionQuestions: async (
        testId: number,
        sectionTemplateId: number,
        questionIds: number[],
        action: 'assign' | 'remove' = 'assign'
    ): Promise<void> => {
        try {
            await api.put(`/admin/tests/${testId}/sections/${sectionTemplateId}/questions?action=${action}`, questionIds);
        } catch (error) {
            console.error('Failed to update test section questions:', error);
            throw error;
        }
    }
};
