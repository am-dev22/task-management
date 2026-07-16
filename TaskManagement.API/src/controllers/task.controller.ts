import { Request, Response, NextFunction } from "express";
import { TaskService } from "../services/task.service";

const taskService = new TaskService();

export class TaskController {

    // 1. Retrieve tasks assigned to a specific user
    async getUserTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userIdParam = req.params.userId;
            const userIdStr = Array.isArray(userIdParam) ? userIdParam[0] : userIdParam;
            const userId = parseInt(userIdStr, 10);

            if (isNaN(userId) || userId <= 0) {
                res.status(400).json({ error: "Invalid user ID. Must be a positive integer." });
                return;
            }

            const tasks = await taskService.getTasksByUserId(userId);
            res.json(tasks);
        } catch (error) {
            next(error); // Delegate error handling to the global error middleware
        }
    }

    // 2. Create a new task with robust type-safety validation
    async createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { title, type, assignedUserId } = req.body;

            // Strict validation against empty strings or wrong types
            if (!title || typeof title !== "string" || !title.trim()) {
                res.status(400).json({ error: "Title is required and must be a non-empty string." });
                return;
            }

            if (!type || typeof type !== "string" || !type.trim()) {
                res.status(400).json({ error: "Type is required and must be a valid string." });
                return;
            }

            const parsedAssignedUserId = Number(assignedUserId);
            if (isNaN(parsedAssignedUserId) || parsedAssignedUserId <= 0) {
                res.status(400).json({ error: "assignedUserId is required and must be a valid positive integer." });
                return;
            }

            const newTask = await taskService.createTask(
                title.trim(),
                type.trim().toLowerCase(),
                parsedAssignedUserId
            );

            res.status(201).json(newTask);
        } catch (error) {
            next(error);
        }
    }

    // 3. Update task status with robust NaN and integer checks (Critical Bug Fix)
    async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const idParam = req.params.id;
            const idStr = Array.isArray(idParam) ? idParam[0] : idParam;
            const taskId = parseInt(idStr, 10);

            if (isNaN(taskId) || taskId <= 0) {
                res.status(400).json({ error: "Invalid task ID. Must be a positive integer." });
                return;
            }

            const { targetStatus, customData, nextAssignedUserId } = req.body;

            // CRITICAL SECURE GUARD: Block NaN bypass on status target updates
            const parsedTargetStatus = Number(targetStatus);
            if (targetStatus === undefined || isNaN(parsedTargetStatus) || !Number.isInteger(parsedTargetStatus)) {
                res.status(400).json({ error: "Invalid targetStatus. It must be a valid integer." });
                return;
            }

            const parsedNextAssignedUserId = Number(nextAssignedUserId);
            if (nextAssignedUserId === undefined || isNaN(parsedNextAssignedUserId) || parsedNextAssignedUserId <= 0) {
                res.status(400).json({ error: "Invalid nextAssignedUserId. It must be a valid positive integer." });
                return;
            }

            const updatedTask = await taskService.updateTaskStatus(
                taskId,
                parsedTargetStatus,
                customData || {}, // Fallback to an empty object if no payload is supplied
                parsedNextAssignedUserId
            );

            res.json(updatedTask);
        } catch (error) {
            next(error);
        }
    }

    // 4. Close an existing task 
    async closeTask(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const idParam = req.params.id;
            const idStr = Array.isArray(idParam) ? idParam[0] : idParam;
            const taskId = parseInt(idStr, 10);

            if (isNaN(taskId) || taskId <= 0) {
                res.status(400).json({ error: "Invalid task ID. Must be a positive integer." });
                return;
            }

            const closedTask = await taskService.closeTask(taskId);
            res.json(closedTask);
        } catch (error) {
            next(error);
        }
    }
}