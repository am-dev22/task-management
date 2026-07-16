import { Request, Response } from "express";
import { TaskService } from "../services/task.service";

const taskService = new TaskService();

export class TaskController {
    async getUserTasks(req: Request, res: Response): Promise<void> {
        try {
            const userIdParam = req.params.userId;
            const userIdStr = Array.isArray(userIdParam) ? userIdParam[0] : userIdParam;

            const userId = parseInt(userIdStr, 10);
            if (isNaN(userId)) {
                res.status(400).json({ error: "Invalid user ID" });
                return;
            }
            const tasks = await taskService.getTasksByUserId(userId);
            res.json(tasks);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async createTask(req: Request, res: Response): Promise<void> {
        try {
            const { title, type, assignedUserId } = req.body;

            if (!title || !type || !assignedUserId) {
                res.status(400).json({ error: "Missing required fields: title, type, assignedUserId" });
                return;
            }

            const newTask = await taskService.createTask(title, type, Number(assignedUserId));
            res.status(201).json(newTask);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async updateStatus(req: Request, res: Response): Promise<void> {
        try {
            const idParam = req.params.id;
            const idStr = Array.isArray(idParam) ? idParam[0] : idParam;

            const taskId = parseInt(idStr, 10);
            const { targetStatus, customData, nextAssignedUserId } = req.body;

            if (isNaN(taskId)) {
                res.status(400).json({ error: "Invalid task ID" });
                return;
            }

            const updatedTask = await taskService.updateTaskStatus(
                taskId,
                Number(targetStatus),
                customData,
                Number(nextAssignedUserId)
            );
            res.json(updatedTask);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async closeTask(req: Request, res: Response): Promise<void> {
        try {
            const idParam = req.params.id;
            const idStr = Array.isArray(idParam) ? idParam[0] : idParam;

            const taskId = parseInt(idStr, 10);
            if (isNaN(taskId)) {
                res.status(400).json({ error: "Invalid task ID" });
                return;
            }

            const closedTask = await taskService.closeTask(taskId);
            res.json(closedTask);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}