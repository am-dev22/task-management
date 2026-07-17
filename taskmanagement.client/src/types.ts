export interface User {
    id: number;
    name: string;
}

export interface Task {
    id: number;
    title: string;
    type: string;
    status: number;
    assignedUserId: number;
    assignedUser: User;
    customData: Record<string, unknown>;
    isClosed?: boolean;
}

export interface TransitionState {
    nextUser: number;
    inputField: string;
}

// Config layout to completely eradicate client-side L1 leaks
export interface StepConfig {
    fieldName: string;
    label: string;
    placeholder: string;
    validate?: (val: string) => boolean;
    transform?: (val: string) => unknown;
}

export interface TaskTypeConfig {
    label: string;
    maxStatus: number;
    steps: Record<number, StepConfig>; // Defines inputs for progressing *to* status level X
}

export const TASK_TYPE_CONFIGS: Record<string, TaskTypeConfig> = {
    procurement: {
        label: "Procurement",
        maxStatus: 3,
        steps: {
            2: {
                fieldName: "priceQuotes",
                label: "Price Quotes (comma-separated)",
                placeholder: "Enter 2 price quotes separated by a comma (e.g., $100, $120)",
                validate: (val) => {
                    const parts = val.split(",").map((p) => p.replace(/[^0-9.]/g, "").trim());
                    return parts.length === 2 && parts.every((p) => !isNaN(Number(p)) && p !== "");
                },
                transform: (val) => val.split(",").map((p) => Number(p.replace(/[^0-9.]/g, "").trim())),
            },
            3: {
                fieldName: "receipt",
                label: "Receipt Details / Reference",
                placeholder: "Enter receipt text",
                validate: (val) => val.trim().length > 0,
            },
        },
    },
    development: {
        label: "Development",
        maxStatus: 4,
        steps: {
            2: {
                fieldName: "specification",
                label: "Specification Document Link / text",
                placeholder: "Enter specification text",
                validate: (val) => val.trim().length > 3,
            },
            3: {
                fieldName: "branchName",
                label: "Git Branch Name",
                placeholder: "Enter branch name",
                validate: (val) => val.trim().startsWith("feature/") || val.trim().startsWith("bugfix/"),
            },
            4: {
                fieldName: "versionNumber",
                label: "Target Release Version",
                placeholder: "Enter version number",
                validate: (val) => /^[vV]?\d+\.\d+\.\d+$/.test(val.trim()),
            },
        },
    },
};