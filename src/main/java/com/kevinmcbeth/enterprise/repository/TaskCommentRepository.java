package com.kevinmcbeth.enterprise.repository;

import com.kevinmcbeth.enterprise.entity.TaskComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskCommentRepository extends JpaRepository<TaskComment, Long> {
    Page<TaskComment> findByTaskIdOrderByCreatedAtDesc(Long taskId, Pageable pageable);
    void deleteByTaskId(Long taskId);
}
