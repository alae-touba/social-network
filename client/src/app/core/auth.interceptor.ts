import { HttpInterceptorFn } from '@angular/common/http';
import { getToken } from './token';

/** Attaches the JWT to every outgoing API request. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
	const token = getToken();
	if (!token) {
		return next(req);
	}
	return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
