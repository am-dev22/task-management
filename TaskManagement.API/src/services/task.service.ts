import { AppDataSource } from "../data-source";
import { Task } from "../entities/Task";
import { User } from "../entities/User";
import { strategyRegistry } from "../strategies/StrategyRegistry";

export class TaskService {
    private taskRepository = AppDataSource.getRepository(Task);
    private userRepository = AppDataSource.getRepository(User);

    async getTasksByUserId(userId: number): Promise<Task[]> {
        return await this.taskRepository.find({
            where: { assignedUser: { id: userId } },
        });
    }

    async createTask(title: string, type: string, assignedUserId: number): Promise<Task> {
        // Verify Strategy exists for this type
        strategyRegistry.get(type);

        const user = await this.userRepository.findOneBy({ id: assignedUserId });
        if (!user) {
            throw new Error("Assigned user not found.");
        }

        const newTask = this.taskRepository.create({
            title,
            type: type.toLowerCase(),
            status: 1,
            isClosed: false,
            customData: {},
            assignedUser: user,
        });

        return await this.taskRepository.save(newTask);
    }

    async updateTaskStatus(taskId: number, targetStatus: number, customData: any, nextAssignedUserId: number): Promise<Task> {
        const task = await this.taskRepository.findOne({
            where: { id: taskId },
            relations: { assignedUser: true },
        });

        if (!task) {
            throw new Error("Task not found.");
        }

        if (task.isClosed) {
            throw new Error("Cannot modify closed tasks.");
        }

        const currentStatus = task.status;
        const isForward = targetStatus > currentStatus;

        if (isForward && targetStatus !== currentStatus + 1) {
            throw new Error("Forward transitions must be sequential (status by status).");
        }

        if (targetStatus < 1) {
            throw new Error("Status cannot be less than 1.");
        }

        const strategy = strategyRegistry.get(task.type);

        if (targetStatus > strategy.maxStatus) {
            throw new Error(`Status ${targetStatus} exceeds the maximum allowed status for this task type.`);
        }

        const updatedCustomData = { ...task.customData, ...customData };
        if (isForward) {
            strategy.validateStatusTransition(targetStatus, updatedCustomData);
        }

        const nextUser = await this.userRepository.findOneBy({ id: nextAssignedUserId });
        if (!nextUser) {
            throw new Error("Next assigned user must be a valid user.");
        }

        task.status = targetStatus;
        task.customData = updatedCustomData;
        task.assignedUser = nextUser;

        return await this.taskRepository.save(task);
    }

    async closeTask(taskId: number): Promise<Task> {
        const task = await this.taskRepository.findOne({ where: { id: taskId } });

        if (!task) {
            throw new Error("Task not found.");
        }

        if (task.isClosed) {
            throw new Error("Task is already closed.");
        }

        const strategy = strategyRegistry.get(task.type);

        if (task.status !== strategy.maxStatus) {
            throw new Error(`Task can only be closed from its final status (${strategy.maxStatus}).`);
        }

        task.isClosed = true;
        return await this.taskRepository.save(task);
    }
}