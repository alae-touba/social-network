import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
	selector: 'app-register-page',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [RouterLink],
	templateUrl: './register-page.html'
})
export class RegisterPage {
	private readonly auth = inject(AuthService);
	private readonly router = inject(Router);

	protected readonly firstName = signal('');
	protected readonly lastName = signal('');
	protected readonly email = signal('');
	protected readonly password = signal('');
	protected readonly error = signal('');
	protected readonly submitting = signal(false);

	private image: File | null = null;

	protected onImageChange(event: Event): void {
		const input = event.target as HTMLInputElement;
		this.image = input.files?.[0] ?? null;
	}

	protected async submit(): Promise<void> {
		if (this.submitting()) return;
		this.submitting.set(true);
		this.error.set('');
		try {
			await this.auth.register(
				{
					firstName: this.firstName().trim(),
					lastName: this.lastName().trim(),
					email: this.email().trim(),
					password: this.password()
				},
				this.image ?? undefined
			);
			void this.router.navigate(['/topics']);
		} catch (e) {
			this.error.set(extractErrorMessage(e));
		} finally {
			this.submitting.set(false);
		}
	}
}

function extractErrorMessage(error: unknown): string {
	const anyError = error as { message?: string; error?: { message?: string } };
	return anyError?.error?.message ?? anyError?.message ?? 'Registration failed. Please try again.';
}
