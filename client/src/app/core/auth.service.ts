import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { User } from './models';

interface AuthResponse {
	user: User;
}

/** Holds the session user and talks to the /api/auth endpoints. */
@Injectable({ providedIn: 'root' })
export class AuthService {
	private readonly http = inject(HttpClient);
	private readonly router = inject(Router);

	readonly currentUser = signal<User | null>(null);

	private loadPromise: Promise<boolean> | null = null;

	/** Resolves the session once; used by guards and the shell on startup. */
	ensureLoaded(): Promise<boolean> {
		this.loadPromise ??= firstValueFrom(this.http.get<AuthResponse | null>('/api/auth/me'))
			.then((response) => {
				this.currentUser.set(response?.user ?? null);
				return true;
			})
			.catch(() => false);
		return this.loadPromise;
	}

	isLoggedIn(): boolean {
		return this.currentUser() !== null;
	}

	async login(email: string, password: string): Promise<User> {
		const response = await firstValueFrom(this.http.post<AuthResponse>('/api/auth/login', { email, password }));
		this.currentUser.set(response.user);
		return response.user;
	}

	async register(data: { firstName: string; lastName: string; email: string; password: string }, image?: File): Promise<User> {
		const body = new FormData();
		body.set('firstName', data.firstName);
		body.set('lastName', data.lastName);
		body.set('email', data.email);
		body.set('password', data.password);
		if (image) {
			body.set('image', image);
		}
		const response = await firstValueFrom(this.http.post<AuthResponse>('/api/auth/register', body));
		this.currentUser.set(response.user);
		return response.user;
	}

	async logout(): Promise<void> {
		await firstValueFrom(this.http.post('/api/auth/logout', {})).catch(() => undefined);
		this.currentUser.set(null);
		void this.router.navigate(['/topics']);
	}
}
