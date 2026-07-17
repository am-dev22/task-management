import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Task } from "./entities/Task";

// Configuration is driven entirely by environment variables so the same image
// runs unchanged locally, in Docker Compose, or against a managed database.
export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USER ?? "postgres",
    password: process.env.DB_PASSWORD ?? "postgres",
    database: process.env.DB_NAME ?? "taskmanagement",
    // synchronize keeps the schema in sync with the entities. Convenient for a
    // demo; a production system would use generated migrations instead.
    synchronize: true,
    logging: process.env.DB_LOGGING === "true",
    entities: [User, Task],
    subscribers: [],
    migrations: [],
});
