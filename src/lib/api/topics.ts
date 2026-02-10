import {api} from "@/lib/axios";
import axios from "axios";

export interface Topic {
    id: number;
    title: string;
    description: string | null;
}

export interface CreateTopicDto {
    title: string;
    description?: string;
}

export const topicsApi = {
    getTopics: async (): Promise<Topic[]> => {
        try {
            const response = await api.get('/topics');
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

    createTopic: async (topic: CreateTopicDto): Promise<Topic> => {
        try {
            const response = await api.post('/topics', topic);
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
            const response = await api.put(`/topics/${id}`, topic);
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
            await api.delete(`/topics/${id}`);
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
