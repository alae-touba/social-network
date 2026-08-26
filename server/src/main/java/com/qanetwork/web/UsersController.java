package com.qanetwork.web;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.qanetwork.dto.Dtos.ProfileResponse;
import com.qanetwork.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UsersController {

	private final UserService userService;

	public UsersController(UserService userService) {
		this.userService = userService;
	}

	@GetMapping("/{id}")
	public ProfileResponse profile(@PathVariable String id) {
		return userService.profile(id);
	}
}
