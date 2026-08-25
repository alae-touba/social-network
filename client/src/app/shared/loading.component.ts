import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
	selector: 'app-loading',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `<div class="loading"><span class="spinner"></span> Loading…</div>`
})
export class LoadingComponent {}
