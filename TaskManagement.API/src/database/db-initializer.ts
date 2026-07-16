import { AppDataSource } from "../data-source";
import { User } from "../entities/User";

export async function initializeDatabase(): Promise<void> {
    try {
        await AppDataSource.initialize();
        console.log("Database successfully connected!");

        const userRepository = AppDataSource.getRepository(User);
        const count = await userRepository.count();
        if (count === 0) {
            console.log("Seeding initial users...");
            const usersToSeed = [
                { name: "Alice Backend Developer" },
                { name: "Bob Product Owner" },
                { name: "Charlie Procurement Manager" }
            ];
            await userRepository.save(userRepository.create(usersToSeed));
            console.log("Users seeded successfully!");
        }
    } catch (error) {
        console.error("Database connection error: ", error);
        throw error;
    }
}