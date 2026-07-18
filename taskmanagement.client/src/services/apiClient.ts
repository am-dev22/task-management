import axios from "axios";

export const apiClient = axios.create({
    baseURL: "http://localhost:3000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

export const handleApiError = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        const backendMessage = error.response?.data?.error || error.response?.data?.message;
        if (backendMessage) {
            return String(backendMessage);
        }
        return error.message || "An unexpected network error occurred.";
    }
    if (error instanceof Error) {
        return error.message;
    }
    return "An unknown error occurred.";
};