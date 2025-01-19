import { Inject, Service } from "./decorators";
import type { IUser, IUserRepository, IUserService } from "./interfaces";

@Service("IUserService")
export class UserService implements IUserService {
	@Inject("IUserRepository")
	private readonly userRepository!: IUserRepository;

	getAllUsers(): IUser[] {
		return this.userRepository.getUsers();
	}

	getUser(id: number): IUser | undefined {
		return this.userRepository.getUserById(id);
	}

	createUser(user: IUser): void {
		this.userRepository.addUser(user);
	}
}
