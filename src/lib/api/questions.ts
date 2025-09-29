import axios from 'axios';
import {api} from "@/lib/axios";

export interface QuestionOption {
    id: number;
    text?: string;
    textLatex?: string;
    firstWord?: string;
    secondWord?: string;
    relationship?: string;
}

export interface QuestionTopic {
    id: number;
    title: string;
}

// Content interfaces for different question types
export interface AnalogyContent {
    examplePair: {
        id: number;
        firstWord: string;
        secondWord: string;
        relationship: string;
    };
    correctAnswer: number;
    options: QuestionOption[];
    relationshipType: string;
}

export interface ComparisonContent {
    columnALatex: string;
    columnBLatex: string;
    correctAnswer: number;
    infoText?: string;
    imageUrl?: string;
    options: QuestionOption[];
}

export interface MathCalculationContent {
    descriptionLatex: string;
    correctAnswer: number;
    options: QuestionOption[];
}

export interface SentenceCompletionContent {
    sentence: string;
    correctAnswer: number;
    options: QuestionOption[];
}

export interface Question {
    id: number;
    questionText: string;
    type: 'ANALOGY' | 'COMPARISON' | 'MATH_CALCULATION' | 'SENTENCE_COMPLETION';
    topicIds: number[];
    points: number;
    timeLimitSeconds: number;
    explanation: string;
    content: AnalogyContent | ComparisonContent | MathCalculationContent | SentenceCompletionContent;
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
    topicId?: number;
    sectionId?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface CreateQuestionDto {
    questionText: string;
    type: 'ANALOGY' | 'COMPARISON' | 'MATH_CALCULATION' | 'SENTENCE_COMPLETION';
    topicIds: number[];
    points: number;
    timeLimitSeconds: number;
    explanation: string;
    content: AnalogyContent | ComparisonContent | MathCalculationContent | SentenceCompletionContent;
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

            if (filters?.topicId) {
                searchQueries.push(`topicId=${filters.topicId}`);
            }

            if (filters?.sectionId) {
                searchQueries.push(`sectionId=${filters.sectionId}`);
            }

            if (filters?.sortBy) {
                searchQueries.push(`sortBy=${filters.sortBy}`);
            }

            if (filters?.sortOrder) {
                searchQueries.push(`sortOrder=${filters.sortOrder}`);
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