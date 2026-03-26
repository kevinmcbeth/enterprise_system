package com.kevinmcbeth.enterprise.service;

import com.kevinmcbeth.enterprise.dto.auth.AuthResponse;
import com.kevinmcbeth.enterprise.dto.auth.LoginRequest;
import com.kevinmcbeth.enterprise.dto.auth.SignupRequest;
import com.kevinmcbeth.enterprise.entity.RefreshToken;
import com.kevinmcbeth.enterprise.entity.User;
import com.kevinmcbeth.enterprise.exception.BadRequestException;
import com.kevinmcbeth.enterprise.exception.ConflictException;
import com.kevinmcbeth.enterprise.repository.RefreshTokenRepository;
import com.kevinmcbeth.enterprise.repository.UserRepository;
import com.kevinmcbeth.enterprise.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private RefreshTokenRepository refreshTokenRepository;

    private AuthService authService;
    private PasswordEncoder passwordEncoder;
    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        jwtTokenProvider = new JwtTokenProvider(
            "ThisIsADevelopmentSecretKeyThatIsAtLeast256BitsLongForHS256Algorithm",
            900000, 604800000
        );
        authService = new AuthService(userRepository, refreshTokenRepository,
                passwordEncoder, jwtTokenProvider);
    }

    @Test
    void signup_shouldCreateUserAndReturnTokens() {
        var request = new SignupRequest("new@example.com", "password123", "New User");
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(1L);
            return u;
        });
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> inv.getArgument(0));

        AuthResponse response = authService.signup(request);

        assertThat(response.accessToken()).isNotBlank();
        assertThat(response.refreshToken()).isNotBlank();
    }

    @Test
    void signup_shouldRejectDuplicateEmail() {
        var request = new SignupRequest("taken@example.com", "password123", "Taken");
        when(userRepository.existsByEmail("taken@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.signup(request))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void login_shouldReturnTokensForValidCredentials() {
        User user = new User("test@example.com", passwordEncoder.encode("password123"),
                "Test", User.Role.MEMBER);
        user.setId(1L);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> inv.getArgument(0));

        AuthResponse response = authService.login(new LoginRequest("test@example.com", "password123"));

        assertThat(response.accessToken()).isNotBlank();
        assertThat(response.refreshToken()).isNotBlank();
    }

    @Test
    void login_shouldRejectBadPassword() {
        User user = new User("test@example.com", passwordEncoder.encode("correct"),
                "Test", User.Role.MEMBER);
        user.setId(1L);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.login(new LoginRequest("test@example.com", "wrong")))
                .isInstanceOf(BadRequestException.class);
    }
}
