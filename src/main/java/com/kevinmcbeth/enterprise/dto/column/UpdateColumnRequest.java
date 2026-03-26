package com.kevinmcbeth.enterprise.dto.column;

import jakarta.validation.constraints.NotBlank;

public record UpdateColumnRequest(@NotBlank String name, Integer position) {}
