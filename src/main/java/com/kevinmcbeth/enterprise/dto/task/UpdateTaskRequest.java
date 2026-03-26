package com.kevinmcbeth.enterprise.dto.task;

import com.kevinmcbeth.enterprise.entity.Task.Priority;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record UpdateTaskRequest(
    @NotBlank String title,
    String description,
    Long assigneeId,
    Priority priority,
    LocalDate dueDate
) {}
