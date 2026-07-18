
export type FieldType = "text" | "number" | "date" | "boolean" | "select" | "string-list";

export interface FieldSpec {
   
    key: string;
   
    label: string;
    
    type: FieldType;
    
    itemCount?: number;
    
    options?: string[];
    
    min?: number;
}

/** Metadata about a single status a task type can be in. */
export interface StatusDefinition {
    status: number;
    name: string;
   
    requiredFields: FieldSpec[];
}

export interface ITaskStrategy {
    
    readonly taskType: string;
    
    readonly label: string;
    
    readonly statuses: StatusDefinition[];
    
    readonly maxStatus: number;

    
    getStatusName(status: number): string;

    validateStatusTransition(targetStatus: number, customData: Record<string, unknown>): void;
}
