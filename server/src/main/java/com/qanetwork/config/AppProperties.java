package com.qanetwork.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(Jwt jwt, String imagesDir, String spaDir) {

	public record Jwt(String secret, int ttlDays) {
	}
}
