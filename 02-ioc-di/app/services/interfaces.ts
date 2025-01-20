/** 用户接口 */
export interface IUser {
	id: string;
	name: string;
	email: string;
	role: string;
	department: string;
	clearanceLevel: number;
}

/** 数据存储接口 */
export interface IUserRepository {
	getUsers(): IUser[];
	getUserById(id: string): IUser | undefined;
	addUser(user: IUser): void;
}

/** 用户服务接口 */
export interface IUserService {
	getAllUsers(): IUser[];
	getUser(id: string): IUser | undefined;
	createUser(user: IUser): void;
}

/** 资源接口 */
export interface IResource {
	id: string;
	type: string;
	classification: string;
	ownerDepartment: string;
	securityLevel: number;
	publishDate: number;
	expiredDate: number;
}

export interface Environment extends ClientEnvironment {
	time: number;
}
export interface ClientEnvironment {
	location: string;
}
export interface Policy {
	name: string;
	evaluate: (
		user: IUser,
		resource: IResource,
		environment: Environment,
	) => boolean;
}
