import axios from 'axios';
import { api } from "@/lib/axios";
import { PageResponse } from "@/lib/api/tests";

// Matches backend QuestionType enum exactly
export type QuestionType = 'ANALOGY' | 'ALGEBRAIC_EXPRESSION' | 'MATH_COMPARISON' | 'SENTENCE_COMPLETION' | 'READING_COMPREHENSION';

// Matches backend DisplayType enum
export type DisplayType = 'TEXT' | 'LATEX' | 'SVG' | 'IMAGE' | 'NONE';

// Matches backend TextContent
export interface TextContent {
    displayType: DisplayType;
    value: string;
}

// Matches backend Option
export interface QuestionOption {
    id: number;
    label: string;
    value: string;
    displayType: DisplayType;
    isCorrect: boolean;
}

// Matches backend ComparisonColumn
export interface ComparisonColumn {
    label: string;
    value: string;
    displayType: DisplayType;
}

// Matches backend ComparisonTable (used only by MATH_COMPARISON)
export interface ComparisonTable {
    columnA: ComparisonColumn;
    columnB: ComparisonColumn;
}

// Matches backend QuestionContent (polymorphic - all types share these fields)
export interface QuestionContent {
    questionType: QuestionType;      // Jackson discriminator
    questionText: TextContent;
    options: QuestionOption[];
    correctOptionId: number;
    comparisonTable?: ComparisonTable; // only for MATH_COMPARISON
}

// Matches backend QuestionListDto (list view)
export interface QuestionListDto {
    id: number;
    type: QuestionType;
    questionPreview: string | null;
    topics: { id: number; title: string }[];
    sectionName: string | null;
    testPackage: { id: number; title: string } | null;
    hasPassage: boolean;
    createdAt: string;
    updatedAt: string;
}

// Matches backend QuestionResponseDto (detail view)
export interface QuestionResponseDto {
    id: number;
    type: QuestionType;
    content: QuestionContent;
    explanation: string | null;
    passage: { id: number; title: string } | null;
    topics: { id: number; title: string }[];
    section: { id: number; name: string } | null;
    testPackage: { id: number; title: string } | null;
    createdAt: string;
    updatedAt: string;
}

// Matches backend CreateQuestionRequest / UpdateQuestionRequest
export interface CreateQuestionRequest {
    type: QuestionType;
    content: QuestionContent;
    explanation?: string;
    passageId?: number;
    testPackageId?: number;
    sectionId?: number;
    topicIds: number[];
}

export type QuestionsResponse = PageResponse<QuestionListDto>;

export interface QuestionFilters {
    search?: string;
    topicId?: number;
    sectionId?: number;
    questionType?: QuestionType;
    page?: number;
    size?: number;
}

export const questionsApi = {
    getQuestions: async (filters?: QuestionFilters): Promise<QuestionsResponse> => {
        try {
            const params = new URLSearchParams();

            if (filters?.page !== undefined) params.set('page', String(filters.page));
            if (filters?.size !== undefined) params.set('size', String(filters.size));
            if (filters?.search) params.set('search', filters.search);
            if (filters?.topicId) params.set('topicId', String(filters.topicId));
            if (filters?.sectionId) params.set('sectionId', String(filters.sectionId));
            if (filters?.questionType) params.set('questionType', filters.questionType);

            const qs = params.toString();
            const response = await api.get(`/questions${qs ? `?${qs}` : ''}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) throw new Error(`Server error: ${error.response.data?.message || error.message}`);
                if (error.request) throw new Error('No response received from server. Please check your connection.');
            }
            throw new Error('Failed to fetch questions');
        }
    },

    getQuestionById: async (id: number): Promise<QuestionResponseDto> => {
        try {
            const response = await api.get(`/questions/${id}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) throw new Error(`Failed to fetch question: ${error.response.data?.message || error.message}`);
            }
            throw new Error('Failed to fetch question details');
        }
    },

    createQuestion: async (question: CreateQuestionRequest): Promise<QuestionResponseDto> => {
        try {
            const response = await api.post('/questions', question);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) throw new Error(`Failed to create question: ${error.response.data?.message || error.message}`);
            }
            throw new Error('Failed to create question');
        }
    },

    updateQuestion: async (id: number, question: CreateQuestionRequest): Promise<QuestionResponseDto> => {
        try {
            const response = await api.put(`/questions/${id}`, question);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) throw new Error(`Failed to update question: ${error.response.data?.message || error.message}`);
            }
            throw new Error('Failed to update question');
        }
    },

    deleteQuestion: async (id: number): Promise<void> => {
        try {
            await api.delete(`/questions/${id}`);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) throw new Error(`Failed to delete question: ${error.response.data?.message || error.message}`);
            }
            throw new Error('Failed to delete question');
        }
    },
};
