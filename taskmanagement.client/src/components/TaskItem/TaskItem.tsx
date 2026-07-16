import React from "react";
import type  { User, Task, TransitionState } from "../../types";
import "./TaskItem.css";

interface TaskItemProps {
    task: Task;
    users: User[];
    transitionData: TransitionState | undefined;
    onStatusChange: (task: Task, targetStatus: number, inputVal: string, nextUser: number) => Promise<void>;
    onCloseTask: (taskId: number) => Promise<void>;
    onTransitionStateChange: (taskId: number, key: "nextUser" | "inputField", value: string | number) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
    task,
    users,
    transitionData,
    onStatusChange,
    onCloseTask,
    onTransitionStateChange,
}) => {
    const nextStatus = task.status + 1;
    const prevStatus = task.status - 1;
    const maxStatusForType = task.type === "procurement" ? 3 : 4;

    const inputPlaceholder = (() => {
        if (task.type === "procurement") {
            if (nextStatus === 2) return "Enter 2 price quotes separated by a comma (e.g., $100, $120)";
            if (nextStatus === 3) return "Enter receipt text";
        } else if (task.type === "development") {
            if (nextStatus === 2) return "Enter specification text";
            if (nextStatus === 3) return "Enter branch name";
            if (nextStatus === 4) return "Enter version number";
        }
        return "";
    })();

    const renderCustomData = (customData: Record<string, unknown>) => {
        const keys = Object.keys(customData);
        if (keys.length === 0) {
            return <span className="no-details-text">No details submitted yet.</span>;
        }

        return (
            <div className="custom-data-list">
                {keys.map((key) => {
                    const val = customData[key];
                    const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

                    return (
                        <div key={key} className="custom-data-item">
                            <strong className="custom-data-label">{label}:</strong>{" "}
                            <span className="custom-data-value">
                                {Array.isArray(val) ? val.join(", ") : String(val)}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    const handleForwardTransition = () => {
        const nextUser = transitionData?.nextUser || task.assignedUser.id;
        const inputVal = transitionData?.inputField || "";
        void onStatusChange(task, nextStatus, inputVal, nextUser);
    };

    return (
        <div className="task-item-card">
            <div className="task-item-header">
                <strong className="task-item-title">{task.title}</strong>
                <span className={`task-badge ${task.isClosed ? "badge-closed" : "badge-open"}`}>
                    {task.type} (Status {task.status}/{maxStatusForType}) {task.isClosed && "• CLOSED"}
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
                                onClick={() => void onStatusChange(task, prevStatus, "", task.assignedUser.id)}
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
                                    value={transitionData?.nextUser || task.assignedUser.id}
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