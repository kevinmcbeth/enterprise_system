package com.kevinmcbeth.enterprise.repository;

import com.kevinmcbeth.enterprise.entity.BoardColumn;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BoardColumnRepository extends JpaRepository<BoardColumn, Long> {
    List<BoardColumn> findByProjectIdOrderByPosition(Long projectId);
    void deleteByProjectId(Long projectId);
}
