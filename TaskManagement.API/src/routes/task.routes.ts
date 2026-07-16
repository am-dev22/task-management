import { Router } from "express";
import { TaskController } from "../controllers/task.controller";

const router = Router();
const taskController = new TaskController();

// Maps to: POST /api/tasks
router.post("/", taskController.createTask);

// Maps to: PUT /api/tasks/:id/status
router.put("/:id/status", taskController.updateStatus);

// Maps to: PUT /api/tasks/:id/close
router.put("/:id/close", taskController.closeTask);

export default router;