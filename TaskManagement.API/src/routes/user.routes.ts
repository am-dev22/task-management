import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { TaskController } from "../controllers/task.controller";
import { asyncHandler } from "../middleware/error-handler";

const router = Router();
const userController = new UserController();
const taskController = new TaskController();

// GET /api/users               -> list seeded users
router.get("/", asyncHandler(userController.getAllUsers));

// GET /api/users/:userId/tasks -> tasks assigned to a user
router.get("/:userId/tasks", asyncHandler(taskController.getUserTasks));

export default router;
