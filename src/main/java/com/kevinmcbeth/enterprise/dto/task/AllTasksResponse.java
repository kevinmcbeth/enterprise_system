package com.kevinmcbeth.enterprise.dto.task;

import com.kevinmcbeth.enterprise.entity.Task.Priority;

import java.time.Instant;
import java.time.LocalDate;

public record AllTasksResponse(
    Long id,
    String title,
    String description,
    Long projectId,
    String projectName,
    Long columnId,
    String columnName,
    Long assigneeId,
    String assigneeName,
    Priority priority,
    LocalDate dueDate,
    Instant createdAt,
    Instant updatedAt
) {}
