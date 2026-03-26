package com.kevinmcbeth.enterprise.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "task_comments")
public class TaskComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long taskId;

    @Column(nullable = false)
    private Long authorId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    public TaskComment() {}

    public TaskComment(Long taskId, Long authorId, String body) {
        this.taskId = taskId;
        this.authorId = authorId;
        this.body = body;
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public Long getTaskId() { return taskId; }
    public Long getAuthorId() { return authorId; }
    public String getBody() { return body; }
    public Instant getCreatedAt() { return createdAt; }
}
