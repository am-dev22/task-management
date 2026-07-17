import { BaseTaskStrategy } from "./BaseTaskStrategy";
import { StatusDefinition } from "./ITaskStrategy";

/**
 * A recruitment/HR task. Demonstrates that a task type using non-string field
 * shapes (number, select, date, boolean) requires no changes to shared code —
 * only this file plus one registration line.
 */
export class HRStrategy extends BaseTaskStrategy {
    readonly taskType = "hr";

    get label(): string {
        return "HR";
    }

    readonly statuses: StatusDefinition[] = [
        { status: 1, name: "Created", requiredFields: [] },
        {
            status: 2,
            name: "Position approved",
            requiredFields: [
                { key: "budget", label: "an approved budget", type: "number", min: 0 },
                {
                    key: "department",
                    label: "a department",
                    type: "select",
                    options: ["Engineering", "Sales", "Marketing", "Operations"],
                },
            ],
        },
        {
            status: 3,
            name: "Candidate hired",
            requiredFields: [
                { key: "startDate", label: "a start date", type: "date" },
                { key: "remote", label: "the remote flag", type: "boolean" },
            ],
        },
    ];
}
