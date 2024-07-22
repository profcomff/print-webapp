import { BaseApi } from '../BaseApi';

export interface User {
	id: string;
	email?: string;
}

export interface DefaultResponse {
	status: string;
	message: string;
	ru?: string;
}

export interface Scope {
	id: number;
	name: string;
}

export interface Group {
	id: number;
	name: string;
	parent_id: number | null;
}

interface CreateGroupBody {
	name: string;
	parent_id: number;
	scopes: number[];
}

export enum UserInfo {
	Groups = 'groups',
	IndirectGroups = 'indirect_groups',
	SessionScopes = 'session_scopes',
	UserScopes = 'user_scopes',
	AuthMethods = 'auth_methods',
}

export enum GroupInfo {
	Children = 'child',
	Scopes = 'scopes',
	IndirectScopes = 'indirect_scopes',
	Users = 'users',
}

type UserResponse<Info extends UserInfo> = User & {
	[UserInfo.Groups]: UserInfo.Groups extends Info ? number[] : never;
	[UserInfo.IndirectGroups]: UserInfo.IndirectGroups extends Info ? number[] : never;
	[UserInfo.SessionScopes]: UserInfo.SessionScopes extends Info ? string[] : never;
	[UserInfo.UserScopes]: UserInfo.UserScopes extends Info ? number[] : never;
	[UserInfo.AuthMethods]: UserInfo.AuthMethods extends Info ? string[] : never;
};

type GetGroupResponse<Info extends GroupInfo> = Group & {
	[GroupInfo.Scopes]: GroupInfo.Scopes extends Info ? Scope[] : never;
	[GroupInfo.IndirectScopes]: GroupInfo.IndirectScopes extends Info ? Scope[] : never;
	[GroupInfo.Children]: GroupInfo.Children extends Info ? Group[] : never;
	[GroupInfo.Users]: never;
};

export class AuthBaseApi extends BaseApi {
	constructor(path = '') {
		super(`/auth${path}`, import.meta.env.VITE_AUTH_API_BASE_URL);
	}
}

class AuthMeApi extends AuthBaseApi {
	constructor() {
		super('');
	}
	public async logout() {
		return this.post<DefaultResponse>('/logout');
	}
	public async getMe<Info extends UserInfo = never>(info?: Info[]) {
		return this.get<UserResponse<Info>, { info?: Info[] }>('/me', { info });
	}
}

class AuthUserApi extends AuthBaseApi {
	constructor() {
		super('/user');
	}

	public async getUser<Info extends UserInfo = never>(id: number, info: Info[]) {
		return this.get<UserResponse<Info>, { info: Info[] }>(`/${id}`, { info });
	}

	public async deleteUser(id: number) {
		return this.delete<string>(`/${id}`);
	}

	public async getUsers<Info extends UserInfo = never>(info: Info[]) {
		return this.get<{ items: UserResponse<Info>[] }, { info: Info[] }>('', { info });
	}
}

class AuthGroupApi extends AuthBaseApi {
	constructor() {
		super('/group');
	}

	public async getGroup<Info extends GroupInfo = never>(id: number, info?: Info[]) {
		return this.get<GetGroupResponse<Info>, { info?: Info[] }>(`/${id}`, { info });
	}

	public async deleteGroup(id: number) {
		return this.delete<string>(`/${id}`, undefined);
	}

	public async patchGroup(id: number, body: Partial<CreateGroupBody>) {
		return this.patch<Group, Partial<CreateGroupBody>>(`/${id}`, body);
	}

	public async getGroups<Info extends GroupInfo>(info: Info[]) {
		return this.get<{ items: GetGroupResponse<Info>[] }, { info: Info[] }>('', { info });
	}

	public async createGroup(body: CreateGroupBody) {
		return this.post<Group, CreateGroupBody>('', body);
	}
}

export const authMeApi = new AuthMeApi();
export const authUserApi = new AuthUserApi();
export const authGroupApi = new AuthGroupApi();
