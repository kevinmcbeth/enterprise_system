package com.kevinmcbeth.enterprise.dto.project;

import jakarta.validation.constraints.NotBlank;

public record CreateProjectRequest(@NotBlank String name, String description) {}
