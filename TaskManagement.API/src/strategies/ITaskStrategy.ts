import { Task } from "../entities/Task";

export interface ITaskStrategy {
    readonly taskType: string;
    readonly maxStatus: number;

    /**
     * Translates a numerical status to its human-readable meaning.
     */
    getStatusName(status: number): string;

    /**
     * Validates that the submitted custom data meets the requirements 
     * for moving *to* the specified target status.
     */
    validateStatusTransition(targetStatus: number, customData: Record<string, any>): void;
}