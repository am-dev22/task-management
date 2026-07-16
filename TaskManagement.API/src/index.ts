import express from "express";
import cors from "cors";
import { initializeDatabase } from "./database/db-initializer";
import userRoutes from "./routes/user.routes";
import taskRoutes from "./routes/task.routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

// Mount Routed API Groups
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);

// Global Error Handler (MUST be placed after all routes)
app.use(errorHandler);

// Bootstrapping
initializeDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Application failed to start due to database error:", error);
    });