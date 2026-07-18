import { client } from "./api";
import type { User } from "../types";

export const userService = {
    async getAllUsers(): Promise<User[]> {
        const { data } = await client.get<User[]>("/users");
        return data;
    }
};