import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import type { User, Task, TransitionState } from "./types";
import { TASK_TYPE_CONFIGS } from "./types"; // Import the dynamic configuration mapping
import { UserSwitcher } from "./components/UserSwitcher/UserSwitcher";
import { CreateTaskForm } from "./components/CreateTaskForm/CreateTaskForm";
import { TaskItem } from "./components/TaskItem/TaskItem";
import "./App.css";

const API_BASE = "http://localhost:3000/api";

export default function App() {
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [transitionData, setTransitionData] = useState<Record<number, TransitionState>>({});

    // UI Loading & Error States
    const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
    const [loadingTasks, setLoadingTasks] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // 1. Fetch tasks for a specific user (no race conditions)
    const fetchUserTasksOnly = useCallback(async (userId: number) => {
        try {
            setLoadingTasks(true);
            setError(null);
            const res = await axios.get<Task[]>(`${API_BASE}/users/${userId}/tasks`);
            setTasks(res.data);
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.error || "Failed to fetch tasks");
            } else {
                setError("An unexpected error occurred while fetching tasks.");
            }
        } finally {
            setLoadingTasks(false);
        }
    }, []);

    // 2. Load initial setup: Fetch all users and auto-select the first one
    useEffect(() => {
        let isMounted = true;

        async function loadInitialDatabase() {
            try {
                setLoadingUsers(true);
                setError(null);
                const usersResponse = await axios.get<User[]>(`${API_BASE}/users`);
                const fetchedUsers = usersResponse.data;

                if (!isMounted) return;

                setUsers(fetchedUsers);

                if (fetchedUsers.length > 0) {
                    const initialUser = fetchedUsers[0];
                    setCurrentUser(initialUser);
                    // Fetch tasks directly via user ID without using impure updaters or setTimeout hacks
                    void fetchUserTasksOnly(initialUser.id);
                }
            } catch (err: unknown) {
                if (!isMounted) return;
                if (axios.isAxiosError(err)) {
                    setError(err.response?.data?.error || "Failed to load initial database data");
                } else {
                    setError("An unexpected error occurred during initialization.");
                }
            } finally {
                if (isMounted) {
                    setLoadingUsers(false);
                }
            }
        }

        void loadInitialDatabase();

        return () => {
            isMounted = false;
        };
    }, [fetchUserTasksOnly]);

    // 3. Handle explicit user identity change
    const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedUserId = Number(e.target.value);
        const user = users.find((u) => u.id === selectedUserId);

        if (user) {
            setCurrentUser(user);
            void fetchUserTasksOnly(user.id);
        } else {
            setCurrentUser(null);
            setTasks([]);
        }
    };

    // 4. Create task
    const handleCreateTask = async (title: string, type: string, assigneeId: number) => {
        try {
            setError(null);
            await axios.post(`${API_BASE}/tasks`, {
                title,
                type,
                assignedUserId: assigneeId,
            });
            if (currentUser) {
                void fetchUserTasksOnly(currentUser.id);
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.error || "Failed to create task");
            } else {
                setError("An unexpected error occurred during task creation.");
            }
        }
    };

    // 5. Update status dynamically using the configuration map (Removes the L1 leakage)
    const handleStatusChange = async (
        task: Task,
        targetStatus: number,
        inputVal: string,
        nextUser: number
    ) => {
        setError(null);
        const customPayload: Record<string, unknown> = {};

        // Only evaluate custom fields if we are progressing forward
        if (targetStatus > task.status) {
            const config = TASK_TYPE_CONFIGS[task.type];
            if (config) {
                // Find matching state config for the target status level
                const stepConfig = config.steps[targetStatus];
                if (stepConfig) {
                    const { fieldName, validate, transform } = stepConfig;

                    // Execute custom input validation if defined
                    if (validate && !validate(inputVal)) {
                        setError(`Invalid input format for status level ${targetStatus}`);
                        return;
                    }

                    // Apply type transformations (e.g., parsing csv arrays or numbers)
                    customPayload[fieldName] = transform ? transform(inputVal) : inputVal;
                }
            }
        }

        try {
            await axios.put(`${API_BASE}/tasks/${task.id}/status`, {
                targetStatus,
                customData: customPayload,
                nextAssignedUserId: nextUser,
            });

            // Reset transition form state cleanly
            setTransitionData((prev) => ({
                ...prev,
                [task.id]: { nextUser: task.assignedUser.id, inputField: "" },
            }));

            if (currentUser) {
                void fetchUserTasksOnly(currentUser.id);
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.error || "Failed to update status");
            } else {
                setError("An unexpected error occurred while updating status.");
            }
        }
    };

    // 6. Permanently Close task
    const handleCloseTask = async (taskId: number) => {
        setError(null);
        try {
            await axios.put(`${API_BASE}/tasks/${taskId}/close`);
            if (currentUser) {
                void fetchUserTasksOnly(currentUser.id);
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.error || "Failed to close task");
            } else {
                setError("An unexpected error occurred while closing the task.");
            }
        }
    };

    // 7. Track active transition state inputs safely
    const updateTransitionState = (
        taskId: number,
        key: "nextUser" | "inputField",
        value: string | number
    ) => {
        setTransitionData((prev) => {
            const existing = prev[taskId] || { nextUser: currentUser?.id || 1, inputField: "" };
            return {
                ...prev,
                [taskId]: {
                    ...existing,
                    [key]: value,
                },
            };
        });
    };

    return (
        <div className="app-wrapper">
            {/* Header */}
            <header className="app-header">
                <h1 className="app-title">Extensible Task-Management Platform</h1>
                <p className="app-subtitle">
                    A secure, multi-strategy workspace with real-time backend updates
                </p>
            </header>

            {/* Error Display */}
            {error && (
                <div className="error-banner">
                    <span className="error-message"><strong>Error:</strong> {error}</span>
                    <button onClick={() => setError(null)} className="error-close-btn" aria-label="Dismiss error">✕</button>
                </div>
            )}

            {/* Active User Switcher */}
            {loadingUsers ? (
                <div className="loader">Initializing system users...</div>
            ) : (
                <UserSwitcher
                    users={users}
                    currentUser={currentUser}
                    onUserChange={handleUserChange}
                />
            )}

            {/* Create Task Form */}
            <CreateTaskForm
                users={users}
                onCreateTask={handleCreateTask}
                setError={setError}
            />

            {/* Task Area */}
            <section className="tasks-section">
                <h3 className="task-section-title">
                    Tasks for <span className="highlight-username">{currentUser?.name || "unselected profile"}</span>
                </h3>

                {loadingTasks ? (
                    <div className="loader">Syncing user workspace queue...</div>
                ) : tasks.length === 0 ? (
                    <div className="empty-tasks-placeholder">
                        No tasks currently assigned to this user.
                    </div>
                ) : (
                    <div className="tasks-list">
                        {tasks.map((task) => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                users={users}
                                transitionData={transitionData[task.id]}
                                onStatusChange={handleStatusChange}
                                onCloseTask={handleCloseTask}
                                onTransitionStateChange={updateTransitionState}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}