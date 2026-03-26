package com.kevinmcbeth.enterprise.repository;

import com.kevinmcbeth.enterprise.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Long> {
}
