import { ChangeDetectionStrategy, Component, inject, Input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '../../core/user.service';
import { AuthService } from '../../core/auth.service';
import { Profile } from '../../core/models';
import { LoadingComponent } from '../../shared/loading.component';
import { SafeContentPipe } from '../../shared/safe-content.pipe';

type Tab = 'questions' | 'answers' | 'topics' | 'followed';

const TABS: { key: Tab; label: string }[] = [
	{ key: 'questions', label: 'Questions' },
	{ key: 'answers', label: 'Answers' },
	{ key: 'topics', label: 'Topics created' },
	{ key: 'followed', label: 'Topics followed' }
];

@Component({
	selector: 'app-profile-page',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [RouterLink, DatePipe, LoadingComponent, SafeContentPipe],
	templateUrl: './profile-page.html',
	styleUrls: ['./profile-page.css']
})
export class ProfilePage {
	private readonly userService = inject(UserService);
	protected readonly auth = inject(AuthService);

	/** Bound automatically from the route via withComponentInputBinding. */
	@Input() set id(value: string) {
		void this.load(value);
	}

	@Input() set tab(value: string) {
		if (TABS.some((t) => t.key === value)) {
			this.activeTab.set(value as Tab);
		}
	}

	protected readonly tabs = TABS;
	protected readonly activeTab = signal<Tab>('questions');
	protected readonly loading = signal(true);
	protected readonly error = signal('');
	protected readonly profile = signal<Profile | null>(null);

	protected itemCount(profile: Profile, tab: Tab): number {
		switch (tab) {
			case 'questions':
				return profile.questions.length;
			case 'answers':
				return profile.answers.length;
			case 'topics':
				return profile.topicsCreated.length;
			case 'followed':
				return profile.topicsFollowed.length;
		}
	}

	private async load(id: string): Promise<void> {
		this.loading.set(true);
		try {
			this.profile.set(await this.userService.profile(id));
			this.error.set('');
		} catch {
			this.profile.set(null);
			this.error.set('This user does not exist.');
		} finally {
			this.loading.set(false);
		}
	}
}
