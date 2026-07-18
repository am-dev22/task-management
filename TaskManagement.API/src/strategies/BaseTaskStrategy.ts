import { ValidationError } from "../errors";
import { FieldSpec, ITaskStrategy, StatusDefinition } from "./ITaskStrategy";


export abstract class BaseTaskStrategy implements ITaskStrategy {
    abstract readonly taskType: string;
    abstract readonly statuses: StatusDefinition[];

    get label(): string {
        return this.taskType.charAt(0).toUpperCase() + this.taskType.slice(1);
    }

    get maxStatus(): number {
        return this.statuses.reduce((max, s) => Math.max(max, s.status), 1);
    }

    getStatusName(status: number): string {
        return this.statuses.find((s) => s.status === status)?.name ?? "Unknown";
    }

    validateStatusTransition(targetStatus: number, customData: Record<string, unknown>): void {
        const definition = this.statuses.find((s) => s.status === targetStatus);
        if (!definition) {
            return;
        }

        for (const field of definition.requiredFields) {
            this.validateField(definition, field, customData?.[field.key]);
        }
    }

    private validateField(definition: StatusDefinition, field: FieldSpec, value: unknown): void {
        const fail = (detail: string): never => {
            throw new ValidationError(`"${definition.name}" requires ${detail}.`);
        };

        switch (field.type) {
            case "text": {
                if (typeof value !== "string" || !value.trim()) {
                    fail(field.label);
                }
                return;
            }
            case "number": {
                if (typeof value !== "number" || !Number.isFinite(value)) {
                    fail(`${field.label} to be a number`);
                }
                if (field.min !== undefined && (value as number) < field.min) {
                    fail(`${field.label} to be at least ${field.min}`);
                }
                return;
            }
            case "date": {
                // Expect an ISO date (YYYY-MM-DD) 
                if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value))) {
                    fail(`${field.label} to be a valid date (YYYY-MM-DD)`);
                }
                return;
            }
            case "boolean": {
                if (typeof value !== "boolean") {
                    fail(`${field.label} to be true or false`);
                }
                return;
            }
            case "select": {
                const options = field.options ?? [];
                if (typeof value !== "string" || !options.includes(value)) {
                    fail(`${field.label} to be one of: ${options.join(", ")}`);
                }
                return;
            }
            case "string-list": {
                const required = field.itemCount ?? 1;
                const values = Array.isArray(value) ? value : [];
                const provided = values.filter((v) => typeof v === "string" && v.trim());
                if (provided.length < required) {
                    fail(`${required} ${field.label}`);
                }
                return;
            }
        }
    }
}
