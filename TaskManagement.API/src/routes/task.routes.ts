import { Router } from "express";
import { TaskController } from "../controllers/task.controller";
import { asyncHandler } from "../middleware/error-handler";

const router = Router();
const taskController = new TaskController();

// GET  /api/tasks/types  -> task-type metadata used by the client's dynamic forms
router.get("/types", asyncHandler(taskController.getTaskTypes));

// POST /api/tasks        -> create a task
router.post("/", asyncHandler(taskController.createTask));

// PUT  /api/tasks/:id/status -> advance/reverse a task's status
router.put("/:id/status", asyncHandler(taskController.updateStatus));

// PUT  /api/tasks/:id/close  -> close a task at its final status
router.put("/:id/close", asyncHandler(taskController.closeTask));

export default router;
