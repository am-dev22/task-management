import { NextFunction, Request, RequestHandler, Response } from "express";
import { AppError } from "../errors";

export function asyncHandler(handler: RequestHandler): RequestHandler {
    return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
    }

    console.error("Unhandled error:", err);
    res.status(500).json({ error: "An unexpected error occurred." });
}

export function notFoundHandler(_req: Request, res: Response): void {
    res.status(404).json({ error: "Route not found." });
}
