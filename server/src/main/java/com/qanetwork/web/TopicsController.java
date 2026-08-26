package com.qanetwork.web;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.qanetwork.domain.User;
import com.qanetwork.dto.Dtos.ToggleFollowResponse;
import com.qanetwork.dto.Dtos.TopicDetailResponse;
import com.qanetwork.dto.Dtos.TopicSummaryDto;
import com.qanetwork.dto.Requests.QuestionRequest;
import com.qanetwork.dto.Requests.TopicForm;
import com.qanetwork.service.QuestionService;
import com.qanetwork.service.TopicService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/topics")
public class TopicsController {

	private final TopicService topicService;
	private final QuestionService questionService;

	public TopicsController(TopicService topicService, QuestionService questionService) {
		this.topicService = topicService;
		this.questionService = questionService;
	}

	@GetMapping
	public java.util.List<TopicSummaryDto> list(@RequestParam(required = false) String search) {
		return topicService.list(search);
	}

	@GetMapping("/{id}")
	public TopicDetailResponse detail(@PathVariable String id, @AuthenticationPrincipal User currentUser) {
		return topicService.detail(id, currentUser);
	}

	@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@ResponseStatus(HttpStatus.CREATED)
	public Map<String, TopicSummaryDto> create(@AuthenticationPrincipal User user,
			@Valid @ModelAttribute TopicForm form,
			@RequestParam(required = false) MultipartFile image) {
		return Map.of("topic", topicService.create(form, image, user));
	}

	/** JSON variant without cover picture (kept for API parity). */
	@PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
	@ResponseStatus(HttpStatus.CREATED)
	public Map<String, TopicSummaryDto> createJson(@AuthenticationPrincipal User user,
			@Valid @RequestBody TopicForm form) {
		return Map.of("topic", topicService.create(form, null, user));
	}

	@PostMapping("/{id}/follow")
	public ToggleFollowResponse toggleFollow(@PathVariable String id, @AuthenticationPrincipal User user) {
		return topicService.toggleFollow(id, user);
	}

	@PostMapping("/{id}/questions")
	@ResponseStatus(HttpStatus.CREATED)
	public Map<String, Object> createQuestion(@PathVariable String id, @AuthenticationPrincipal User user,
			@Valid @RequestBody QuestionRequest request) {
		var question = questionService.create(id, request.content(), user);
		return Map.of("question", Map.of("id", question.getId()));
	}
}
