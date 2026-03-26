package com.kevinmcbeth.enterprise.repository;

import com.kevinmcbeth.enterprise.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByColumnIdOrderByPosition(Long columnId);
    long countByColumnId(Long columnId);
    void deleteByColumnId(Long columnId);
}
