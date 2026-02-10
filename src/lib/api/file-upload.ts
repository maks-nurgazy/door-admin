import axios from 'axios';

const FILE_SERVICE_URL = process.env.NEXT_PUBLIC_FILE_SERVICE_URL || 'http://localhost:8081';

export interface FileUploadResponse {
    url: string;
    fileName: string;
    fileSize: number;
    contentType: string;
}

export const fileUploadApi = {
    /**
     * Upload a file to the file service
     * @param file - The file to upload
     * @returns Promise with the file URL and metadata
     */
    uploadFile: async (file: File): Promise<FileUploadResponse> => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post(`${FILE_SERVICE_URL}/files/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    throw new Error(`Failed to upload file: ${error.response.data?.message || error.message}`);
                } else if (error.request) {
                    throw new Error('No response from file service. Please check your connection.');
                }
            }
            throw new Error('Failed to upload file');
        }
    },

    /**
     * Validate file before upload
     * @param file - The file to validate
     * @param maxSizeMB - Maximum file size in MB (default: 10MB)
     * @param allowedTypes - Allowed MIME types
     */
    validateFile: (
        file: File,
        maxSizeMB: number = 10,
        allowedTypes: string[] = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
    ): { valid: boolean; error?: string } => {
        const maxSizeBytes = maxSizeMB * 1024 * 1024;

        if (file.size > maxSizeBytes) {
            return {
                valid: false,
                error: `File size exceeds ${maxSizeMB}MB limit`,
            };
        }

        if (!allowedTypes.includes(file.type)) {
            return {
                valid: false,
                error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
            };
        }

        return { valid: true };
    },
};
