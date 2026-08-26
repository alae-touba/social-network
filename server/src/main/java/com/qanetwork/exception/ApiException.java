package com.qanetwork.exception;

/** Carries an HTTP status so the central handler can format it as JSON. */
public class ApiException extends RuntimeException {

	private final int status;

	public ApiException(int status, String message) {
		super(message);
		this.status = status;
	}

	public int getStatus() {
		return status;
	}
}
