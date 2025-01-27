import axios from 'axios';

const API_URL = 'https://c6c8-5-59-231-20.ngrok-free.app/api/v1/admin';

export const s3Api = {
    getPresignedUrl: async (fileName: string, fileType: string): Promise<string> => {
        try {
            const response = await axios.post(`${API_URL}/upload/presigned-url`, {
                fileName,
                fileType
            });
            return response.data.url;
        } catch (error) {
            throw new Error('Failed to get presigned URL');
        }
    },

    uploadFile: async (url: string, file: File): Promise<void> => {
        try {
            await axios.put(url, file, {
                headers: {
                    'Content-Type': file.type
                }
            });
        } catch (error) {
            throw new Error('Failed to upload file');
        }
    }
};