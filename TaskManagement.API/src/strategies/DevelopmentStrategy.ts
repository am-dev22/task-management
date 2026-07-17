import { BaseTaskStrategy } from "./BaseTaskStrategy";
import { StatusDefinition } from "./ITaskStrategy";

export class DevelopmentStrategy extends BaseTaskStrategy {
    readonly taskType = "development";

    readonly statuses: StatusDefinition[] = [
        { status: 1, name: "Created", requiredFields: [] },
        {
            status: 2,
            name: "Specification completed",
            requiredFields: [{ key: "specification", label: "specification text", type: "text" }],
        },
        {
            status: 3,
            name: "Development completed",
            requiredFields: [{ key: "branchName", label: "a branch name", type: "text" }],
        },
        {
            status: 4,
            name: "Distribution completed",
            requiredFields: [{ key: "versionNumber", label: "a version number", type: "text" }],
        },
    ];
}
