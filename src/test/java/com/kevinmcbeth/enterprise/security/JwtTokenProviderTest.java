package com.kevinmcbeth.enterprise.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JwtTokenProviderTest {

    private JwtTokenProvider provider;

    @BeforeEach
    void setUp() {
        provider = new JwtTokenProvider(
            "ThisIsADevelopmentSecretKeyThatIsAtLeast256BitsLongForHS256Algorithm",
            900000,
            604800000
        );
    }

    @Test
    void shouldGenerateAndValidateAccessToken() {
        String token = provider.generateAccessToken(1L, "test@example.com");

        assertThat(provider.validateToken(token)).isTrue();
        assertThat(provider.getUserIdFromToken(token)).isEqualTo(1L);
        assertThat(provider.getEmailFromToken(token)).isEqualTo("test@example.com");
    }

    @Test
    void shouldRejectInvalidToken() {
        assertThat(provider.validateToken("invalid.token.here")).isFalse();
    }

    @Test
    void shouldGenerateRefreshToken() {
        String token = provider.generateRefreshToken();
        assertThat(token).isNotBlank();
        assertThat(token.length()).isGreaterThan(20);
    }
}
