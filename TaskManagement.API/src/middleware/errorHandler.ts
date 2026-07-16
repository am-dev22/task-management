import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ error: err.message });
    }

    // Default catch-all for unhandled system exceptions
    console.error("Unhandled Exception:", err);
    return res.status(500).json({ error: "Internal Server Error" });
};