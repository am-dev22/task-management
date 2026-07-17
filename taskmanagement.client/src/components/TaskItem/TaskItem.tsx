import React, { useMemo, useState } from "react";
import type { FieldSpec, Task, TaskTypeMeta, User } from "../../types";
import "./TaskItem.css";

interface TaskItemProps {
    task: Task;
    users: User[];
    /** Metadata for this task's type; drives the dynamic transition form. */
    meta: TaskTypeMeta | undefined;
    onStatusChange: (
        task: Task,
        targetStatus: number,
        customData: Record<string, unknown>,
        nextUserId: number
    ) => Promise<boolean>;
    onCloseTask: (taskId: number) => Promise<void>;
}

/** Composite key so each entry of a string-list field has its own input. */
const listKey = (field: FieldSpec, index: number) => `${field.key}__${index}`;

export const TaskItem: React.FC<TaskItemProps> = ({
    task,
    users,
    meta,
    onStatusChange,
    onCloseTask,
}) => {
    const maxStatus = meta?.maxStatus ?? task.status;
    const nextStatus = task.status + 1;
    const prevStatus = task.status - 1;

    // Fields required to advance to the next status, derived from server metadata.
    const nextFields = useMemo<FieldSpec[]>(
        () => meta?.statuses.find((s) => s.status === nextStatus)?.requiredFields ?? [],
        [meta, nextStatus]
    );

    const [fieldValues, setFieldValues] = useState<Record<string, unknown>>({});
    const [nextUserId, setNextUserId] = useState<number>(task.assignedUser.id);

    const setField = (key: string, value: unknown) =>
        setFieldValues((prev) => ({ ...prev, [key]: value }));

    // Coerce raw form values into the typed payload the API expects.
    const buildCustomData = (): Record<string, unknown> => {
        const data: Record<string, unknown> = {};
        for (const field of nextFields) {
            switch (field.type) {
                case "number": {
                    const raw = fieldValues[field.key];
                    const n = Number(raw);
                    data[field.key] = raw !== undefined && raw !== "" && Number.isFinite(n) ? n : null;
                    break;
                }
                case "boolean": {
                    data[field.key] = Boolean(fieldValues[field.key]);
                    break;
                }
                case "string-list": {
                    const count = field.itemCount ?? 1;
                    data[field.key] = Array.from({ length: count }, (_, i) =>
                        String(fieldValues[listKey(field, i)] ?? "")
                    );
                    break;
                }
                default: {
                    // text | date | select
                    data[field.key] = String(fieldValues[field.key] ?? "");
                }
            }
        }
        return data;
    };

    const handleForward = async () => {
        const ok = await onStatusChange(task, nextStatus, buildCustomData(), nextUserId);
        // Only reset the inputs when the transition actually succeeded, so a
        // failed attempt doesn't wipe what the user typed.
        if (ok) setFieldValues({});
    };

    const handleBackward = () => {
        // Backward moves require no custom data but still reassign the task.
        void onStatusChange(task, prevStatus, {}, nextUserId);
    };

    const renderCustomData = (customData: Record<string, unknown>) => {
        const keys = Object.keys(customData);
        if (keys.length === 0) {
            return <span className="no-details-text">No details submitted yet.</span>;
        }
        return (
            <div className="custom-data-list">
                {keys.map((key) => {
                    const val = customData[key];
                    const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
                    let display: string;
                    if (Array.isArray(val)) display = val.join(", ");
                    else if (typeof val === "boolean") display = val ? "Yes" : "No";
                    else display = String(val);
                    return (
                        <div key={key} className="custom-data-item">
                            <strong className="custom-data-label">{label}:</strong>{" "}
                            <span className="custom-data-value">{display}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderField = (field: FieldSpec) => {
        switch (field.type) {
            case "number":
                return (
                    <input
                        key={field.key}
                        type="number"
                        placeholder={field.label}
                        value={String(fieldValues[field.key] ?? "")}
                        onChange={(e) => setField(field.key, e.target.value)}
                        className="transition-input"
                    />
                );
            case "date":
                return (
                    <input
                        key={field.key}
                        type="date"
                        aria-label={field.label}
                        value={String(fieldValues[field.key] ?? "")}
                        onChange={(e) => setField(field.key, e.target.value)}
                        className="transition-input"
                    />
                );
            case "boolean":
                return (
                    <label key={field.key} className="transition-checkbox">
                        <input
                            type="checkbox"
                            checked={Boolean(fieldValues[field.key])}
                            onChange={(e) => setField(field.key, e.target.checked)}
                        />{" "}
                        {field.label}
                    </label>
                );
            case "select":
                return (
                    <select
                        key={field.key}
                        aria-label={field.label}
                        value={String(fieldValues[field.key] ?? "")}
                        onChange={(e) => setField(field.key, e.target.value)}
                        className="transition-select"
                    >
                        <option value="">Select {field.label}…</option>
                        {(field.options ?? []).map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                );
            case "string-list": {
                const count = field.itemCount ?? 1;
                return Array.from({ length: count }, (_, i) => {
                    const key = listKey(field, i);
                    return (
                        <input
                            key={key}
                            type="text"
                            placeholder={count > 1 ? `${field.label} (${i + 1})` : field.label}
                            value={String(fieldValues[key] ?? "")}
                            onChange={(e) => setField(key, e.target.value)}
                            className="transition-input"
                        />
                    );
                });
            }
            default:
                return (
                    <input
                        key={field.key}
                        type="text"
                        placeholder={field.label}
                        value={String(fieldValues[field.key] ?? "")}
                        onChange={(e) => setField(field.key, e.target.value)}
                        className="transition-input"
                    />
                );
        }
    };

    return (
        <div className="task-item-card">
            <div className="task-item-header">
                <strong className="task-item-title">{task.title}</strong>
                <span className={`task-badge ${task.isClosed ? "badge-closed" : "badge-open"}`}>
                    {meta?.label ?? task.type} (Status {task.status}/{maxStatus}){" "}
                    {task.isClosed && "• CLOSED"}
                </span>
            </div>

            <p className="task-assignee">
                <strong>Assigned to:</strong>{" "}
                <span className="assignee-name">{task.assignedUser.name}</span>
            </p>

            <div className="task-details-box">
                <strong className="details-header-label">Task Details</strong>
                {renderCustomData(task.customData)}
            </div>

            {!task.isClosed && (
                <div className="task-actions-section">
                    <div className="actions-flex-container">
                        {prevStatus >= 1 && (
                            <button onClick={handleBackward} className="back-transition-button">
                                ← Back to Status {prevStatus}
                            </button>
                        )}

                        {task.status < maxStatus && (
                            <div className="forward-transition-form">
                                {nextFields.map((field) => renderField(field))}

                                <select
                                    value={nextUserId}
                                    onChange={(e) => setNextUserId(Number(e.target.value))}
                                    className="transition-select"
                                >
                                    {users.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            Reassign to: {u.name}
                                        </option>
                                    ))}
                                </select>

                                <button onClick={() => void handleForward()} className="forward-button">
                                    Forward to {nextStatus} →
                                </button>
                            </div>
                        )}

                        {task.status === maxStatus && (
                            <button
                                onClick={() => void onCloseTask(task.id)}
                                className="close-task-button"
                            >
                                🔒 Close Task
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
