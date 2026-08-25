import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Allows navigation only for logged-in users. */
export const authGuard: CanActivateFn = async (_route, state) => {
	const auth = inject(AuthService);
	const router = inject(Router);
	await auth.ensureLoaded();
	if (auth.isLoggedIn()) {
		return true;
	}
	return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

/** Keeps logged-in users away from login/register pages. */
export const guestGuard: CanActivateFn = async () => {
	const auth = inject(AuthService);
	const router = inject(Router);
	await auth.ensureLoaded();
	return auth.isLoggedIn() ? router.createUrlTree(['/topics']) : true;
};
