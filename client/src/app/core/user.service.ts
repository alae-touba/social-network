import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Profile } from './models';

@Injectable({ providedIn: 'root' })
export class UserService {
	private readonly http = inject(HttpClient);

	profile(id: string): Promise<Profile> {
		return firstValueFrom(this.http.get<Profile>(`/api/users/${id}`));
	}
}
