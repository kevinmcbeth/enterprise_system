package com.kevinmcbeth.enterprise.service;

import com.kevinmcbeth.enterprise.dto.project.*;
import com.kevinmcbeth.enterprise.entity.*;
import com.kevinmcbeth.enterprise.exception.*;
import com.kevinmcbeth.enterprise.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final BoardColumnRepository boardColumnRepository;
    private final TaskRepository taskRepository;
    private final TaskCommentRepository taskCommentRepository;

    public ProjectService(ProjectRepository projectRepository,
                          ProjectMemberRepository projectMemberRepository,
                          UserRepository userRepository,
                          BoardColumnRepository boardColumnRepository,
                          TaskRepository taskRepository,
                          TaskCommentRepository taskCommentRepository) {
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.userRepository = userRepository;
        this.boardColumnRepository = boardColumnRepository;
        this.taskRepository = taskRepository;
        this.taskCommentRepository = taskCommentRepository;
    }

    @Transactional
    public ProjectResponse create(CreateProjectRequest request, Long userId) {
        Project project = projectRepository.save(new Project(request.name(), request.description()));

        projectMemberRepository.save(
            new ProjectMember(project.getId(), userId, ProjectMember.MemberRole.OWNER));

        boardColumnRepository.save(new BoardColumn(project.getId(), "To Do", 0));
        boardColumnRepository.save(new BoardColumn(project.getId(), "In Progress", 1000));
        boardColumnRepository.save(new BoardColumn(project.getId(), "Done", 2000));

        return toResponse(project, userId);
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> listForUser(Long userId) {
        List<ProjectMember> memberships = projectMemberRepository.findProjectsByUserId(userId);
        return memberships.stream()
                .map(pm -> projectRepository.findById(pm.getProjectId()).orElse(null))
                .filter(p -> p != null)
                .map(p -> toResponse(p, userId))
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse getById(Long projectId, Long userId) {
        requireMembership(projectId, userId);
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        return toResponse(project, userId);
    }

    @Transactional
    public ProjectResponse update(Long projectId, UpdateProjectRequest request, Long userId) {
        requireMembership(projectId, userId);
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        project.setName(request.name());
        project.setDescription(request.description());
        project = projectRepository.save(project);
        return toResponse(project, userId);
    }

    @Transactional
    public void delete(Long projectId, Long userId) {
        requireOwnership(projectId, userId);

        List<BoardColumn> columns = boardColumnRepository.findByProjectIdOrderByPosition(projectId);
        for (BoardColumn col : columns) {
            var tasks = taskRepository.findByColumnIdOrderByPosition(col.getId());
            for (var task : tasks) {
                taskCommentRepository.deleteByTaskId(task.getId());
            }
            taskRepository.deleteByColumnId(col.getId());
        }
        boardColumnRepository.deleteByProjectId(projectId);
        projectMemberRepository.deleteByProjectId(projectId);
        projectRepository.deleteById(projectId);
    }

    @Transactional
    public void addMember(Long projectId, AddMemberRequest request, Long userId) {
        requireOwnership(projectId, userId);
        User newMember = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.email()));

        if (projectMemberRepository.existsByProjectIdAndUserId(projectId, newMember.getId())) {
            throw new ConflictException("User is already a member");
        }

        projectMemberRepository.save(
            new ProjectMember(projectId, newMember.getId(), ProjectMember.MemberRole.MEMBER));
    }

    @Transactional
    public void removeMember(Long projectId, Long targetUserId, Long userId) {
        requireOwnership(projectId, userId);
        if (targetUserId.equals(userId)) {
            throw new BadRequestException("Cannot remove yourself from the project");
        }
        projectMemberRepository.deleteById(new ProjectMemberId(projectId, targetUserId));
    }

    public void requireMembership(Long projectId, Long userId) {
        if (!projectMemberRepository.existsByProjectIdAndUserId(projectId, userId)) {
            throw new ResourceNotFoundException("Project not found");
        }
    }

    private void requireOwnership(Long projectId, Long userId) {
        ProjectMember member = projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        if (member.getRole() != ProjectMember.MemberRole.OWNER) {
            throw new AccessDeniedException("Only the project owner can perform this action");
        }
    }

    private ProjectResponse toResponse(Project project, Long userId) {
        List<ProjectMember> members = projectMemberRepository.findByProjectId(project.getId());
        List<ProjectResponse.MemberInfo> memberInfos = members.stream()
                .map(pm -> {
                    User u = userRepository.findById(pm.getUserId()).orElse(null);
                    if (u == null) return null;
                    return new ProjectResponse.MemberInfo(u.getId(), u.getDisplayName(), u.getEmail(), pm.getRole().name());
                })
                .filter(m -> m != null)
                .toList();

        return new ProjectResponse(
            project.getId(), project.getName(), project.getDescription(),
            project.getCreatedAt(), project.getUpdatedAt(), memberInfos
        );
    }
}
