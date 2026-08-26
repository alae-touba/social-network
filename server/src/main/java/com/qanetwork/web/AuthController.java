package com.qanetwork.web;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import com.qanetwork.domain.User;
import com.qanetwork.dto.Dtos.AuthResponse;
import com.qanetwork.dto.Dtos.UserDto;
import com.qanetwork.dto.Requests.LoginRequest;
import com.qanetwork.service.AuthService;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@RestController
@RequestMapping("/api/auth")
@Validated
public class AuthController {

	public record RegisterForm(
			@NotBlank @Size(min = 2, max = 100) String firstName,
			@NotBlank @Size(min = 2, max = 100) String lastName,
			@NotBlank @Email String email,
			@NotBlank @Size(min = 4, max = 100) String password,
			org.springframework.web.multipart.MultipartFile image) {
	}

	private final AuthService authService;

	public AuthController(AuthService authService) {
		this.authService = authService;
	}

	@PostMapping(path = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@ResponseStatus(HttpStatus.CREATED)
	public AuthResponse register(@ModelAttribute @Validated RegisterForm form) {
		var formRecord = new AuthService.RegisterForm(form.firstName(), form.lastName(), form.email(),
				form.password(), form.image());
		return authService.register(formRecord);
	}

	/** JSON variant without profile picture (kept for API parity). */
	@PostMapping(path = "/register", consumes = MediaType.APPLICATION_JSON_VALUE)
	@ResponseStatus(HttpStatus.CREATED)
	public AuthResponse registerJson(@RequestBody @Validated RegisterJson form) {
		return authService.register(new AuthService.RegisterForm(form.firstName(), form.lastName(), form.email(),
				form.password(), null));
	}

	public record RegisterJson(
			@NotBlank @Size(min = 2, max = 100) String firstName,
			@NotBlank @Size(min = 2, max = 100) String lastName,
			@NotBlank @Email String email,
			@NotBlank @Size(min = 4, max = 100) String password) {
	}

	@PostMapping("/login")
	public AuthResponse login(@Validated @RequestBody LoginRequest request) {
		return authService.login(request);
	}

	@GetMapping("/me")
	public ResponseEntity<?> me(@AuthenticationPrincipal User user) {
		if (user == null) {
			return ResponseEntity.noContent().build();
		}
		return ResponseEntity.ok(java.util.Map.of("user", com.qanetwork.dto.Dtos.safe(user)));
	}
}
