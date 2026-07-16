import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Task } from "./entities/Task";

export const AppDataSource = new DataSource({
    type: "better-sqlite3", // Updated from "sqlite"
    database: "database.sqlite",
    synchronize: true, // Auto-creates database schema from your entities
    logging: false,
    entities: [User, Task],
    subscribers: [],
    migrations: [],
});