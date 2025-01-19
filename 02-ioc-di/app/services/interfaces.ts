// 用户接口
export interface IUser {
	id: number;
	name: string;
	email: string;
}

// 数据存储接口
export interface IUserRepository {
	getUsers(): IUser[];
	getUserById(id: number): IUser | undefined;
	addUser(user: IUser): void;
}

// 用户服务接口
export interface IUserService {
	getAllUsers(): IUser[];
	getUser(id: number): IUser | undefined;
	createUser(user: IUser): void;
}
