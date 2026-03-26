package com.kevinmcbeth.enterprise.dto.comment;

import java.time.Instant;

public record CommentResponse(Long id, String body, Long authorId, String authorName, Instant createdAt) {}
