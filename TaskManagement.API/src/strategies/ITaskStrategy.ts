/**
 * Declarative description of the data a task type requires. Both server-side
 * validation and the client's dynamic form are derived from these definitions,
 * so a task type is described in exactly one place.
 */

/**
 * Supported field shapes. Adding a task type that uses any of these requires no
 * changes to shared code — only a new strategy that declares its fields.
 */
export type FieldType = "text" | "number" | "date" | "boolean" | "select" | "string-list";

/** A single custom field a status transition requires. */
export interface FieldSpec {
    /** Property name stored inside Task.customData. */
    key: string;
    /** Human-readable label shown in the UI. */
    label: string;
    /** Value shape; drives both validation and the rendered input control. */
    type: FieldType;
    /** Number of entries required when type is "string-list". */
    itemCount?: number;
    /** Allowed values when type is "select". */
    options?: string[];
    /** Optional inclusive minimum when type is "number". */
    min?: number;
}

/** Metadata about a single status a task type can be in. */
export interface StatusDefinition {
    status: number;
    name: string;
    /** Fields that must be supplied to move *into* this status. */
    requiredFields: FieldSpec[];
}

export interface ITaskStrategy {
    /** Unique task-type discriminator, e.g. "procurement". */
    readonly taskType: string;
    /** Human-readable name for the type, e.g. "Procurement" or "HR". */
    readonly label: string;
    /** Ordered status definitions (status 1..N). */
    readonly statuses: StatusDefinition[];
    /** Highest status the task type supports (closable only here). */
    readonly maxStatus: number;

    /** Human-readable name for a status number. */
    getStatusName(status: number): string;

    /** Validates custom data supplied to move *to* the target status. */
    validateStatusTransition(targetStatus: number, customData: Record<string, unknown>): void;
}
