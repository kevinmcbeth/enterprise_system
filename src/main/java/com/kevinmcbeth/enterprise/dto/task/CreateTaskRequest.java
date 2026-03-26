package com.kevinmcbeth.enterprise.dto.task;

import com.kevinmcbeth.enterprise.entity.Task.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CreateTaskRequest(
    @NotBlank String title,
    String description,
    Long assigneeId,
    @NotNull Priority priority,
    LocalDate dueDate
) {}
