import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export const client = axios.create({
    baseURL: API_BASE,
    headers: { "Content-Type": "application/json" }
});

export function getErrorMessage(err: unknown, fallback: string): string {
    if (axios.isAxiosError(err)) {
        const message = err.response?.data?.error || err.response?.data?.message || err.message;
        return message ? String(message) : fallback;
    }
    return err instanceof Error ? err.message : fallback;
}