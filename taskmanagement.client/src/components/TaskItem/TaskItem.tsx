import { type User, type Task, type TransitionState, TASK_TYPE_CONFIGS } from "../../types";
import "./TaskItem.css";

interface TaskItemProps {
    task: Task;
    users: User[];
    transitionData: TransitionState | undefined;
    onStatusChange: (task: Task, targetStatus: number, inputVal: string, nextUser: number) => Promise<void>;
    onCloseTask: (taskId: number) => Promise<void>;
    onTransitionStateChange: (taskId: number, key: "nextUser" | "inputField", value: string | number) => void;
}

export function TaskItem({
    task,
    users,
    transitionData,
    onStatusChange,
    onCloseTask,
    onTransitionStateChange,
}: TaskItemProps) {
    const config = TASK_TYPE_CONFIGS[task.type.toLowerCase()];

    // Safety fallback to prevent app crashes if an undefined task type is passed
    const label = config?.label ?? task.type;
    const maxStatusForType = config?.maxStatus ?? 4;

    const nextStatus = task.status + 1;
    const prevStatus = task.status - 1;

    // Dynamically retrieve placeholder configuration for the upcoming status change
    const activeStepConfig = config?.steps[nextStatus];
    const inputPlaceholder = activeStepConfig?.placeholder || "";

    const renderCustomData = (customData: Record<string, unknown>) => {
        const keys = Object.keys(customData);
        if (keys.length === 0) {
            return <span className="no-details-text">No details submitted yet.</span>;
        }

        return (
            <div className="custom-data-list">
                {keys.map((key) => {
                    const val = customData[key];
                    const formattedLabel = key
                        .replace(/([A-Z])/g, " $1")
                        .trim()
                        .replace(/^./, (str) => str.toUpperCase());

                    return (
                        <div key={key} className="custom-data-item">
                            <strong className="custom-data-label">{formattedLabel}:</strong>{" "}
                            <span className="custom-data-value">
                                {Array.isArray(val) ? val.join(", ") : String(val)}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    const handleForwardTransition = async () => {
        const inputVal = transitionData?.inputField || "";

        // If it's procurement, ensure the input follows the strict rule: "quote1,quote2"
        if (task.type === "procurement" && nextStatus === 2) {
            const parts = inputVal.split(",").map(p => p.trim());
            if (parts.length !== 2 || parts.some(p => p === "")) {
                alert("For procurement, please enter exactly 2 price quotes separated by a comma (e.g., 100,200).");
                return;
            }
        }

        // Pass the raw string to the server. 
        // Do NOT transform it into an array of numbers, as the strategy expects strings.
        onStatusChange(task, nextStatus, inputVal, transitionData?.nextUser ?? task.assignedUser.id)
            .catch(err => console.error("Update failed:", err));
    };

    const handleBackwardTransition = () => {
        onStatusChange(task, prevStatus, "", task.assignedUser.id).catch(console.error);
    };

    const handleCloseTask = () => {
        onCloseTask(task.id).catch(console.error);
    };

    return (
        <div className="task-item-card">
            <div className="task-item-header">
                <strong className="task-item-title">{task.title}</strong>
                <span className={`task-badge ${task.isClosed ? "badge-closed" : "badge-open"}`}>
                    {label} (Status {task.status}/{maxStatusForType}){task.isClosed && " • CLOSED"}
                </span>
            </div>

            <p className="task-assignee">
                <strong>Assigned to:</strong> <span className="assignee-name">{task.assignedUser.name}</span>
            </p>

            <div className="task-details-box">
                <strong className="details-header-label">Task Details</strong>
                {renderCustomData(task.customData)}
            </div>

            {!task.isClosed && (
                <div className="task-actions-section">
                    <div className="actions-flex-container">
                        {/* Backward Transition */}
                        {prevStatus >= 1 && (
                            <button
                                onClick={handleBackwardTransition}
                                className="back-transition-button"
                            >
                                ← Back to Status {prevStatus}
                            </button>
                        )}

                        {/* Forward Transition */}
                        {task.status < maxStatusForType && (
                            <div className="forward-transition-form">
                                {inputPlaceholder && (
                                    <input
                                        type="text"
                                        placeholder={inputPlaceholder}
                                        value={transitionData?.inputField || ""}
                                        onChange={(e) => onTransitionStateChange(task.id, "inputField", e.target.value)}
                                        className="transition-input"
                                    />
                                )}

                                <select
                                    value={transitionData?.nextUser ?? task.assignedUser.id}
                                    onChange={(e) => onTransitionStateChange(task.id, "nextUser", Number(e.target.value))}
                                    className="transition-select"
                                >
                                    {users.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            Reassign to: {u.name}
                                        </option>
                                    ))}
                                </select>

                                <button onClick={handleForwardTransition} className="forward-button">
                                    Forward to {nextStatus} →
                                </button>
                            </div>
                        )}

                        {/* Close Task Trigger */}
                        {task.status === maxStatusForType && (
                            <button
                                onClick={handleCloseTask}
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
}