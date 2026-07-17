/**
 * Application error hierarchy. Each error carries the HTTP status code that
 * should be returned so the central error middleware can map meaning to code
 * instead of collapsing every failure onto 400.
 */
export class AppError extends Error {
    constructor(message: string, public readonly statusCode: number) {
        super(message);
        this.name = new.target.name;
    }
}

/** The request was well-formed but violated a business/validation rule (400). */
export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 400);
    }
}

/** A referenced resource does not exist (404). */
export class NotFoundError extends AppError {
    constructor(message: string) {
        super(message, 404);
    }
}

/** The request conflicts with the current state of the resource (409). */
export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 409);
    }
}
