package com.kevinmcbeth.enterprise.dto.project;

import java.time.Instant;
import java.util.List;

public record ProjectResponse(
    Long id,
    String name,
    String description,
    Instant createdAt,
    Instant updatedAt,
    List<MemberInfo> members
) {
    public record MemberInfo(Long userId, String displayName, String email, String role) {}
}
