import { AuthService } from "./AuthService";
import { UserRepository } from "./UserRepository";
import { Inject, Service } from "./decorators";
import type { IUser, IUserRepository, IUserService } from "./interfaces";

@Service()
export class UserService implements IUserService {
	@Inject(UserRepository)
	private readonly userRepository!: IUserRepository;
	private readonly authService!: AuthService;

	getAllUsers(): IUser[] {
		return this.userRepository.getUsers();
	}

	getUser(id: string): IUser | undefined {
		return this.userRepository.getUserById(id);
	}

	createUser(user: IUser): void {
		this.userRepository.addUser(user);
	}
}
