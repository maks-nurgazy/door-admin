import axios from 'axios';
import { api } from '@/lib/axios';

export const s3Api = {
    uploadFile: async (file: File, folder: string = 'questions'): Promise<string> => {
        try {
            const fileServiceUrl = process.env.NEXT_PUBLIC_FILE_SERVICE_URL || 'http://localhost:8070';
            const uploadUrl = `${fileServiceUrl}/api/v1/files/upload?folder=${folder}&fileName=${file.name}`;
            
            console.log('=== FILE UPLOAD DEBUG ===');
            console.log('File Service URL:', fileServiceUrl);
            console.log('Upload URL:', uploadUrl);
            console.log('File details:', { name: file.name, size: file.size, type: file.type });
            
            // First, test if the file service is reachable
            try {
                console.log('Testing file service connectivity...');
                const healthCheck = await axios.get(`${fileServiceUrl}/actuator/health`, { timeout: 5000 });
                console.log('File service health check:', healthCheck.status);
            } catch (healthError) {
                console.warn('File service health check failed:', healthError);
            }
            
            // Create FormData for file upload
            const formData = new FormData();
            formData.append('file', file);
            
            console.log('Sending file upload request...');
            
            // Upload file to MinIO via file service
            const response = await axios.post(uploadUrl, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 30000, // 30 second timeout
                withCredentials: false, // Disable credentials for CORS
                maxRedirects: 0, // Prevent redirects
            });
            
            console.log('Upload response status:', response.status);
            console.log('Upload response data:', response.data);
            
            // Return the file URL from the response
            const fileUrl = response.data.url || response.data.fileUrl || response.data;
            console.log('Final file URL:', fileUrl);
            return fileUrl;
        } catch (error) {
            console.error('=== UPLOAD ERROR DEBUG ===');
            console.error('Error type:', error.constructor.name);
            console.error('Error message:', error.message);
            
            if (axios.isAxiosError(error)) {
                console.error('Axios error details:', {
                    message: error.message,
                    code: error.code,
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data,
                    config: {
                        url: error.config?.url,
                        method: error.config?.method,
                        headers: error.config?.headers
                    }
                });
                
                // Check if it's a network error
                if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
                    console.error('NETWORK ERROR: This usually means:');
                    console.error('1. File service is not running on port 8070');
                    console.error('2. CORS is not properly configured');
                    console.error('3. Firewall is blocking the connection');
                    console.error('4. Wrong URL or port');
                }
            }
            
            throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    },

    // Legacy method for backward compatibility
    getPresignedUrl: async (fileName: string, fileType: string): Promise<string> => {
        throw new Error('Presigned URL not supported with MinIO setup. Use uploadFile method instead.');
    }
};