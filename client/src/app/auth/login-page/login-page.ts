import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
	selector: 'app-login-page',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [RouterLink],
	templateUrl: './login-page.html'
})
export class LoginPage {
	private readonly auth = inject(AuthService);
	private readonly router = inject(Router);
	private readonly route = inject(ActivatedRoute);

	protected readonly email = signal('');
	protected readonly password = signal('');
	protected readonly error = signal('');
	protected readonly submitting = signal(false);

	protected async submit(): Promise<void> {
		if (this.submitting()) return;
		this.submitting.set(true);
		this.error.set('');
		try {
			await this.auth.login(this.email(), this.password());
			const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/topics';
			void this.router.navigateByUrl(returnUrl);
		} catch {
			this.error.set('Invalid email or password.');
		} finally {
			this.submitting.set(false);
		}
	}
}
