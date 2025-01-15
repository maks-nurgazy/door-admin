import axios, {AxiosInstance} from 'axios';

export const axiosClient: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_SERVER_BASE_URL,
    timeout: 10000,
});

