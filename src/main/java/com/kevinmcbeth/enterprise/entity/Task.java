package com.kevinmcbeth.enterprise.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "tasks")
public class Task {

    public enum Priority { P0, P1, P2, P3, P4 }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String description;

    @Column(nullable = false)
    private Long columnId;

    private Long assigneeId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority;

    @Column(nullable = false)
    private Integer position;

    @Version
    private Long version;

    private LocalDate dueDate;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    public Task() {}

    public Task(String title, String description, Long columnId, Long assigneeId,
                Priority priority, Integer position, LocalDate dueDate) {
        this.title = title;
        this.description = description;
        this.columnId = columnId;
        this.assigneeId = assigneeId;
        this.priority = priority;
        this.position = position;
        this.dueDate = dueDate;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    public void preUpdate() { this.updatedAt = Instant.now(); }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Long getColumnId() { return columnId; }
    public void setColumnId(Long columnId) { this.columnId = columnId; }
    public Long getAssigneeId() { return assigneeId; }
    public void setAssigneeId(Long assigneeId) { this.assigneeId = assigneeId; }
    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }
    public Integer getPosition() { return position; }
    public void setPosition(Integer position) { this.position = position; }
    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
