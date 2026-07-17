import { apiClient } from "./apiClient";
import type { Task } from "../types";

export const taskService = {
    async getTasksByUserId(userId: number): Promise<Task[]> {
        const response = await apiClient.get<Task[]>(`/tasks/user/${userId}`);
        return response.data;
    },

    async createTask(title: string, type: string, assignedUserId: number): Promise<Task> {
        const response = await apiClient.post<Task>("/tasks", {
            title,
            type,
            assignedUserId,
        });
        return response.data;
    },

    async updateTaskStatus(
        taskId: number,
        targetStatus: number,
        nextAssignedUserId: number,
        customData: Record<string, unknown>
    ): Promise<Task> {
        const response = await apiClient.put<Task>(`/tasks/${taskId}/status`, {
            targetStatus,
            nextAssignedUserId,
            customData,
        });
        return response.data;
    },

    async closeTask(taskId: number): Promise<Task> {
        const response = await apiClient.put<Task>(`/tasks/${taskId}/close`);
        return response.data;
    }
};