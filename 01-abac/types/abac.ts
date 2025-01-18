export interface User {
	id: string;
	role: string;
	department: string;
	clearanceLevel: number;
}

export interface Resource {
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
		user: User,
		resource: Resource,
		environment: Environment,
	) => boolean;
}
