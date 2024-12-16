import axios, { AxiosError } from 'axios';

// Types and Interfaces
interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    memberType: string;
}

interface RegistrationData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    organization?: string;
    memberType: string;
    attendanceType: string;
    dietaryRequirements?: string;
}

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// API Configuration
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Error Handler
const handleError = (error: AxiosError): never => {
    const message = error.response?.data?.message || error.message;
    throw new Error(`API Error: ${message}`);
};

// Authentication Endpoints
export const registerUser = async (data: RegistrationData): Promise<ApiResponse<User>> => {
    try {
        const response = await api.post<ApiResponse<User>>('/register', data);
        return response.data;
    } catch (error) {
        return handleError(error as AxiosError);
    }
};

// Certificate Management
export const generateCertificate = async (userId: string): Promise<ApiResponse<string>> => {
    try {
        const response = await api.post<ApiResponse<string>>(`/certificates/${userId}`);
        return response.data;
    } catch (error) {
        return handleError(error as AxiosError);
    }
};

export const downloadCertificate = async (certificateId: string): Promise<Blob> => {
    try {
        const response = await api.get(`/certificates/${certificateId}/download`, {
            responseType: 'blob'
        });
        return response.data;
    } catch (error) {
        return handleError(error as AxiosError);
    }
};

// Session Management
export const getSessions = async (): Promise<ApiResponse<any[]>> => {
    try {
        const response = await api.get<ApiResponse<any[]>>('/sessions');
        return response.data;
    } catch (error) {
        return handleError(error as AxiosError);
    }
};

export const registerForSession = async (sessionId: string, userId: string): Promise<ApiResponse<void>> => {
    try {
        const response = await api.post<ApiResponse<void>>(`/sessions/${sessionId}/register`, { userId });
        return response.data;
    } catch (error) {
        return handleError(error as AxiosError);
    }
};

// Feedback Management
export const submitFeedback = async (sessionId: string, feedback: {
    rating: number;
    comments: string;
}): Promise<ApiResponse<void>> => {
    try {
        const response = await api.post<ApiResponse<void>>(`/sessions/${sessionId}/feedback`, feedback);
        return response.data;
    } catch (error) {
        return handleError(error as AxiosError);
    }
};

// Verification
export const verifyCertificate = async (code: string): Promise<ApiResponse<boolean>> => {
    try {
        const response = await api.get<ApiResponse<boolean>>(`/certificates/verify/${code}`);
        return response.data;
    } catch (error) {
        return handleError(error as AxiosError);
    }
};