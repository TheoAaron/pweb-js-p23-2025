export interface User {
	id: number;
	firstName: string;
	lastName?: string;
	username: string;
	email?: string;
	[key: string]: any;
}

export interface UsersResponse {
	users: User[];
	total?: number;
	skip?: number;
	limit?: number;
}

