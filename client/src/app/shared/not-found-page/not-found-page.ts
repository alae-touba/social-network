import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
	selector: 'app-not-found-page',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [RouterLink],
	template: `
		<div class="card not-found">
			<h1>Page not found</h1>
			<p>The page you are looking for does not exist.</p>
			<a routerLink="/topics" class="btn btn-primary">← Back to topics</a>
		</div>
	`,
	styles: [
		`
			.not-found {
				max-width: 420px;
				margin: 3rem auto;
				text-align: center;
			}
		`
	]
})
export class NotFoundPage {}
