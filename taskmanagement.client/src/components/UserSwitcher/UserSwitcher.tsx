import React from "react";
import { User } from "../../types";
import "./UserSwitcher.css";

interface UserSwitcherProps {
    users: User[];
    currentUser: User | null;
    onUserChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const UserSwitcher: React.FC<UserSwitcherProps> = ({
    users,
    currentUser,
    onUserChange,
}) => {
    return (
        <section className="user-switcher-container">
            <h3 className="user-switcher-title">1. Active User (Who you are logged in as)</h3>
            <select
                className="user-switcher-select"
                value={currentUser?.id || ""}
                onChange={onUserChange}
            >
                {users.map((u) => (
                    <option key={u.id} value={u.id}>
                        {u.name}
                    </option>
                ))}
            </select>
        </section>
    );
};