package com.kevinmcbeth.enterprise.dto.column;

import jakarta.validation.constraints.NotBlank;

public record CreateColumnRequest(@NotBlank String name) {}
