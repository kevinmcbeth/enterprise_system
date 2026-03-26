package com.kevinmcbeth.enterprise.dto.task;

import com.kevinmcbeth.enterprise.entity.Task.Priority;

import java.time.Instant;
import java.time.LocalDate;

public record TaskResponse(
    Long id,
    String title,
    String description,
    Long columnId,
    Long assigneeId,
    String assigneeName,
    Priority priority,
    Integer position,
    Long version,
    LocalDate dueDate,
    Instant createdAt,
    Instant updatedAt
) {}
