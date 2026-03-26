package com.kevinmcbeth.enterprise.controller;

import com.kevinmcbeth.enterprise.dto.task.AllTasksResponse;
import com.kevinmcbeth.enterprise.security.JwtTokenProvider;
import com.kevinmcbeth.enterprise.service.TaskService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class AllTasksController {

    private final TaskService taskService;
    private final JwtTokenProvider jwtTokenProvider;

    public AllTasksController(TaskService taskService, JwtTokenProvider jwtTokenProvider) {
        this.taskService = taskService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @GetMapping
    public List<AllTasksResponse> allTasks(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        Long userId = jwtTokenProvider.getUserIdFromToken(token);
        return taskService.allTasksForUser(userId);
    }
}
