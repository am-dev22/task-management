import { ValidationError } from "../errors";
import { ITaskStrategy } from "./ITaskStrategy";
import { ProcurementStrategy } from "./ProcurementStrategy";
import { DevelopmentStrategy } from "./DevelopmentStrategy";
import { HRStrategy } from "./HRStrategy";

class StrategyRegistry {
    private strategies = new Map<string, ITaskStrategy>();

    constructor() {
        // Register the built-in strategies. Adding a task type is a single line here.
        this.register(new ProcurementStrategy());
        this.register(new DevelopmentStrategy());
        this.register(new HRStrategy());
    }

    public register(strategy: ITaskStrategy): void {
        this.strategies.set(strategy.taskType.toLowerCase(), strategy);
    }

    public get(taskType: string): ITaskStrategy {
        const strategy = this.strategies.get(taskType.toLowerCase());
        if (!strategy) {
            throw new ValidationError(`No strategy registered for task type: '${taskType}'.`);
        }
        return strategy;
    }

    /** All registered strategies — used to expose task-type metadata to clients. */
    public list(): ITaskStrategy[] {
        return [...this.strategies.values()];
    }
}

export const strategyRegistry = new StrategyRegistry();
