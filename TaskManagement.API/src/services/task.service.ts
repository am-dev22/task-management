import { AppDataSource } from "../data-source";
import { Task } from "../entities/Task";
import { User } from "../entities/User";
import { ConflictError, NotFoundError, ValidationError } from "../errors";
import { strategyRegistry } from "../strategies/StrategyRegistry";

export class TaskService {

    private get taskRepository() {
        return AppDataSource.getRepository(Task);
    }

    private get userRepository() {
        return AppDataSource.getRepository(User);
    }

    async getTasksByUserId(userId: number): Promise<Task[]> {
        return this.taskRepository.find({
            where: { assignedUser: { id: userId } },
            order: { id: "ASC" },
        });
    }

    async createTask(title: string, type: string, assignedUserId: number): Promise<Task> {

        strategyRegistry.get(type);

        const user = await this.userRepository.findOneBy({ id: assignedUserId });
        if (!user) {
            throw new NotFoundError("Assigned user not found.");
        }

        const newTask = this.taskRepository.create({
            title,
            type: type.toLowerCase(),
            status: 1,
            isClosed: false,
            customData: {},
            assignedUser: user,
        });

        return this.taskRepository.save(newTask);
    }

    async updateTaskStatus(
        taskId: number,
        targetStatus: number,
        customData: Record<string, unknown>,
        nextAssignedUserId: number
    ): Promise<Task> {
        if (!Number.isInteger(targetStatus)) {
            throw new ValidationError("targetStatus must be an integer.");
        }

        const task = await this.taskRepository.findOne({
            where: { id: taskId },
            relations: { assignedUser: true },
        });

        if (!task) {
            throw new NotFoundError("Task not found.");
        }

        if (task.isClosed) {
            throw new ConflictError("Closed tasks are immutable and cannot be modified.");
        }

        const strategy = strategyRegistry.get(task.type);
        const currentStatus = task.status;

        if (targetStatus < 1) {
            throw new ValidationError("Status cannot be less than 1.");
        }

        if (targetStatus > strategy.maxStatus) {
            throw new ValidationError(
                `Status ${targetStatus} exceeds the maximum status (${strategy.maxStatus}) for this task type.`
            );
        }

        if (targetStatus === currentStatus) {
            throw new ValidationError("Task is already at the requested status.");
        }

        const isForward = targetStatus > currentStatus;
        if (isForward && targetStatus !== currentStatus + 1) {
            throw new ValidationError("Forward transitions must be sequential (one status at a time).");
        }

        // Merge and validate. Backward moves are always allowed (no data required).
        const updatedCustomData = { ...task.customData, ...(customData ?? {}) };
        if (isForward) {
            strategy.validateStatusTransition(targetStatus, updatedCustomData);
        }

        const nextUser = await this.userRepository.findOneBy({ id: nextAssignedUserId });
        if (!nextUser) {
            throw new NotFoundError("Next assigned user must be a valid user.");
        }

        task.status = targetStatus;
        task.customData = updatedCustomData;
        task.assignedUser = nextUser;

        return this.taskRepository.save(task);
    }

    async closeTask(taskId: number): Promise<Task> {
        const task = await this.taskRepository.findOne({ where: { id: taskId } });

        if (!task) {
            throw new NotFoundError("Task not found.");
        }

        if (task.isClosed) {
            throw new ConflictError("Task is already closed.");
        }

        const strategy = strategyRegistry.get(task.type);
        if (task.status !== strategy.maxStatus) {
            throw new ConflictError(
                `A task can only be closed from its final status (${strategy.maxStatus}).`
            );
        }

        task.isClosed = true;
        return this.taskRepository.save(task);
    }
}
