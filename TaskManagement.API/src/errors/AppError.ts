export class AppError extends Error {
    constructor(public statusCode: number, message: string) {
        super(message);
        // Corrected: Uses 'new.target.prototype' to restore the correct prototype chain
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class NotFoundError extends AppError {
    constructor(message = "Resource not found") {
        super(404, message);
    }
}

export class BadRequestError extends AppError {
    constructor(message = "Bad request") {
        super(400, message);
    }
}