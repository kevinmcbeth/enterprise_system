package com.kevinmcbeth.enterprise.dto;

import java.time.Instant;

public record UserResponse(Long id, String displayName, String email, String role, Instant createdAt) {}
