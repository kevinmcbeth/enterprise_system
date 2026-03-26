package com.kevinmcbeth.enterprise.controller;

import com.kevinmcbeth.enterprise.dto.task.*;
import com.kevinmcbeth.enterprise.security.JwtTokenProvider;
import com.kevinmcbeth.enterprise.service.TaskService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects/{projectId}")
public class TaskController {

    private final TaskService taskService;
    private final JwtTokenProvider jwtTokenProvider;

    public TaskController(TaskService taskService, JwtTokenProvider jwtTokenProvider) {
        this.taskService = taskService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/columns/{columnId}/tasks")
    public ResponseEntity<TaskResponse> create(@PathVariable Long projectId,
                                                @PathVariable Long columnId,
                                                @Valid @RequestBody CreateTaskRequest body,
                                                HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(taskService.create(projectId, columnId, body, getUserId(request)));
    }

    @PutMapping("/tasks/{id}")
    public TaskResponse update(@PathVariable Long projectId, @PathVariable Long id,
                                @Valid @RequestBody UpdateTaskRequest body,
                                HttpServletRequest request) {
        return taskService.update(projectId, id, body, getUserId(request));
    }

    @PatchMapping("/tasks/{id}/move")
    public TaskResponse move(@PathVariable Long projectId, @PathVariable Long id,
                              @Valid @RequestBody MoveTaskRequest body,
                              HttpServletRequest request) {
        return taskService.move(projectId, id, body, getUserId(request));
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long projectId, @PathVariable Long id,
                                        HttpServletRequest request) {
        taskService.delete(projectId, id, getUserId(request));
        return ResponseEntity.noContent().build();
    }

    private Long getUserId(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtTokenProvider.getUserIdFromToken(token);
    }
}
