import axios, { AxiosResponse } from 'axios';
import queryString from 'query-string';
import { useProfileStore } from '../store';

const profileStore = useProfileStore();
type Path = `/${string}` | '';

export class BaseApi {
	url: string;

	constructor(path: Path, base: string = document.location.origin) {
		this.url = base + path;
	}

	private ensureToken(): string | null {
		if (!profileStore.token) profileStore.fromUrl();
		if (profileStore.token) return profileStore.token;
		return null;
	}

	protected async get<Response, Params = never>(
		path: Path,
		params?: Partial<Params>,
		headers: Record<string, string> = {},
	): Promise<AxiosResponse<Response>> {
		if (!headers.Authorization) {
			const token = this.ensureToken();
			if (token) headers.Authorization = token;
		}
		return axios.get<Response>(`${this.url}${path}`, {
			params,
			headers,
			paramsSerializer: {
				serialize: params => queryString.stringify(params, { arrayFormat: 'none' }),
			},
		});
	}

	protected async post<Response, Body = never, Params = never>(
		path: Path,
		body?: Body,
		params?: Params,
		headers: Record<string, string> = {},
	): Promise<AxiosResponse<Response>> {
		if (!headers.Authorization) {
			const token = this.ensureToken();
			if (token) headers.Authorization = token;
		}
		return axios.post<Response, AxiosResponse<Response>, Body>(`${this.url}${path}`, body, { headers, params });
	}

	protected async delete<Response = never, Params = never>(
		path: Path,
		params?: Params,
		headers: Record<string, string> = {},
	): Promise<AxiosResponse<Response>> {
		if (!headers.Authorization) {
			const token = this.ensureToken();
			if (token) headers.Authorization = token;
		}
		return axios.delete<Response>(`${this.url}${path}`, { params, headers });
	}

	protected async patch<Response = never, Body = never>(
		path: Path,
		body?: Body,
		headers: Record<string, string> = {},
	): Promise<AxiosResponse<Response>> {
		if (!headers.Authorization) {
			const token = this.ensureToken();
			if (token) headers.Authorization = token;
		}
		return axios.patch<Response, AxiosResponse<Response>, Body>(`${this.url}${path}`, body, { headers });
	}

	protected async put<Response = never, Body = never, Params = never>(
		path: Path,
		body?: Body,
		params?: Params,
		headers: Record<string, string> = {},
	): Promise<AxiosResponse<Response>> {
		if (!headers.Authorization) {
			const token = this.ensureToken();
			if (token) headers.Authorization = token;
		}
		return axios.put(`${this.url}${path}`, body, { params });
	}
}
