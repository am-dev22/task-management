import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { TaskController } from "../controllers/task.controller";
import { asyncHandler } from "../middleware/error-handler";

const router = Router();
const userController = new UserController();
const taskController = new TaskController();

router.get("/", asyncHandler(userController.getAllUsers));

router.get("/:userId/tasks", asyncHandler(taskController.getUserTasks));

export default router;
