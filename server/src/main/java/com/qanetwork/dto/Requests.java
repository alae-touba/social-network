package com.qanetwork.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class Requests {

	private Requests() {
	}

	public record LoginRequest(@NotBlank String email, @NotBlank String password) {
	}

	public record TopicForm(
			@NotBlank @Size(min = 2, max = 50) String name,
			@NotBlank @Size(min = 20, max = 255) String description) {
	}

	public record QuestionRequest(@NotBlank @Size(min = 10) String content) {
	}

	public record AnswerRequest(@NotBlank @Size(min = 2) String content) {
	}
}
