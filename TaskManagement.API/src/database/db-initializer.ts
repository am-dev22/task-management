import { AppDataSource } from "../data-source";
import { Task } from "../entities/Task";
import { User } from "../entities/User";

const RETRY_ATTEMPTS = 10;
const RETRY_DELAY_MS = 2000;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function initializeDatabase(): Promise<void> {
    await connectWithRetry();
    console.log("Database successfully connected!");
    await seedData();
}

async function connectWithRetry(): Promise<void> {
    for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
        try {
            await AppDataSource.initialize();
            return;
        } catch (error) {
            if (attempt === RETRY_ATTEMPTS) {
                console.error("Database connection failed after all retries.");
                throw error;
            }
            console.log(
                `Database not ready (attempt ${attempt}/${RETRY_ATTEMPTS}); retrying in ${RETRY_DELAY_MS}ms...`
            );
            await delay(RETRY_DELAY_MS);
        }
    }
}

async function seedData(): Promise<void> {
    const userRepository = AppDataSource.getRepository(User);
    if ((await userRepository.count()) > 0) {
        return;
    }

    console.log("Seeding demo users and tasks...");
    const users = await userRepository.save(
        userRepository.create([
            { name: "Alice (Backend Developer)" },
            { name: "Bob (Product Owner)" },
            { name: "Charlie (Procurement Manager)" },
        ])
    );

    const taskRepository = AppDataSource.getRepository(Task);
    await taskRepository.save(
        taskRepository.create([
            {
                title: "Order new office laptops",
                type: "procurement",
                status: 1,
                isClosed: false,
                customData: {},
                assignedUser: users[2],
            },
            {
                title: "Build task-management API",
                type: "development",
                status: 1,
                isClosed: false,
                customData: {},
                assignedUser: users[0],
            },
        ])
    );
    console.log("Seed data created successfully!");
}
