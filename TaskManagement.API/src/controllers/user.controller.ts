import { Request, Response } from "express";
import { UserService } from "../services/user.service";

const userService = new UserService();

export class UserController {
    /** GET /api/users */
    async getAllUsers(_req: Request, res: Response): Promise<void> {
        const users = await userService.getAllUsers();
        res.json(users);
    }
}
