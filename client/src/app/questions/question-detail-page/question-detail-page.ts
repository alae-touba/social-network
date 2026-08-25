import { ChangeDetectionStrategy, Component, inject, Input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AnswerService, QuestionService } from '../../core/content.services';
import { AuthService } from '../../core/auth.service';
import { Answer, QuestionDetail } from '../../core/models';
import { LoadingComponent } from '../../shared/loading.component';
import { SafeContentPipe } from '../../shared/safe-content.pipe';

@Component({
	selector: 'app-question-detail-page',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [RouterLink, DatePipe, LoadingComponent, SafeContentPipe],
	templateUrl: './question-detail-page.html',
	styleUrls: ['./question-detail-page.css']
})
export class QuestionDetailPage {
	private readonly questionService = inject(QuestionService);
	private readonly answerService = inject(AnswerService);
	protected readonly auth = inject(AuthService);

	/** Bound automatically from the route via withComponentInputBinding. */
	@Input() set id(value: string) {
		void this.load(value);
	}

	protected readonly loading = signal(true);
	protected readonly error = signal('');
	protected readonly question = signal<QuestionDetail | null>(null);
	protected readonly otherQuestions = signal<{ id: string; content: string }[]>([]);

	protected readonly answerFormOpen = signal(false);
	protected readonly newAnswer = signal('');
	protected readonly submitting = signal(false);
	protected readonly submitError = signal('');

	protected async toggleLike(answer: Answer): Promise<void> {
		if (!this.auth.currentUser()) return;
		const result = await this.answerService.toggleLike(answer.id);
		this.question.update((current) =>
			current
				? {
						...current,
						answers: current.answers.map((a) => (a.id === answer.id ? { ...a, likedByMe: result.isLiked, likeCount: result.likeCount } : a))
					}
				: current
		);
	}

	protected async submitAnswer(): Promise<void> {
		if (this.submitting()) return;
		this.submitting.set(true);
		this.submitError.set('');
		try {
			const { answer } = await this.questionService.answer(this.currentId, this.newAnswer());
			this.question.update((current) => (current ? { ...current, answers: [...current.answers, answer] } : current));
			this.answerFormOpen.set(false);
			this.newAnswer.set('');
		} catch {
			this.submitError.set('Could not post your answer. Please try again.');
		} finally {
			this.submitting.set(false);
		}
	}

	private currentId = '';

	private async load(id: string): Promise<void> {
		this.currentId = id;
		this.loading.set(true);
		try {
			const data = await this.questionService.detail(id);
			this.question.set(data.question);
			this.otherQuestions.set(data.otherQuestions);
			this.error.set('');
		} catch {
			this.question.set(null);
			this.error.set('This question does not exist.');
		} finally {
			this.loading.set(false);
		}
	}
}
