import { Request, Response, NextFunction } from "express";
import { TaskService } from "../services/task.service";

const taskService = new TaskService();

export class TaskController {
    async getUserTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Narrow the type to ensure we have a single string
            const userIdParam = req.params.userId;
            const userIdString = Array.isArray(userIdParam) ? userIdParam[0] : userIdParam;

            const userId = parseInt(userIdString, 10);

            if (isNaN(userId) || userId <= 0) {
                res.status(400).json({ error: "Invalid user ID." });
                return;
            }

            res.json(await taskService.getTasksByUserId(userId));
        } catch (error) {
            next(error);
        }
    }

    async createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { title, type, assignedUserId } = req.body;
            const parsedAssignedUserId = parseInt(assignedUserId, 10);

            const newTask = await taskService.createTask(
                title,
                type.toLowerCase(),
                parsedAssignedUserId
            );
            res.status(201).json(newTask);
        } catch (error) {
            next(error);
        }
    }

    // This updated method handles data transformation based on type and status
    async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const idParam = req.params.id;
            const idString = Array.isArray(idParam) ? idParam[0] : idParam;
            const taskId = parseInt(idString, 10);

            const { targetStatus, customData, nextAssignedUserId, taskType } = req.body;

            const parsedTargetStatus = parseInt(targetStatus, 10);
            if (isNaN(parsedTargetStatus)) {
                res.status(400).json({ error: "Invalid targetStatus." });
                return;
            }

            let finalData: any = customData || {};

            // Inside updateStatus in TaskController.ts
            // Replace your procurement block in TaskController.ts with this:
            if (taskType === "procurement" && parsedTargetStatus === 2) {
                const raw = customData?.inputField || customData?.priceQuotes || "";

                // Split and convert each element to a STRING explicitly
                const quotesArray = (typeof raw === 'string' ? raw.split(",") : Array.isArray(raw) ? raw : [])
                    .map((s: any) => String(s).trim()) // This line forces the conversion to string
                    .filter((s: string) => s.length > 0);

                finalData = {
                    priceQuotes: quotesArray
                };

                console.log("DEBUG: Final object structure being sent to Service:", JSON.stringify(finalData));
            }
            else if (taskType === "development") {
                const input = customData?.inputField || customData?.specification || customData?.branch || "";
                const val = Array.isArray(input) ? input[0] : input;

                if (parsedTargetStatus === 2) {
                    finalData = { specification: String(val) };
                } else if (parsedTargetStatus === 3) {
                    finalData = { branch: String(val) };
                }
            }

            const parsedNextAssignedUserId = nextAssignedUserId ? parseInt(nextAssignedUserId, 10) : 0;

            console.log("DEBUG: Final object structure being sent to Service:", JSON.stringify(finalData));

            const updatedTask = await taskService.updateTaskStatus(
                taskId,
                parsedTargetStatus,
                finalData,
                parsedNextAssignedUserId
            );

            res.json(updatedTask);
        } catch (error) {
            console.error("Task Update Error:", error);
            next(error);
        }
    }

    async closeTask(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const idParam = req.params.id;
            const taskId = parseInt(Array.isArray(idParam) ? idParam[0] : idParam, 10);
            res.json(await taskService.closeTask(taskId));
        } catch (error) {
            next(error);
        }
    }
}