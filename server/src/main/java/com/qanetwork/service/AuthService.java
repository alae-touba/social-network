package com.qanetwork.service;

import com.qanetwork.domain.Role;
import com.qanetwork.domain.User;
import com.qanetwork.dto.Dtos;
import com.qanetwork.dto.Requests.LoginRequest;
import com.qanetwork.exception.ApiException;
import com.qanetwork.repository.UserRepository;
import com.qanetwork.security.JwtService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;
	private final ImageStorage imageStorage;

	public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService,
			ImageStorage imageStorage) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
		this.imageStorage = imageStorage;
	}

	public record RegisterForm(String firstName, String lastName, String email, String password,
			org.springframework.web.multipart.MultipartFile image) {
	}

	@Transactional
	public Dtos.AuthResponse register(RegisterForm form) {
		String email = form.email().trim().toLowerCase();
		if (userRepository.existsByEmail(email)) {
			throw new ApiException(409, "An account with this email already exists.");
		}

		User user = new User();
		user.setFirstName(form.firstName().trim());
		user.setLastName(form.lastName().trim());
		user.setEmail(email);
		user.setPassword(passwordEncoder.encode(form.password()));
		user.setRole(Role.USER);
		String uploaded = imageStorage.save(form.image(), "users-images");
		user.setImageName(uploaded != null ? uploaded : "default-user.svg");
		userRepository.save(user);

		return new Dtos.AuthResponse(jwtService.issueToken(user), Dtos.safe(user));
	}

	@Transactional(readOnly = true)
	public Dtos.AuthResponse login(LoginRequest request) {
		User user = userRepository.findByEmail(request.email().trim().toLowerCase()).orElse(null);
		if (user == null || !passwordEncoder.matches(request.password(), user.getPassword())) {
			throw new ApiException(401, "Invalid email or password.");
		}
		return new Dtos.AuthResponse(jwtService.issueToken(user), Dtos.safe(user));
	}
}
