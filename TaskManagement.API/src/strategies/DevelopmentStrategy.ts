import { ITaskStrategy } from "./ITaskStrategy";

export class DevelopmentStrategy implements ITaskStrategy {
    readonly taskType = "development";
    readonly maxStatus = 4;

    getStatusName(status: number): string {
        switch (status) {
            case 1: return "Created";
            case 2: return "Specification completed";
            case 3: return "Development completed";
            case 4: return "Distribution completed";
            default: return "Unknown";
        }
    }

    validateStatusTransition(targetStatus: number, customData: Record<string, any>): void {
        if (targetStatus === 2) {
            if (typeof customData?.specification !== "string" || !customData.specification.trim()) {
                throw new Error("Development status 2 requires specification text.");
            }
        }

        if (targetStatus === 3) {
            if (typeof customData?.branchName !== "string" || !customData.branchName.trim()) {
                throw new Error("Development status 3 requires a branch name.");
            }
        }

        if (targetStatus === 4) {
            if (typeof customData?.versionNumber !== "string" || !customData.versionNumber.trim()) {
                throw new Error("Development status 4 requires a version number.");
            }
        }
    }
}