import { Request, Response } from "express";
import { TaskService } from "../services/task.service";
import { strategyRegistry } from "../strategies/StrategyRegistry";
import { ValidationError } from "../errors";

const taskService = new TaskService();

/** Parses a route param as a positive integer id, or throws a 400. */
function parseId(raw: string | undefined, label: string): number {
    const id = Number(raw);
    if (!Number.isInteger(id) || id < 1) {
        throw new ValidationError(`Invalid ${label}.`);
    }
    return id;
}

export class TaskController {
    /** GET /api/tasks/types — declarative metadata that drives the client's forms. */
    async getTaskTypes(_req: Request, res: Response): Promise<void> {
        const types = strategyRegistry.list().map((strategy) => ({
            type: strategy.taskType,
            label: strategy.label,
            maxStatus: strategy.maxStatus,
            statuses: strategy.statuses,
        }));
        res.json(types);
    }

    /** GET /api/users/:userId/tasks */
    async getUserTasks(req: Request, res: Response): Promise<void> {
        const userId = parseId(req.params.userId, "user ID");
        const tasks = await taskService.getTasksByUserId(userId);
        res.json(tasks);
    }

    /** POST /api/tasks */
    async createTask(req: Request, res: Response): Promise<void> {
        const { title, type, assignedUserId } = req.body ?? {};

        if (!title || !type || assignedUserId === undefined || assignedUserId === null) {
            throw new ValidationError("Missing required fields: title, type, assignedUserId.");
        }

        const newTask = await taskService.createTask(title, type, Number(assignedUserId));
        res.status(201).json(newTask);
    }

    /** PUT /api/tasks/:id/status */
    async updateStatus(req: Request, res: Response): Promise<void> {
        const taskId = parseId(req.params.id, "task ID");
        const { targetStatus, customData, nextAssignedUserId } = req.body ?? {};

        if (nextAssignedUserId === undefined || nextAssignedUserId === null) {
            throw new ValidationError("nextAssignedUserId is required for every status change.");
        }

        const updatedTask = await taskService.updateTaskStatus(
            taskId,
            Number(targetStatus),
            customData ?? {},
            Number(nextAssignedUserId)
        );
        res.json(updatedTask);
    }

    /** PUT /api/tasks/:id/close */
    async closeTask(req: Request, res: Response): Promise<void> {
        const taskId = parseId(req.params.id, "task ID");
        const closedTask = await taskService.closeTask(taskId);
        res.json(closedTask);
    }
}
