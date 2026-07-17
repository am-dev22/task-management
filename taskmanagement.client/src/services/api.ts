import axios from "axios";
import type { Task, TaskTypeMeta, User } from "../types";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

const client = axios.create({ baseURL: API_BASE });

/** Extracts the server's error message from an Axios error, with a fallback. */
export function getErrorMessage(err: unknown, fallback: string): string {
    if (axios.isAxiosError(err)) {
        return err.response?.data?.error ?? fallback;
    }
    return fallback;
}

export const api = {
    getUsers: () => client.get<User[]>("/users").then((r) => r.data),

    getTaskTypes: () => client.get<TaskTypeMeta[]>("/tasks/types").then((r) => r.data),

    getUserTasks: (userId: number) =>
        client.get<Task[]>(`/users/${userId}/tasks`).then((r) => r.data),

    createTask: (title: string, type: string, assignedUserId: number) =>
        client.post<Task>("/tasks", { title, type, assignedUserId }).then((r) => r.data),

    updateStatus: (
        taskId: number,
        targetStatus: number,
        customData: Record<string, unknown>,
        nextAssignedUserId: number
    ) =>
        client
            .put<Task>(`/tasks/${taskId}/status`, { targetStatus, customData, nextAssignedUserId })
            .then((r) => r.data),

    closeTask: (taskId: number) =>
        client.put<Task>(`/tasks/${taskId}/close`).then((r) => r.data),
};
