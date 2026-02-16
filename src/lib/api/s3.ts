import axios from 'axios';
import { getSession } from 'next-auth/react';

export const s3Api = {
    uploadFile: async (file: File, folder: string = 'questions'): Promise<string> => {
        try {
            const fileServiceUrl = process.env.NEXT_PUBLIC_FILE_SERVICE_URL || 'http://localhost:8088';
            const uploadUrl = `${fileServiceUrl}/files/upload?folder=${folder}&fileName=${file.name}`;

            const session = await getSession();
            const headers: Record<string, string> = {
                'Content-Type': 'multipart/form-data',
            };
            if (session?.user?.id) {
                headers['X-User-Id'] = String(session.user.id);
            }
            if (session?.accessToken) {
                headers['Authorization'] = `Bearer ${session.accessToken}`;
            }

            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post(uploadUrl, formData, {
                headers,
                timeout: 30000,
            });

            const fileUrl = response.data.url || response.data.fileUrl || response.data;
            return fileUrl;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const msg = error.response?.data?.message || error.message;
                throw new Error(`Failed to upload file: ${msg}`);
            }
            throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    },

    // Legacy method for backward compatibility
    getPresignedUrl: async (fileName: string, fileType: string): Promise<string> => {
        throw new Error('Presigned URL not supported with MinIO setup. Use uploadFile method instead.');
    }
};