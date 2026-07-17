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

/** Supported field shapes. Mirrors the server's FieldType union. */
export type FieldType = "text" | "number" | "date" | "boolean" | "select" | "string-list";

/** A field the API requires to enter a given status. Mirrors the server schema. */
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

/** Task-type metadata served by GET /api/tasks/types. Drives all dynamic UI. */
export interface TaskTypeMeta {
    type: string;
    label: string;
    maxStatus: number;
    statuses: StatusDefinition[];
}
