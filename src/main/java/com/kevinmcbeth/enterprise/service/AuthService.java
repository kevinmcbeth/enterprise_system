package com.kevinmcbeth.enterprise.service;

import com.kevinmcbeth.enterprise.dto.auth.*;
import com.kevinmcbeth.enterprise.entity.RefreshToken;
import com.kevinmcbeth.enterprise.entity.User;
import com.kevinmcbeth.enterprise.exception.BadRequestException;
import com.kevinmcbeth.enterprise.exception.ConflictException;
import com.kevinmcbeth.enterprise.repository.RefreshTokenRepository;
import com.kevinmcbeth.enterprise.repository.UserRepository;
import com.kevinmcbeth.enterprise.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserRepository userRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email already registered");
        }

        User user = new User(
            request.email(),
            passwordEncoder.encode(request.password()),
            request.displayName(),
            User.Role.MEMBER
        );
        user = userRepository.save(user);

        return generateTokens(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }

        return generateTokens(user);
    }

    @Transactional
    public AuthResponse refresh(RefreshRequest request) {
        RefreshToken existing = refreshTokenRepository.findByToken(request.refreshToken())
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));

        if (existing.isExpired()) {
            refreshTokenRepository.delete(existing);
            throw new BadRequestException("Refresh token expired");
        }

        User user = userRepository.findById(existing.getUserId())
                .orElseThrow(() -> new BadRequestException("User not found"));

        refreshTokenRepository.delete(existing);
        return generateTokens(user);
    }

    @Transactional
    public void logout(RefreshRequest request) {
        refreshTokenRepository.findByToken(request.refreshToken())
                .ifPresent(refreshTokenRepository::delete);
    }

    private AuthResponse generateTokens(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken();

        Instant expiresAt = Instant.now().plusMillis(jwtTokenProvider.getRefreshTokenExpirationMs());
        refreshTokenRepository.save(new RefreshToken(refreshToken, user.getId(), expiresAt));

        return new AuthResponse(accessToken, refreshToken);
    }
}
