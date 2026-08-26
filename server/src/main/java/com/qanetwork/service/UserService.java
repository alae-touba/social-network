package com.qanetwork.service;

import java.util.List;
import java.util.Map;

import com.qanetwork.domain.Topic;
import com.qanetwork.domain.User;
import com.qanetwork.dto.Dtos;
import com.qanetwork.dto.Dtos.ProfileResponse;
import com.qanetwork.dto.Dtos.TopicSummaryDto;
import com.qanetwork.exception.ApiException;
import com.qanetwork.repository.AnswerRepository;
import com.qanetwork.repository.FollowRepository;
import com.qanetwork.repository.QuestionRepository;
import com.qanetwork.repository.TopicRepository;
import com.qanetwork.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

	private final UserRepository userRepository;
	private final QuestionRepository questionRepository;
	private final AnswerRepository answerRepository;
	private final TopicRepository topicRepository;
	private final FollowRepository followRepository;

	public UserService(UserRepository userRepository, QuestionRepository questionRepository,
			AnswerRepository answerRepository, TopicRepository topicRepository, FollowRepository followRepository) {
		this.userRepository = userRepository;
		this.questionRepository = questionRepository;
		this.answerRepository = answerRepository;
		this.topicRepository = topicRepository;
		this.followRepository = followRepository;
	}

	@Transactional(readOnly = true)
	public ProfileResponse profile(String userId) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new ApiException(404, "User not found."));

		var questions = questionRepository.findByUserIdOrderByCreationDateDesc(user.getId()).stream()
				.map(question -> new Dtos.ProfileQuestionDto(
						question.getId(), question.getContent(), question.getCreationDate(),
						new Dtos.TopicNameDto(question.getTopic().getId(), question.getTopic().getName())))
				.toList();

		var answers = answerRepository.findByUserIdOrderByCreationDateDesc(user.getId()).stream()
				.map(answer -> new Dtos.ProfileAnswerDto(
						answer.getId(), answer.getContent(), answer.getCreationDate(),
						new Dtos.QuestionListItemDto(answer.getQuestion().getId(), answer.getQuestion().getContent())))
				.toList();

		List<String> createdIds = topicRepository.findByUserIdOrderByCreationDateDesc(user.getId())
				.stream().map(Topic::getId).toList();
		Map<String, Long> createdCounts = followRepository.followerCounts(createdIds);

		List<TopicSummaryDto> topicsCreated = topicRepository.findByUserIdOrderByCreationDateDesc(user.getId())
				.stream()
				.map(topic -> Dtos.summary(topic, createdCounts))
				.toList();

		List<String> followedIds = followRepository.findTopicIdsByUserId(user.getId());
		Map<String, Long> followedCounts = followRepository.followerCounts(followedIds);
		List<TopicSummaryDto> topicsFollowed = topicRepository.findByIdInOrderByNameAsc(followedIds).stream()
				.map(topic -> Dtos.summary(topic, followedCounts))
				.toList();

		return new ProfileResponse(Dtos.safe(user), questions, answers, topicsCreated, topicsFollowed);
	}
}
