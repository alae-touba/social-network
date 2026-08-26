package com.qanetwork.web;

import com.qanetwork.exception.ApiException;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Unknown /api paths must answer with a JSON 404, not the SPA's index.html
 * (controller mappings take precedence over the static-resource handler).
 */
@RestController
public class ApiFallbackController {

	@GetMapping("/api/**")
	public void notFound() {
		throw new ApiException(404, "API route not found.");
	}
}
