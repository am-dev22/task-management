import React, { useEffect, useState } from "react";
import type { TaskTypeMeta, User } from "../../types";
import "./CreateTaskForm.css";

interface CreateTaskFormProps {
    users: User[];
    taskTypes: TaskTypeMeta[];
    onCreateTask: (title: string, type: string, assigneeId: number) => Promise<void>;
    setError: (error: string | null) => void;
}

export const CreateTaskForm: React.FC<CreateTaskFormProps> = ({
    users,
    taskTypes,
    onCreateTask,
    setError,
}) => {
    const [title, setTitle] = useState("");
    const [type, setType] = useState("");
    const [assigneeId, setAssigneeId] = useState<number | "">("");

    // Default the type selection to the first available task type.
    useEffect(() => {
        if (!type && taskTypes.length > 0) {
            setType(taskTypes[0].type);
        }
    }, [taskTypes, type]);

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setError(null);

        if (!title || !type || !assigneeId) {
            setError("Please fill in all fields to create a task.");
            return;
        }

        await onCreateTask(title, type, Number(assigneeId));
        setTitle("");
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
                    {taskTypes.map((t) => (
                        <option key={t.type} value={t.type}>
                            {t.label}
                        </option>
                    ))}
                </select>
                <select
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(Number(e.target.value))}
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
};
