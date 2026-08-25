import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TopicService } from '../../core/content.services';

@Component({
	selector: 'app-topic-form-page',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [],
	templateUrl: './topic-form-page.html',
	styleUrls: ['../topics.css']
})
export class TopicFormPage {
	private readonly topicService = inject(TopicService);
	private readonly router = inject(Router);

	protected readonly name = signal('');
	protected readonly description = signal('');
	protected readonly submitting = signal(false);
	protected readonly error = signal('');

	private image: File | null = null;

	protected onImageChange(event: Event): void {
		const input = event.target as HTMLInputElement;
		this.image = input.files?.[0] ?? null;
	}

	protected async submit(): Promise<void> {
		if (this.submitting()) return;
		const name = this.name().trim();
		const description = this.description().trim();
		if (name.length < 2 || description.length < 20) {
			this.error.set('Name needs at least 2 characters and description at least 20.');
			return;
		}
		this.submitting.set(true);
		this.error.set('');
		try {
			const { topic } = await this.topicService.create({ name, description }, this.image ?? undefined);
			void this.router.navigate(['/topics', topic.id]);
		} catch {
			this.error.set('Could not create the topic. Please try again.');
		} finally {
			this.submitting.set(false);
		}
	}
}
