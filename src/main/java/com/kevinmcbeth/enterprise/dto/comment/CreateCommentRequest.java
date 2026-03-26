package com.kevinmcbeth.enterprise.dto.comment;

import jakarta.validation.constraints.NotBlank;

public record CreateCommentRequest(@NotBlank String body) {}
