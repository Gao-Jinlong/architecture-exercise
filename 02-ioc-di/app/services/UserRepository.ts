import { mockUsers } from "@/database/mockData";
import { Service } from "./decorators";
import type { IUser, IUserRepository } from "./interfaces";

@Service()
export class UserRepository implements IUserRepository {
	private readonly id = Math.random().toString(36).slice(2, 10); // 添加一个随机 ID

	private users: IUser[] = mockUsers;

	getUsers(): IUser[] {
		return this.users;
	}

	getUserById(id: string): IUser | undefined {
		return this.users.find((user) => user.id === id);
	}

	addUser(user: IUser): void {
		this.users.push(user);
	}
}
