import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { TaskController } from "../controllers/task.controller";

const router = Router();
const userController = new UserController();
const taskController = new TaskController();

// Maps to: GET /api/users
router.get("/", userController.getAllUsers);

// Maps to: GET /api/users/:userId/tasks
router.get("/:userId/tasks", taskController.getUserTasks);

export default router;