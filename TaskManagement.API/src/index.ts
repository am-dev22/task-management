import "dotenv/config";
import express from "express";
import cors from "cors";
import { initializeDatabase } from "./database/db-initializer";
import userRoutes from "./routes/user.routes";
import taskRoutes from "./routes/task.routes";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT ?? 3000);

// Liveness probe (used by the Docker healthcheck).
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// Mounted API groups.
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);

// 404 + central error handling (must be registered after the routes).
app.use(notFoundHandler);
app.use(errorHandler);

// Bootstrap: connect + seed, then start listening.
initializeDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Application failed to start due to database error:", error);
        process.exit(1);
    });
