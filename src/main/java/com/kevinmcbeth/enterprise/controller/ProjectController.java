package com.kevinmcbeth.enterprise.controller;

import com.kevinmcbeth.enterprise.dto.project.*;
import com.kevinmcbeth.enterprise.security.JwtTokenProvider;
import com.kevinmcbeth.enterprise.service.ProjectService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;
    private final JwtTokenProvider jwtTokenProvider;

    public ProjectController(ProjectService projectService, JwtTokenProvider jwtTokenProvider) {
        this.projectService = projectService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @GetMapping
    public List<ProjectResponse> list(HttpServletRequest request) {
        return projectService.listForUser(getUserId(request));
    }

    @PostMapping
    public ResponseEntity<ProjectResponse> create(@Valid @RequestBody CreateProjectRequest body,
                                                    HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(projectService.create(body, getUserId(request)));
    }

    @GetMapping("/{id}")
    public ProjectResponse getById(@PathVariable Long id, HttpServletRequest request) {
        return projectService.getById(id, getUserId(request));
    }

    @PutMapping("/{id}")
    public ProjectResponse update(@PathVariable Long id,
                                   @Valid @RequestBody UpdateProjectRequest body,
                                   HttpServletRequest request) {
        return projectService.update(id, body, getUserId(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, HttpServletRequest request) {
        projectService.delete(id, getUserId(request));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<Void> addMember(@PathVariable Long id,
                                           @Valid @RequestBody AddMemberRequest body,
                                           HttpServletRequest request) {
        projectService.addMember(id, body, getUserId(request));
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<Void> removeMember(@PathVariable Long id,
                                              @PathVariable Long userId,
                                              HttpServletRequest request) {
        projectService.removeMember(id, userId, getUserId(request));
        return ResponseEntity.noContent().build();
    }

    private Long getUserId(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtTokenProvider.getUserIdFromToken(token);
    }
}
