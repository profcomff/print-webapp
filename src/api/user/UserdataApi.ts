import { BaseApi } from '../BaseApi';

export enum UserdataParamResponseType {
	All = 'all',
	Last = 'last',
	MostTrusted = 'most_trusted',
}

export interface UserdataRawItem {
	category: string;
	param: string;
	value: string;
}

export interface UserdataExtendedValue {
	name: string;
	is_required?: boolean;
	changeable?: boolean;
	type?: UserdataParamResponseType;
}

export interface UserdataItem {
	category: string;
	param: string;
	value: UserdataExtendedValue;
}

export interface UserdataRaw {
	items: UserdataRawItem[];
}

export class UserdataBaseApi extends BaseApi {
	constructor(path = '') {
		super(`/userdata${path}`, import.meta.env.VITE_AUTH_API_BASE_URL);
	}
}

export interface UserdataUpdateUserItem {
	category: string;
	param: string;
	value: string | null;
}

export interface UserdataUpdateUser {
	items: UserdataUpdateUserItem[];
	source: string;
}

type Json = Record<string, Record<string, string>>;

class UserdataUserApi extends UserdataBaseApi {
	constructor() {
		super('/user');
	}

	public async getById(id: number) {
		return this.get<UserdataRaw>(`/${id}`);
	}

	public async patchById(id: number, items: UserdataUpdateUserItem[], source: string = 'user') {
		return this.post<Json, UserdataUpdateUser>(`/${id}`, { items, source });
	}
}
export const userdataUserApi = new UserdataUserApi();
