package com.kevinmcbeth.enterprise.service;

import com.kevinmcbeth.enterprise.dto.comment.CommentResponse;
import com.kevinmcbeth.enterprise.dto.comment.CreateCommentRequest;
import com.kevinmcbeth.enterprise.entity.TaskComment;
import com.kevinmcbeth.enterprise.entity.User;
import com.kevinmcbeth.enterprise.repository.TaskCommentRepository;
import com.kevinmcbeth.enterprise.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TaskCommentService {

    private final TaskCommentRepository taskCommentRepository;
    private final UserRepository userRepository;
    private final ProjectService projectService;

    public TaskCommentService(TaskCommentRepository taskCommentRepository,
                               UserRepository userRepository,
                               ProjectService projectService) {
        this.taskCommentRepository = taskCommentRepository;
        this.userRepository = userRepository;
        this.projectService = projectService;
    }

    @Transactional(readOnly = true)
    public Page<CommentResponse> list(Long projectId, Long taskId, Pageable pageable, Long userId) {
        projectService.requireMembership(projectId, userId);
        return taskCommentRepository.findByTaskIdOrderByCreatedAtDesc(taskId, pageable)
                .map(this::toResponse);
    }

    @Transactional
    public CommentResponse create(Long projectId, Long taskId, CreateCommentRequest request, Long userId) {
        projectService.requireMembership(projectId, userId);
        TaskComment comment = new TaskComment(taskId, userId, request.body());
        comment = taskCommentRepository.save(comment);
        return toResponse(comment);
    }

    private CommentResponse toResponse(TaskComment comment) {
        String authorName = userRepository.findById(comment.getAuthorId())
                .map(User::getDisplayName).orElse("Unknown");
        return new CommentResponse(comment.getId(), comment.getBody(),
                comment.getAuthorId(), authorName, comment.getCreatedAt());
    }
}
