package com.qanetwork.security;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

import javax.crypto.SecretKey;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import com.qanetwork.config.AppProperties;
import com.qanetwork.domain.User;

import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Service;

/**
 * Issues and verifies HS256 tokens using the Nimbus library bundled with
 * spring-security-oauth2-resource-server (no extra dependency needed).
 */
@Service
public class JwtService {

	private final SecretKey key;
	private final NimbusJwtDecoder decoder;
	private final long ttlSeconds;

	public JwtService(AppProperties properties) {
		byte[] secretBytes = properties.jwt().secret().getBytes(StandardCharsets.UTF_8);
		if (secretBytes.length < 32) {
			throw new IllegalStateException(
					"app.jwt.secret must be at least 32 characters (256 bits for HS256).");
		}
		this.key = new javax.crypto.spec.SecretKeySpec(secretBytes, "HmacSHA256");
		this.decoder = NimbusJwtDecoder.withSecretKey(key)
				.macAlgorithm(org.springframework.security.oauth2.jose.jws.MacAlgorithm.HS256)
				.build();
		this.ttlSeconds = properties.jwt().ttlDays() * 24L * 3600L;
	}

	public String issueToken(User user) {
		Instant now = Instant.now();
		JWTClaimsSet claims = new JWTClaimsSet.Builder()
				.subject(user.getId())
				.claim("email", user.getEmail())
				.claim("role", user.getRole().name())
				.issueTime(Date.from(now))
				.expirationTime(Date.from(now.plusSeconds(ttlSeconds)))
				.build();
		SignedJWT signed = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), claims);
		try {
			signed.sign(new MACSigner(key));
		} catch (JOSEException error) {
			throw new IllegalStateException("Could not sign JWT", error);
		}
		return signed.serialize();
	}

	/** Returns the user id embedded in the token, or null if invalid/expired. */
	public String extractUserId(String token) {
		try {
			return decoder.decode(token).getSubject();
		} catch (JwtException | IllegalArgumentException error) {
			return null;
		}
	}
}
