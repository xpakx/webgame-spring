import { Client } from "../client"

export class AuthService {
	private http: Client;

	constructor(http: Client) {
		this.http = http;
	}

	async register(request: RegistrationRequest): Promise<AuthResponse> {
		return this.http.post('/register', request);
	}

	async authenticate(request: AuthRequest): Promise<AuthResponse> {
		return this.http.post('/authenticate', request);
	}
}

export interface RegistrationRequest {
	username: string;
	password: string;
	passwordRe: string;
}

export interface AuthResponse {
	token: string;
	refreshToken: string;
	username: string;
	moderatorRole: boolean;
}

export interface AuthRequest {
	username: string;
	password: string;
}
