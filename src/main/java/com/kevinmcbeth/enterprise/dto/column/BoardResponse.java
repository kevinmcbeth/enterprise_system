package com.kevinmcbeth.enterprise.dto.column;

import com.kevinmcbeth.enterprise.dto.task.TaskResponse;

import java.util.List;

public record BoardResponse(Long id, String name, Integer position, List<TaskResponse> tasks) {}
