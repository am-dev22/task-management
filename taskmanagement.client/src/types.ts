export interface User {
    id: number;
    name: string;
}

export interface Task {
    id: number;
    title: string;
    type: string;
    status: number;
    isClosed: boolean;
    customData: Record<string, unknown>;
    assignedUser: User;
}

export interface TransitionState {
    nextUser: number;
    inputField: string;
}