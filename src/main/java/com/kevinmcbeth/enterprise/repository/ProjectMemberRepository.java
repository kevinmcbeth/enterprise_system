package com.kevinmcbeth.enterprise.repository;

import com.kevinmcbeth.enterprise.entity.ProjectMember;
import com.kevinmcbeth.enterprise.entity.ProjectMemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, ProjectMemberId> {
    boolean existsByProjectIdAndUserId(Long projectId, Long userId);
    List<ProjectMember> findByProjectId(Long projectId);

    @Query("SELECT pm FROM ProjectMember pm WHERE pm.userId = :userId")
    List<ProjectMember> findProjectsByUserId(Long userId);

    Optional<ProjectMember> findByProjectIdAndUserId(Long projectId, Long userId);
    void deleteByProjectId(Long projectId);
}
