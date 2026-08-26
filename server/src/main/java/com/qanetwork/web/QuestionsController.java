package com.qanetwork.web;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.qanetwork.domain.User;
import com.qanetwork.dto.Dtos;
import com.qanetwork.dto.Dtos.ToggleLikeResponse;
import com.qanetwork.dto.Requests.AnswerRequest;
import com.qanetwork.service.QuestionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class QuestionsController {

	private final QuestionService questionService;

	public QuestionsController(QuestionService questionService) {
		this.questionService = questionService;
	}

	@GetMapping("/questions/{id}")
	public Dtos.QuestionDetailResponse detail(@PathVariable String id, @AuthenticationPrincipal User currentUser) {
		return questionService.detail(id, currentUser);
	}

	@PostMapping("/questions/{id}/answers")
	@ResponseStatus(HttpStatus.CREATED)
	public Map<String, Dtos.AnswerDto> createAnswer(@PathVariable String id, @AuthenticationPrincipal User user,
			@Valid @RequestBody AnswerRequest request) {
		return Map.of("answer", answerDto(questionService.createAnswer(id, request.content(), user)));
	}

	@PostMapping("/answers/{id}/like")
	public ToggleLikeResponse toggleLike(@PathVariable String id, @AuthenticationPrincipal User user) {
		return questionService.toggleLike(id, user);
	}

	private static Dtos.AnswerDto answerDto(com.qanetwork.domain.Answer answer) {
		return new Dtos.AnswerDto(answer.getId(), answer.getContent(), answer.getCreationDate(),
				com.qanetwork.dto.Dtos.brief(answer.getUser()), 0L, false);
	}
}
