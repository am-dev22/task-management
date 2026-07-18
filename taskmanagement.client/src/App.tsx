import { useCallback, useEffect, useState } from "react";
import type { Task, TaskTypeMeta, User } from "./types";
import { userService } from "./services/userService";
import { taskService } from "./services/taskService";
import { getErrorMessage } from "./services/api";
import { UserSwitcher } from "./components/UserSwitcher/UserSwitcher";
import { CreateTaskForm } from "./components/CreateTaskForm/CreateTaskForm";
import { TaskItem } from "./components/TaskItem/TaskItem";
import "./App.css";

export default function App() {
    const [users, setUsers] = useState<User[]>([]);
    const [taskTypes, setTaskTypes] = useState<TaskTypeMeta[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadTasks = useCallback(async (userId: number) => {
        try {
            setTasks(await taskService.getUserTasks(userId));
        } catch (err) {
            setError(getErrorMessage(err, "Failed to load tasks."));
        }
    }, []);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const [fetchedUsers, fetchedTypes] = await Promise.all([
                    userService.getAllUsers(),
                    taskService.getTaskTypes(),
                ]);
                if (cancelled) return;

                setUsers(fetchedUsers);
                setTaskTypes(fetchedTypes);
                if (fetchedUsers.length > 0) {
                    setCurrentUser(fetchedUsers[0]);
                    await loadTasks(fetchedUsers[0].id);
                }
            } catch (err) {
                if (!cancelled) setError(getErrorMessage(err, "Failed to load initial data."));
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [loadTasks]);

    const handleUserChange = (userId: number) => {
        const user = users.find((u) => u.id === userId) ?? null;
        setCurrentUser(user);
        setError(null);
        if (user) void loadTasks(user.id);
        else setTasks([]);
    };

    const handleCreateTask = async (title: string, type: string, assigneeId: number) => {
        setError(null);
        try {
            await taskService.createTask(title, type, assigneeId);
            if (currentUser) await loadTasks(currentUser.id);
        } catch (err) {
            setError(getErrorMessage(err, "Failed to create task."));
        }
    };

    const handleStatusChange = async (
        task: Task,
        targetStatus: number,
        customData: Record<string, unknown>,
        nextUserId: number
    ): Promise<boolean> => {
        setError(null);
        try {
            await taskService.updateStatus(task.id, targetStatus, customData, nextUserId);
            if (currentUser) await loadTasks(currentUser.id);
            return true;
        } catch (err) {
            setError(getErrorMessage(err, "Failed to update status."));
            return false;
        }
    };

    const handleCloseTask = async (taskId: number) => {
        setError(null);
        try {
            await taskService.closeTask(taskId);
            if (currentUser) await loadTasks(currentUser.id);
        } catch (err) {
            setError(getErrorMessage(err, "Failed to close task."));
        }
    };

    return (
        <div className="app-wrapper">
            <header className="app-header">
                <h1 className="app-title">Extensible Task-Management Platform</h1>
                <p className="app-subtitle">
                    Create tasks, advance or reverse their status, and reassign them across users.
                </p>
            </header>

            {error && (
                <div className="error-banner">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {loading ? (
                <div className="empty-tasks-placeholder">Loading…</div>
            ) : (
                <>
                    <UserSwitcher
                        users={users}
                        currentUser={currentUser}
                        onUserChange={handleUserChange}
                    />

                    <CreateTaskForm
                        users={users}
                        taskTypes={taskTypes}
                        onCreateTask={handleCreateTask}
                        setError={setError}
                    />

                    <section>
                        <h3 className="task-section-title">
                            3. Tasks for{" "}
                            <span className="highlight-username">{currentUser?.name ?? "—"}</span>
                        </h3>

                        {tasks.length === 0 ? (
                            <div className="empty-tasks-placeholder">
                                No tasks currently assigned to this user.
                            </div>
                        ) : (
                            tasks.map((task) => (
                                <TaskItem
                                    key={task.id}
                                    task={task}
                                    users={users}
                                    meta={taskTypes.find((t) => t.type === task.type)}
                                    onStatusChange={handleStatusChange}
                                    onCloseTask={handleCloseTask}
                                />
                            ))
                        )}
                    </section>
                </>
            )}
        </div>
    );
}