export interface User {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	imageName: string;
	registrationDate: string;
}

export type UserBrief = Pick<User, 'id' | 'firstName' | 'lastName' | 'imageName'>;

export interface TopicSummary {
	id: string;
	name: string;
	description: string;
	imageName: string;
	creationDate: string;
	followerCount: number;
}

export interface Answer {
	id: string;
	content: string;
	creationDate: string;
	user: UserBrief;
	likeCount: number;
	likedByMe: boolean;
}

/** A question as shown inside a topic page (with a one-answer preview). */
export interface QuestionPreview {
	id: string;
	content: string;
	creationDate: string;
	user: UserBrief;
	firstAnswer: Answer | null;
}

export interface TopicDetail extends TopicSummary {
	user: UserBrief;
	isFollowing: boolean;
	questions: QuestionPreview[];
}

export interface QuestionDetail {
	id: string;
	content: string;
	creationDate: string;
	user: UserBrief;
	topic: Pick<TopicSummary, 'id' | 'name'>;
	answers: Answer[];
}

export interface Profile {
	user: User;
	questions: { id: string; content: string; creationDate: string; topic: Pick<TopicSummary, 'id' | 'name'> }[];
	answers: { id: string; content: string; creationDate: string; question: { id: string; content: string } }[];
	topicsCreated: TopicSummary[];
	topicsFollowed: TopicSummary[];
}
