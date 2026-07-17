import axios  from "axios";
import type { User, Task } from "../types";

const API_BASE_URL = "/api"; // Adjust to match your backend port

export interface ApiErrorDetail {
    message: string;
    statusCode?: number;
}

export function parseApiError(err: unknown): ApiErrorDetail {
    if (axios.isAxiosError(err)) {
        const serverMessage = err.response?.data?.error || err.response?.data?.message;
        return {
            message: serverMessage || err.message || "An unexpected network error occurred.",
            statusCode: err.response?.status
        };
    }
    return {
        message: err instanceof Error ? err.message : "An unknown error occurred."
    };
}

export const api = {
    async getUsers(): Promise<User[]> {
        const res = await axios.get<User[]>(`${API_BASE_URL}/users`);
        return res.data;
    },

    async getTasks(userId: number): Promise<Task[]> {
        const res = await axios.get<Task[]>(`${API_BASE_URL}/tasks/user/${userId}`);
        return res.data;
    },

    async createTask(title: string, type: string, creatorId: number): Promise<Task> {
        const res = await axios.post<Task>(`${API_BASE_URL}/tasks`, {
            title,
            type,
            creatorId
        });
        return res.data;
    },

    async updateTaskStatus(
        taskId: number,
        targetStatus: number,
        nextAssignedUserId: number,
        customData: Record<string, unknown>
    ): Promise<Task> {
        const res = await axios.put<Task>(`${API_BASE_URL}/tasks/${taskId}/status`, {
            targetStatus,
            nextAssignedUserId,
            customData
        });
        return res.data;
    },

    async closeTask(taskId: number): Promise<void> {
        await axios.post(`${API_BASE_URL}/tasks/${taskId}/close`);
    }
};