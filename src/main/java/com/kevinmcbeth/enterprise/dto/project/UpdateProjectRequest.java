package com.kevinmcbeth.enterprise.dto.project;

import jakarta.validation.constraints.NotBlank;

public record UpdateProjectRequest(@NotBlank String name, String description) {}
