package com.qanetwork.service;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.qanetwork.domain.Answer;
import com.qanetwork.domain.Like;
import com.qanetwork.domain.LikeId;
import com.qanetwork.domain.Question;
import com.qanetwork.domain.Topic;
import com.qanetwork.domain.User;
import com.qanetwork.dto.Dtos;
import com.qanetwork.dto.Dtos.AnswerDto;
import com.qanetwork.dto.Dtos.QuestionDetailResponse;
import com.qanetwork.dto.Dtos.ToggleLikeResponse;
import com.qanetwork.dto.Requests.AnswerRequest;
import com.qanetwork.exception.ApiException;
import com.qanetwork.repository.AnswerRepository;
import com.qanetwork.repository.LikeRepository;
import com.qanetwork.repository.QuestionRepository;
import com.qanetwork.repository.TopicRepository;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class QuestionService {

	private final QuestionRepository questionRepository;
	private final AnswerRepository answerRepository;
	private final TopicRepository topicRepository;
	private final LikeRepository likeRepository;

	public QuestionService(QuestionRepository questionRepository, AnswerRepository answerRepository,
			TopicRepository topicRepository, LikeRepository likeRepository) {
		this.questionRepository = questionRepository;
		this.answerRepository = answerRepository;
		this.topicRepository = topicRepository;
		this.likeRepository = likeRepository;
	}

	@Transactional
	public Question create(String topicId, String content, User author) {
		Topic topic = topicRepository.findById(topicId)
				.orElseThrow(() -> new ApiException(404, "Topic not found."));
		Question question = new Question();
		question.setContent(content.trim());
		question.setUser(author);
		question.setTopic(topic);
		return questionRepository.save(question);
	}

	@Transactional
	public Answer createAnswer(String questionId, String content, User author) {
		Question question = questionRepository.findById(questionId)
				.orElseThrow(() -> new ApiException(404, "Question not found."));
		Answer answer = new Answer();
		answer.setContent(content.trim());
		answer.setUser(author);
		answer.setQuestion(question);
		return answerRepository.save(answer);
	}

	@Transactional(readOnly = true)
	public QuestionDetailResponse detail(String questionId, User currentUser) {
		Question question = questionRepository.findById(questionId)
				.orElseThrow(() -> new ApiException(404, "Question not found."));

		List<Answer> answers = answerRepository.findByQuestionIdOrderByCreationDateAsc(question.getId());
		List<String> answerIds = answers.stream().map(Answer::getId).toList();

		Set<String> likedIds = currentUser != null
				? new HashSet<>(likeRepository.findLikedAnswerIds(currentUser.getId(), answerIds))
				: Set.of();

		List<AnswerDto> answerDtos = answers.stream()
				.map(answer -> new AnswerDto(
						answer.getId(), answer.getContent(), answer.getCreationDate(),
						Dtos.brief(answer.getUser()),
						likeRepository.countByIdAnswerId(answer.getId()),
						likedIds.contains(answer.getId())))
				.toList();

		var otherQuestions = questionRepository
				.findByTopicIdAndIdNotOrderByCreationDateDesc(question.getTopic().getId(), question.getId())
				.stream()
				.map(other -> new Dtos.QuestionListItemDto(other.getId(), other.getContent()))
				.toList();

		var detail = new Dtos.QuestionDetailDto(
				question.getId(), question.getContent(), question.getCreationDate(),
				Dtos.brief(question.getUser()),
				new Dtos.TopicNameDto(question.getTopic().getId(), question.getTopic().getName()),
				answerDtos);

		return new QuestionDetailResponse(detail, otherQuestions);
	}

	@Transactional
	public ToggleLikeResponse toggleLike(String answerId, User user) {
		if (!answerRepository.existsById(answerId)) {
			throw new ApiException(404, "Answer not found.");
		}

		LikeId key = new LikeId(user.getId(), answerId);
		boolean wasLiked = likeRepository.existsById(key);

		if (wasLiked) {
			likeRepository.deleteById(key);
		} else {
			try {
				likeRepository.save(new Like(key));
			} catch (DataIntegrityViolationException race) {
				// concurrent double-click: treat as liked
			}
		}

		long likeCount = likeRepository.countByIdAnswerId(answerId);
		return new ToggleLikeResponse(!wasLiked, likeCount);
	}
}
