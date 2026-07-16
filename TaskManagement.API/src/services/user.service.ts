import { AppDataSource } from "../data-source";
import { User } from "../entities/User";

export class UserService {
    private userRepository = AppDataSource.getRepository(User);

    async getAllUsers(): Promise<User[]> {
        return await this.userRepository.find();
    }
}