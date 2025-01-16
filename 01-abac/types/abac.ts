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
}

export interface Environment extends ClientEnvironment {
  time: Date;
}
export interface ClientEnvironment {
  location: string;
}

export interface Policy {
  name: string;
  evaluate: (user: User, resource: Resource, environment: Environment) => boolean;
} 