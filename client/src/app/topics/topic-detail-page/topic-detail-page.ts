import { ChangeDetectionStrategy, Component, inject, Input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { QuestionService, TopicService } from '../../core/content.services';
import { AuthService } from '../../core/auth.service';
import { TopicDetail, TopicSummary } from '../../core/models';
import { LoadingComponent } from '../../shared/loading.component';
import { SafeContentPipe } from '../../shared/safe-content.pipe';

@Component({
	selector: 'app-topic-detail-page',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [RouterLink, DatePipe, LoadingComponent, SafeContentPipe],
	templateUrl: './topic-detail-page.html',
	styleUrls: ['../topics.css']
})
export class TopicDetailPage {
	private readonly topicService = inject(TopicService);
	private readonly questionService = inject(QuestionService);
	protected readonly auth = inject(AuthService);

	/** Bound automatically from the route via withComponentInputBinding. */
	@Input() set id(value: string) {
		void this.load(value);
	}

	protected readonly loading = signal(true);
	protected readonly error = signal('');
	protected readonly data = signal<{ topic: TopicDetail; otherTopics: TopicSummary[] } | null>(null);

	protected readonly askFormOpen = signal(false);
	protected readonly newQuestion = signal('');
	protected readonly submitting = signal(false);
	protected readonly submitError = signal('');

	private currentId = '';

	protected async toggleFollow(): Promise<void> {
		const current = this.data();
		if (!current) return;
		const result = await this.topicService.toggleFollow(current.topic.id);
		this.data.set({
			...current,
			topic: { ...current.topic, isFollowing: result.isFollowing, followerCount: result.followerCount }
		});
	}

	protected async submitQuestion(): Promise<void> {
		if (this.submitting()) return;
		this.submitting.set(true);
		this.submitError.set('');
		try {
			await this.questionService.create(this.currentId, this.newQuestion());
			this.askFormOpen.set(false);
			this.newQuestion.set('');
			await this.load(this.currentId);
		} catch {
			this.submitError.set('Could not post your question. Please try again.');
		} finally {
			this.submitting.set(false);
		}
	}

	private async load(id: string): Promise<void> {
		this.currentId = id;
		this.loading.set(true);
		try {
			this.data.set(await this.topicService.detail(id));
			this.error.set('');
		} catch {
			this.data.set(null);
			this.error.set('This topic does not exist.');
		} finally {
			this.loading.set(false);
		}
	}
}
