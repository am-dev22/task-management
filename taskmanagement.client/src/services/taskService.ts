import { client } from "./api";
import type { Task, TaskTypeMeta } from "../types";

export const taskService = {
    async getTaskTypes(): Promise<TaskTypeMeta[]> {
        const { data } = await client.get<TaskTypeMeta[]>("/tasks/types");
        return data;
    },

    async getUserTasks(userId: number): Promise<Task[]> {
        const { data } = await client.get<Task[]>(`/users/${userId}/tasks`);
        return data;
    },

    async createTask(title: string, type: string, assignedUserId: number): Promise<Task> {
        const { data } = await client.post<Task>("/tasks", { title, type, assignedUserId });
        return data;
    },

    async updateStatus(
        taskId: number,
        targetStatus: number,
        customData: Record<string, unknown>,
        nextAssignedUserId: number
    ): Promise<Task> {
        const { data } = await client.put<Task>(`/tasks/${taskId}/status`, {
            targetStatus,
            customData,
            nextAssignedUserId
        });
        return data;
    },

    async closeTask(taskId: number): Promise<Task> {
        const { data } = await client.put<Task>(`/tasks/${taskId}/close`);
        return data;
    }
};