import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import type { User, Task, TransitionState } from "./types";
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
    const [error, setError] = useState<string | null>(null);

    const fetchUserTasksOnly = useCallback(async (userId: number) => {
        try {
            const res = await axios.get<Task[]>(`${API_BASE}/users/${userId}/tasks`);
            setTasks(res.data);
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.error || "Failed to fetch tasks");
            }
        }
    }, []);

    const fetchUsersAndTasks = useCallback(async () => {
        try {
            const usersResponse = await axios.get<User[]>(`${API_BASE}/users`);
            const fetchedUsers = usersResponse.data;
            setUsers(fetchedUsers);

            if (fetchedUsers.length > 0) {
                setCurrentUser((prevUser) => {
                    const userToUse = prevUser || fetchedUsers[0];

                    setTimeout(() => {
                        axios.get<Task[]>(`${API_BASE}/users/${userToUse.id}/tasks`)
                            .then((res) => setTasks(res.data))
                            .catch(() => setError("Failed to fetch tasks for the user"));
                    }, 0);

                    return userToUse;
                });
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.error || "Failed to load initial database data");
            } else {
                setError("An unexpected error occurred");
            }
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            void fetchUsersAndTasks();
        }, 0);
        return () => clearTimeout(timer);
    }, [fetchUsersAndTasks]);

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

    const handleCreateTask = async (title: string, type: string, assigneeId: number) => {
        try {
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
            }
        }
    };

    const handleStatusChange = async (
        task: Task,
        targetStatus: number,
        inputVal: string,
        nextUser: number
    ) => {
        setError(null);
        const customPayload: Record<string, unknown> = {};

        if (targetStatus > task.status) {
            if (task.type === "procurement") {
                if (targetStatus === 2) {
                    customPayload.priceQuotes = inputVal.split(",").map((q) => q.trim());
                } else if (targetStatus === 3) {
                    customPayload.receipt = inputVal;
                }
            } else if (task.type === "development") {
                if (targetStatus === 2) customPayload.specification = inputVal;
                if (targetStatus === 3) customPayload.branchName = inputVal;
                if (targetStatus === 4) customPayload.versionNumber = inputVal;
            }
        }

        try {
            await axios.put(`${API_BASE}/tasks/${task.id}/status`, {
                targetStatus,
                customData: customPayload,
                nextAssignedUserId: nextUser,
            });

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
            }
        }
    };

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
            }
        }
    };

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
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* Active User Switcher */}
            <UserSwitcher
                users={users}
                currentUser={currentUser}
                onUserChange={handleUserChange}
            />

            {/* Create Task */}
            <CreateTaskForm
                users={users}
                onCreateTask={handleCreateTask}
                setError={setError}
            />

            {/* Task Area */}
            <section>
                <h3 className="task-section-title">
                    3. Tasks for <span className="highlight-username">{currentUser?.name}</span>
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
                            transitionData={transitionData[task.id]}
                            onStatusChange={handleStatusChange}
                            onCloseTask={handleCloseTask}
                            onTransitionStateChange={updateTransitionState}
                        />
                    ))
                )}
            </section>
        </div>
    );
}