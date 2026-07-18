import { Router } from "express";
import { TaskController } from "../controllers/task.controller";
import { asyncHandler } from "../middleware/error-handler";

const router = Router();
const taskController = new TaskController();

router.get("/types", asyncHandler(taskController.getTaskTypes));

router.post("/", asyncHandler(taskController.createTask));

router.put("/:id/status", asyncHandler(taskController.updateStatus));

router.put("/:id/close", asyncHandler(taskController.closeTask));

export default router;
