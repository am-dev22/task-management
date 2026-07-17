import { AppDataSource } from "../data-source";
import { User } from "../entities/User";

export class UserService {
    private get userRepository() {
        return AppDataSource.getRepository(User);
    }

    async getAllUsers(): Promise<User[]> {
        return this.userRepository.find({ order: { id: "ASC" } });
    }
}
