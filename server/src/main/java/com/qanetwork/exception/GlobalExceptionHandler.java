package com.qanetwork.exception;

import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import jakarta.validation.ConstraintViolationException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/**
 * Mirrors the JSON error contract of the previous Express API:
 * { "message": "...", "details": [{ "field": "...", "message": "..." }] }
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

	public record FieldError(String field, String message) {
	}

	public record ApiError(String message, List<FieldError> details) {
	}

	private static ResponseEntity<ApiError> of(HttpStatus status, String message, List<FieldError> details) {
		return ResponseEntity.status(status).body(new ApiError(message, details));
	}

	@ExceptionHandler(ApiException.class)
	public ResponseEntity<ApiError> handleApi(ApiException error) {
		return of(HttpStatus.valueOf(error.getStatus()), error.getMessage(), null);
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiError> handleInvalidBody(MethodArgumentNotValidException error) {
		List<FieldError> details = error.getBindingResult().getFieldErrors().stream()
				.map(fieldError -> new FieldError(fieldError.getField(), fieldError.getDefaultMessage()))
				.toList();
		String joined = details.stream().map(FieldError::message).reduce((a, b) -> a + " " + b).orElse("Invalid request.");
		return of(HttpStatus.BAD_REQUEST, joined, details);
	}

	@ExceptionHandler({HandlerMethodValidationException.class, ConstraintViolationException.class,
			HttpMessageNotReadableException.class})
	public ResponseEntity<ApiError> handleBadRequest(Exception error) {
		return of(HttpStatus.BAD_REQUEST, "Invalid request.", null);
	}

	@ExceptionHandler(MaxUploadSizeExceededException.class)
	public ResponseEntity<ApiError> handleTooLarge(MaxUploadSizeExceededException error) {
		return of(HttpStatus.BAD_REQUEST, "Image exceeds the 2MB limit.", null);
	}

	@ExceptionHandler(DataIntegrityViolationException.class)
	public ResponseEntity<ApiError> handleConflict(DataIntegrityViolationException error) {
		return of(HttpStatus.CONFLICT, "This value already exists.", null);
	}

	@ExceptionHandler(NoResourceFoundException.class)
	public ResponseEntity<ApiError> handleNoResource(NoResourceFoundException error) {
		return of(HttpStatus.NOT_FOUND, "Not found", null);
	}

	@ExceptionHandler(HttpRequestMethodNotSupportedException.class)
	public ResponseEntity<ApiError> handleMethodNotSupported(HttpRequestMethodNotSupportedException error) {
		return of(HttpStatus.METHOD_NOT_ALLOWED, "Method not allowed.", null);
	}
}
