package com.qanetwork.dto;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import com.qanetwork.domain.Answer;
import com.qanetwork.domain.Question;
import com.qanetwork.domain.Topic;
import com.qanetwork.domain.User;

/** Hand-rolled mappers that keep the JSON shapes the SPA already consumes. */
public final class Dtos {

	private Dtos() {
	}

	public record UserBriefDto(String id, String firstName, String lastName, String imageName) {
	}

	public record UserDto(String id, String firstName, String lastName, String email, String imageName,
			Instant registrationDate, String role) {
	}

	/** {id, name} projection used when a question references its topic. */
	public record TopicNameDto(String id, String name) {
	}

	public record TopicSummaryDto(String id, String name, String description, String imageName,
			Instant creationDate, long followerCount) {
	}

	public record AnswerDto(String id, String content, Instant creationDate, UserBriefDto user,
			long likeCount, boolean likedByMe) {
	}

	public record QuestionPreviewDto(String id, String content, Instant creationDate, UserBriefDto user,
			AnswerDto firstAnswer) {
	}

	public record TopicDetailDto(String id, String name, String description, String imageName,
			Instant creationDate, long followerCount, UserBriefDto user, boolean isFollowing,
			List<QuestionPreviewDto> questions) {
	}

	public record TopicDetailResponse(TopicDetailDto topic, List<TopicSummaryDto> otherTopics) {
	}

	public record QuestionListItemDto(String id, String content) {
	}

	public record QuestionDetailDto(String id, String content, Instant creationDate, UserBriefDto user,
			TopicNameDto topic, List<AnswerDto> answers) {
	}

	public record QuestionDetailResponse(QuestionDetailDto question, List<QuestionListItemDto> otherQuestions) {
	}

	public record ProfileQuestionDto(String id, String content, Instant creationDate, TopicNameDto topic) {
	}

	public record ProfileAnswerDto(String id, String content, Instant creationDate,
			QuestionListItemDto question) {
	}

	public record ProfileResponse(UserDto user, List<ProfileQuestionDto> questions,
			List<ProfileAnswerDto> answers, List<TopicSummaryDto> topicsCreated,
			List<TopicSummaryDto> topicsFollowed) {
	}

	public record AuthResponse(String token, UserDto user) {
	}

	public record ToggleFollowResponse(boolean isFollowing, long followerCount) {
	}

	public record ToggleLikeResponse(boolean isLiked, long likeCount) {
	}

	public static UserBriefDto brief(User user) {
		return new UserBriefDto(user.getId(), user.getFirstName(), user.getLastName(), user.getImageName());
	}

	public static UserDto safe(User user) {
		return new UserDto(user.getId(), user.getFirstName(), user.getLastName(), user.getEmail(),
				user.getImageName(), user.getRegistrationDate(), user.getRole().name());
	}

	public static TopicSummaryDto summary(Topic topic, Map<String, Long> followerCounts) {
		return new TopicSummaryDto(topic.getId(), topic.getName(), topic.getDescription(),
				topic.getImageName(), topic.getCreationDate(),
				followerCounts.getOrDefault(topic.getId(), 0L));
	}
}
