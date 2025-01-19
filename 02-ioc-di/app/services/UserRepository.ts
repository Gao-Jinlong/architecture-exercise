import { Service } from "./decorators";
import type { IUser, IUserRepository } from "./interfaces";

@Service("IUserRepository")
export class UserRepository implements IUserRepository {
	private users: IUser[] = [
		{ id: 1, name: "张三", email: "zhangsan@example.com" },
		{ id: 2, name: "李四", email: "lisi@example.com" },
	];

	getUsers(): IUser[] {
		return this.users;
	}

	getUserById(id: number): IUser | undefined {
		return this.users.find((user) => user.id === id);
	}

	addUser(user: IUser): void {
		this.users.push(user);
	}
}
