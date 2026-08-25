import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Answer, QuestionDetail, TopicDetail, TopicSummary } from './models';

@Injectable({ providedIn: 'root' })
export class TopicService {
	private readonly http = inject(HttpClient);

	list(search = ''): Promise<TopicSummary[]> {
		return firstValueFrom(this.http.get<TopicSummary[]>('/api/topics', { params: { search } }));
	}

	create(data: { name: string; description: string }, image?: File): Promise<{ topic: TopicSummary }> {
		const body = new FormData();
		body.set('name', data.name);
		body.set('description', data.description);
		if (image) {
			body.set('image', image);
		}
		return firstValueFrom(this.http.post<{ topic: TopicSummary }>('/api/topics', body));
	}

	detail(id: string): Promise<{ topic: TopicDetail; otherTopics: TopicSummary[] }> {
		return firstValueFrom(this.http.get<{ topic: TopicDetail; otherTopics: TopicSummary[] }>(`/api/topics/${id}`));
	}

	toggleFollow(id: string): Promise<{ isFollowing: boolean; followerCount: number }> {
		return firstValueFrom(this.http.post<{ isFollowing: boolean; followerCount: number }>(`/api/topics/${id}/follow`, {}));
	}
}

@Injectable({ providedIn: 'root' })
export class QuestionService {
	private readonly http = inject(HttpClient);

	create(topicId: string, content: string): Promise<{ question: { id: string } }> {
		return firstValueFrom(this.http.post<{ question: { id: string } }>(`/api/topics/${topicId}/questions`, { content }));
	}

	detail(id: string): Promise<{ question: QuestionDetail; otherQuestions: { id: string; content: string }[] }> {
		return firstValueFrom(this.http.get<{ question: QuestionDetail; otherQuestions: { id: string; content: string }[] }>(`/api/questions/${id}`));
	}

	answer(questionId: string, content: string): Promise<{ answer: Answer }> {
		return firstValueFrom(this.http.post<{ answer: Answer }>(`/api/questions/${questionId}/answers`, { content }));
	}
}

@Injectable({ providedIn: 'root' })
export class AnswerService {
	private readonly http = inject(HttpClient);

	toggleLike(id: string): Promise<{ isLiked: boolean; likeCount: number }> {
		return firstValueFrom(this.http.post<{ isLiked: boolean; likeCount: number }>(`/api/answers/${id}/like`, {}));
	}
}
