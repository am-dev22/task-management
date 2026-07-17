import React, { useState } from "react";
import { type User, TASK_TYPE_CONFIGS } from "../../types";
import "./CreateTaskForm.css";

interface CreateTaskFormProps {
    users: User[];
    onCreateTask: (title: string, type: string, assigneeId: number) => Promise<void>;
    setError: (error: string | null) => void;
}

export function CreateTaskForm({
    users,
    onCreateTask,
    setError,
}: CreateTaskFormProps) {
    const [title, setTitle] = useState("");
    const [type, setType] = useState("procurement");
    const [assigneeId, setAssigneeId] = useState<number | "">("");

    // Switched to React.SyntheticEvent to eliminate deprecation warnings
    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setError(null);

        if (!title.trim() || assigneeId === "") {
            setError("Please fill in all fields to create a task.");
            return;
        }

        try {
            await onCreateTask(title.trim(), type, assigneeId);

            // Clean slate reset
            setTitle("");
            setType("procurement");
            setAssigneeId("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create task.");
        }
    };

    return (
        <section className="create-task-container">
            <h3 className="create-task-title">2. Create a New Task</h3>
            <form onSubmit={handleSubmit} className="create-task-form">
                <input
                    type="text"
                    placeholder="Task Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="create-task-input"
                />

                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="create-task-select"
                >
                    {Object.entries(TASK_TYPE_CONFIGS).map(([key, config]) => (
                        <option key={key} value={key}>
                            {config.label}
                        </option>
                    ))}
                </select>

                <select
                    value={assigneeId}
                    onChange={(e) => {
                        const val = e.target.value;
                        setAssigneeId(val === "" ? "" : Number(val));
                    }}
                    className="create-task-select"
                >
                    <option value="">Assign To...</option>
                    {users.map((u) => (
                        <option key={u.id} value={u.id}>
                            {u.name}
                        </option>
                    ))}
                </select>

                <button type="submit" className="create-task-button">
                    Create
                </button>
            </form>
        </section>
    );
}