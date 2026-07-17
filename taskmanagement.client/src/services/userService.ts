import { apiClient } from "./apiClient";
import type { User } from "../types";

export const userService = {
    async getAllUsers(): Promise<User[]> {
        const response = await apiClient.get<User[]>("/users");
        return response.data;
    }
};