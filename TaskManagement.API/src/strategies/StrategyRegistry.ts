import { ITaskStrategy } from "./ITaskStrategy";
import { ProcurementStrategy } from "./ProcurementStrategy";
import { DevelopmentStrategy } from "./DevelopmentStrategy";

class StrategyRegistry {
    private strategies = new Map<string, ITaskStrategy>();

    constructor() {
        // Register existing strategies
        this.register(new ProcurementStrategy());
        this.register(new DevelopmentStrategy());
    }

    public register(strategy: ITaskStrategy): void {
        this.strategies.set(strategy.taskType.toLowerCase(), strategy);
    }

    public get(taskType: string): ITaskStrategy {
        const strategy = this.strategies.get(taskType.toLowerCase());
        if (!strategy) {
            throw new Error(`No strategy registered for task type: '${taskType}'`);
        }
        return strategy;
    }
}

export const strategyRegistry = new StrategyRegistry();