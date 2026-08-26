package com.qanetwork.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.qanetwork.domain.Answer;
import com.qanetwork.domain.Follow;
import com.qanetwork.domain.FollowId;
import com.qanetwork.domain.Question;
import com.qanetwork.domain.Topic;
import com.qanetwork.domain.User;
import com.qanetwork.dto.Dtos;
import com.qanetwork.dto.Dtos.TopicDetailResponse;
import com.qanetwork.dto.Dtos.TopicDetailDto;
import com.qanetwork.dto.Dtos.TopicSummaryDto;
import com.qanetwork.dto.Dtos.QuestionPreviewDto;
import com.qanetwork.dto.Dtos.ToggleFollowResponse;
import com.qanetwork.dto.Requests.TopicForm;
import com.qanetwork.exception.ApiException;
import com.qanetwork.repository.AnswerRepository;
import com.qanetwork.repository.FollowRepository;
import com.qanetwork.repository.QuestionRepository;
import com.qanetwork.repository.TopicRepository;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TopicService {

	private final TopicRepository topicRepository;
	private final QuestionRepository questionRepository;
	private final AnswerRepository answerRepository;
	private final FollowRepository followRepository;
	private final ImageStorage imageStorage;

	public TopicService(TopicRepository topicRepository, QuestionRepository questionRepository,
			AnswerRepository answerRepository, FollowRepository followRepository, ImageStorage imageStorage) {
		this.topicRepository = topicRepository;
		this.questionRepository = questionRepository;
		this.answerRepository = answerRepository;
		this.followRepository = followRepository;
		this.imageStorage = imageStorage;
	}

	@Transactional(readOnly = true)
	public List<TopicSummaryDto> list(String search) {
		List<Topic> topics = (search == null || search.isBlank())
				? topicRepository.findAll(org.springframework.data.domain.Sort.by("name").ascending())
				: topicRepository.findByNameContainingIgnoreCaseOrderByNameAsc(search.trim());
		Map<String, Long> counts = followerCounts(topics);
		return topics.stream().map(topic -> Dtos.summary(topic, counts)).toList();
	}

	@Transactional
	public TopicSummaryDto create(TopicForm form, org.springframework.web.multipart.MultipartFile image, User author) {
		if (topicRepository.existsByNameIgnoreCase(form.name().trim())) {
			throw new ApiException(409, "A topic with this name already exists.");
		}
		Topic topic = new Topic();
		topic.setName(form.name().trim());
		topic.setDescription(form.description().trim());
		String uploaded = imageStorage.save(image, "topics-images");
		topic.setImageName(uploaded != null ? uploaded : "default-topic.svg");
		topic.setUser(author);
		topic = topicRepository.save(topic);
		return Dtos.summary(topic, Map.of(topic.getId(), 0L));
	}

	@Transactional(readOnly = true)
	public TopicDetailResponse detail(String topicId, User currentUser) {
		Topic topic = topicRepository.findById(topicId)
				.orElseThrow(() -> new ApiException(404, "Topic not found."));

		var questions = questionRepository.findByTopicIdOrderByCreationDateDesc(topic.getId());

		List<String> questionIds = questions.stream().map(Question::getId).toList();
		Map<String, Answer> firstAnswerByQuestion = new HashMap<>();
		if (!questionIds.isEmpty()) {
			for (Answer answer : answerRepository.findByQuestionIdInOrderByCreationDateAsc(questionIds)) {
				firstAnswerByQuestion.putIfAbsent(answer.getQuestion().getId(), answer);
			}
		}

		Set<String> followedTopicIds = new HashSet<>();
		boolean isFollowing = false;
		if (currentUser != null) {
			followedTopicIds.addAll(followRepository.findTopicIdsByUserId(currentUser.getId()));
			isFollowing = followedTopicIds.contains(topic.getId());
		}

		List<String> excluded = new ArrayList<>(followedTopicIds);
		excluded.add(topic.getId());
		List<Topic> otherTopics = topicRepository.findByIdNotInOrderByNameAsc(excluded);

		Map<String, Long> otherCounts = followerCounts(otherTopics);

		List<QuestionPreviewDto> previews = questions.stream()
				.map(question -> new QuestionPreviewDto(
						question.getId(), question.getContent(), question.getCreationDate(),
						Dtos.brief(question.getUser()),
						previewAnswer(firstAnswerByQuestion.get(question.getId()))))
				.toList();

		TopicDetailDto detail = new TopicDetailDto(
				topic.getId(), topic.getName(), topic.getDescription(), topic.getImageName(),
				topic.getCreationDate(),
				followRepository.countByIdTopicId(topic.getId()),
				Dtos.brief(topic.getUser()), isFollowing, previews);

		List<TopicSummaryDto> others = otherTopics.stream()
				.map(other -> Dtos.summary(other, otherCounts)).toList();

		return new TopicDetailResponse(detail, others);
	}

	@Transactional
	public ToggleFollowResponse toggleFollow(String topicId, User user) {
		Topic topic = topicRepository.findById(topicId)
				.orElseThrow(() -> new ApiException(404, "Topic not found."));

		FollowId key = new FollowId(user.getId(), topic.getId());
		boolean wasFollowing = followRepository.existsById(key);

		if (wasFollowing) {
			followRepository.deleteById(key);
		} else {
			try {
				followRepository.save(new Follow(key));
			} catch (DataIntegrityViolationException race) {
				// concurrent double-click: the row already exists, treat as followed
			}
		}

		long followerCount = followRepository.countByIdTopicId(topic.getId());
		return new ToggleFollowResponse(!wasFollowing, followerCount);
	}

	private Map<String, Long> followerCounts(List<Topic> topics) {
		return followRepository.followerCounts(topics.stream().map(Topic::getId).toList());
	}

	/** Preview answers carry no like state on the topic page. */
	private Dtos.AnswerDto previewAnswer(Answer answer) {
		if (answer == null) {
			return null;
		}
		return new Dtos.AnswerDto(answer.getId(), answer.getContent(), answer.getCreationDate(),
				Dtos.brief(answer.getUser()), 0L, false);
	}
}
