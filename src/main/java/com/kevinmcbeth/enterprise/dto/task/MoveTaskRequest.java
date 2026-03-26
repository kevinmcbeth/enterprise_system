package com.kevinmcbeth.enterprise.dto.task;

import jakarta.validation.constraints.NotNull;

public record MoveTaskRequest(
    @NotNull Long columnId,
    @NotNull Integer position,
    @NotNull Long version
) {}
