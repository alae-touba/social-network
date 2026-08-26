package com.qanetwork.security;

import java.io.IOException;
import java.util.List;

import com.qanetwork.domain.User;
import com.qanetwork.repository.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Validates the "Authorization: Bearer" header on every request and, when it
 * holds a valid token for an existing user, authenticates the request with
 * the User entity as principal (controllers receive it via
 * {@code @AuthenticationPrincipal}).
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

	private final JwtService jwtService;
	private final UserRepository userRepository;

	public JwtAuthFilter(JwtService jwtService, UserRepository userRepository) {
		this.jwtService = jwtService;
		this.userRepository = userRepository;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
			throws ServletException, IOException {
		String header = request.getHeader("Authorization");
		if (header != null && header.startsWith("Bearer ")) {
			String userId = jwtService.extractUserId(header.substring(7));
			if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
				userRepository.findById(userId).ifPresent(user -> authenticate(user, request));
			}
		}
		chain.doFilter(request, response);
	}

	private void authenticate(User user, HttpServletRequest request) {
		var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
		var authentication = new UsernamePasswordAuthenticationToken(user, null, authorities);
		SecurityContextHolder.getContext().setAuthentication(authentication);
	}
}
