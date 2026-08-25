import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';

@Component({
	selector: 'app-root',
	imports: [RouterOutlet, RouterLink, RouterLinkActive],
	templateUrl: './app.html',
	styleUrl: './app.css'
})
export class App implements OnInit {
	protected readonly auth = inject(AuthService);

	ngOnInit(): void {
		void this.auth.ensureLoaded();
	}
}
