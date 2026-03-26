package com.kevinmcbeth.enterprise.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "project_members")
@IdClass(ProjectMemberId.class)
public class ProjectMember {

    public enum MemberRole { OWNER, MEMBER }

    @Id
    private Long projectId;

    @Id
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MemberRole role;

    public ProjectMember() {}

    public ProjectMember(Long projectId, Long userId, MemberRole role) {
        this.projectId = projectId;
        this.userId = userId;
        this.role = role;
    }

    public Long getProjectId() { return projectId; }
    public Long getUserId() { return userId; }
    public MemberRole getRole() { return role; }
    public void setRole(MemberRole role) { this.role = role; }
}
