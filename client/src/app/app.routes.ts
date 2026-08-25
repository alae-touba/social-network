import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth.guard';

export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'topics' },
	{
		path: 'topics',
		title: 'Topics',
		loadComponent: () => import('./topics/topic-list-page/topic-list-page').then((m) => m.TopicListPage)
	},
	{
		path: 'topics/create',
		title: 'Create a topic',
		canActivate: [authGuard],
		loadComponent: () => import('./topics/topic-form-page/topic-form-page').then((m) => m.TopicFormPage)
	},
	{
		path: 'topics/:id',
		title: 'Topic',
		loadComponent: () => import('./topics/topic-detail-page/topic-detail-page').then((m) => m.TopicDetailPage)
	},
	{
		path: 'questions/:id',
		title: 'Question',
		loadComponent: () => import('./questions/question-detail-page/question-detail-page').then((m) => m.QuestionDetailPage)
	},
	{
		path: 'users/:id',
		title: 'Profile',
		loadComponent: () => import('./profile/profile-page/profile-page').then((m) => m.ProfilePage)
	},
	{
		path: 'login',
		title: 'Log in',
		canActivate: [guestGuard],
		loadComponent: () => import('./auth/login-page/login-page').then((m) => m.LoginPage)
	},
	{
		path: 'register',
		title: 'Register',
		canActivate: [guestGuard],
		loadComponent: () => import('./auth/register-page/register-page').then((m) => m.RegisterPage)
	},
	{
		path: '**',
		title: 'Not found',
		loadComponent: () => import('./shared/not-found-page/not-found-page').then((m) => m.NotFoundPage)
	}
];
