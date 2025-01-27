import {api} from "@/lib/axios";
import axios from "axios";

export interface Topic {
    id: number;
    title: string;
    sections: any[];
}

export interface TopicShortDto {
    id: number;
    title: string;
}

export interface TopicsResponse {
    data: Topic[];
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export interface TopicFilters {
    search?: string;
    page?: number;
    size?: number;
}

export interface CreateTopicDto {
    title: string;
}

export const topicsApi = {
    getTopics: async (filters?: TopicFilters): Promise<TopicsResponse> => {
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
            const url = `/admin/topics${queryString ? `?${queryString}` : ''}`;

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
            throw new Error('Failed to fetch topics data');
        }
    },

    getAllTopics: async (): Promise<TopicShortDto[]> => {
        try {
            const url = `/admin/topics/all`;

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
            throw new Error('Failed to fetch all topics');
        }
    },

    createTopic: async (topic: CreateTopicDto): Promise<Topic> => {
        try {
            const response = await api.post('/admin/topics', topic);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    throw new Error(`Failed to create topic: ${error.response.data?.message || error.message}`);
                }
            }
            throw new Error('Failed to create topic');
        }
    },

    updateTopic: async (id: number, topic: CreateTopicDto): Promise<Topic> => {
        try {
            const response = await api.put(`/admin/topics/${id}`, topic);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    throw new Error(`Failed to update topic: ${error.response.data?.message || error.message}`);
                }
            }
            throw new Error('Failed to update topic');
        }
    },

    deleteTopic: async (id: number): Promise<void> => {
        try {
            await api.delete(`/admin/topics/${id}`);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    throw new Error(`Failed to delete topic: ${error.response.data?.message || error.message}`);
                }
            }
            throw new Error('Failed to delete topic');
        }
    }
};