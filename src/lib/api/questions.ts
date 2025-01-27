import axios from 'axios';
import {api} from "@/lib/axios";

export interface QuestionOption {
    key: number;
    text: string;
}

export interface QuestionTopic {
    id: number;
    title: string;
}

export interface Question {
    id: number;
    text: string;
    imageUrl: string | null;
    options: QuestionOption[];
    answerKey: number;
    type: 'TEXT' | 'IMAGE';
    topics: QuestionTopic[];
    createdAt: string;
}

export interface QuestionsResponse {
    data: Question[];
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export interface QuestionFilters {
    search?: string;
    page?: number;
    size?: number;
}

export interface CreateQuestionDto {
    text: string;
    imageUrl?: string | null;
    options: QuestionOption[];
    answerKey: number;
    type: 'TEXT' | 'IMAGE';
    topicIds: number[];
}

export const questionsApi = {
    getQuestions: async (filters?: QuestionFilters): Promise<QuestionsResponse> => {
        try {
            const searchQueries: string[] = [];

            if (filters?.page !== undefined) {
                searchQueries.push(`page=${filters.page}`);
            }

            if (filters?.size !== undefined) {
                searchQueries.push(`size=${filters.size}`);
            }

            if (filters?.search) {
                searchQueries.push(`search=text:like:${filters.search}`);
            }

            const queryString = searchQueries.join('&');
            const url = `/admin/questions${queryString ? `?${queryString}` : ''}`;

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
            throw new Error('Failed to fetch questions data');
        }
    },

    createQuestion: async (question: CreateQuestionDto): Promise<Question> => {
        try {
            console.log(question);
            const response = await api.post('/admin/questions', question);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    throw new Error(`Failed to create question: ${error.response.data?.message || error.message}`);
                }
            }
            throw new Error('Failed to create question');
        }
    },

    updateQuestion: async (id: number, question: CreateQuestionDto): Promise<Question> => {
        try {
            const response = await api.put(`/admin/questions/${id}`, question);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    throw new Error(`Failed to update question: ${error.response.data?.message || error.message}`);
                }
            }
            throw new Error('Failed to update question');
        }
    },

    deleteQuestion: async (id: number): Promise<void> => {
        try {
            await api.delete(`/admin/questions/${id}`);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    throw new Error(`Failed to delete question: ${error.response.data?.message || error.message}`);
                }
            }
            throw new Error('Failed to delete question');
        }
    }
};