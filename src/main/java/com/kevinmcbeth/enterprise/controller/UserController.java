package com.kevinmcbeth.enterprise.controller;

import com.kevinmcbeth.enterprise.dto.UserResponse;
import com.kevinmcbeth.enterprise.entity.User;
import com.kevinmcbeth.enterprise.exception.AccessDeniedException;
import com.kevinmcbeth.enterprise.repository.UserRepository;
import com.kevinmcbeth.enterprise.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    public UserController(UserRepository userRepository, JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @GetMapping
    public List<UserResponse> listUsers() {
        return userRepository.findAll().stream()
                .map(u -> new UserResponse(u.getId(), u.getDisplayName(), null, null, null))
                .toList();
    }

    @GetMapping("/admin")
    public List<UserResponse> listUsersAdmin(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        Long userId = jwtTokenProvider.getUserIdFromToken(token);
        User caller = userRepository.findById(userId).orElseThrow();
        if (caller.getRole() != User.Role.ADMIN) {
            throw new AccessDeniedException("Admin access required");
        }
        return userRepository.findAll().stream()
                .map(u -> new UserResponse(u.getId(), u.getDisplayName(), u.getEmail(),
                        u.getRole().name(), u.getCreatedAt()))
                .toList();
    }
}
