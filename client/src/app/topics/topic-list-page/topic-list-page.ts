import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TopicService } from '../../core/content.services';
import { AuthService } from '../../core/auth.service';
import { TopicSummary } from '../../core/models';
import { LoadingComponent } from '../../shared/loading.component';

@Component({
	selector: 'app-topic-list-page',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [RouterLink, DatePipe, LoadingComponent],
	templateUrl: './topic-list-page.html',
	styleUrls: ['../topics.css']
})
export class TopicListPage {
	private readonly topicService = inject(TopicService);
	protected readonly auth = inject(AuthService);

	protected readonly loading = signal(true);
	protected readonly error = signal('');
	protected readonly topics = signal<TopicSummary[]>([]);
	protected readonly search = signal('');
	protected readonly searching = signal(false);

	private searchTimer: ReturnType<typeof setTimeout> | undefined;

	constructor() {
		effect(() => {
			const term = this.search().trim();
			clearTimeout(this.searchTimer);
			if (!term) {
				this.searching.set(false);
				void this.loadTopics();
				return;
			}
			this.searching.set(true);
			this.searchTimer = setTimeout(() => void this.loadTopics(term), 250);
		});
	}

	private async loadTopics(search = ''): Promise<void> {
		try {
			const topics = await this.topicService.list(search);
			this.topics.set(topics);
			this.error.set('');
		} catch {
			this.error.set('Could not load topics. Is the server running?');
		} finally {
			this.loading.set(false);
			this.searching.set(false);
		}
	}
}
