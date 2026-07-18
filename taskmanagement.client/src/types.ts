export interface User {
    id: number;
    name: string;
}

export interface Task {
    id: number;
    title: string;
    type: string;
    status: number;
    isClosed: boolean;
    customData: Record<string, unknown>;
    assignedUser: User;
}

export type FieldType = "text" | "number" | "date" | "boolean" | "select" | "string-list";

export interface FieldSpec {
    key: string;
    label: string;
    type: FieldType;
    itemCount?: number;
    options?: string[];
    min?: number;
}

export interface StatusDefinition {
    status: number;
    name: string;
    requiredFields: FieldSpec[];
}

export interface TaskTypeMeta {
    type: string;
    label: string;
    maxStatus: number;
    statuses: StatusDefinition[];
}
