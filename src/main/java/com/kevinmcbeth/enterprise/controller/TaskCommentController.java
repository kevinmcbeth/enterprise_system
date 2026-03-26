package com.kevinmcbeth.enterprise.controller;

import com.kevinmcbeth.enterprise.dto.comment.CommentResponse;
import com.kevinmcbeth.enterprise.dto.comment.CreateCommentRequest;
import com.kevinmcbeth.enterprise.security.JwtTokenProvider;
import com.kevinmcbeth.enterprise.service.TaskCommentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects/{projectId}/tasks/{taskId}/comments")
public class TaskCommentController {

    private final TaskCommentService taskCommentService;
    private final JwtTokenProvider jwtTokenProvider;

    public TaskCommentController(TaskCommentService taskCommentService,
                                  JwtTokenProvider jwtTokenProvider) {
        this.taskCommentService = taskCommentService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @GetMapping
    public Page<CommentResponse> list(@PathVariable Long projectId, @PathVariable Long taskId,
                                       Pageable pageable, HttpServletRequest request) {
        return taskCommentService.list(projectId, taskId, pageable, getUserId(request));
    }

    @PostMapping
    public ResponseEntity<CommentResponse> create(@PathVariable Long projectId,
                                                    @PathVariable Long taskId,
                                                    @Valid @RequestBody CreateCommentRequest body,
                                                    HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(taskCommentService.create(projectId, taskId, body, getUserId(request)));
    }

    private Long getUserId(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtTokenProvider.getUserIdFromToken(token);
    }
}
