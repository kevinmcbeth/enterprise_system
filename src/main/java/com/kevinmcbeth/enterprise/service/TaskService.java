package com.kevinmcbeth.enterprise.service;

import com.kevinmcbeth.enterprise.dto.task.*;
import com.kevinmcbeth.enterprise.entity.BoardColumn;
import com.kevinmcbeth.enterprise.entity.Task;
import com.kevinmcbeth.enterprise.entity.User;
import com.kevinmcbeth.enterprise.exception.*;
import com.kevinmcbeth.enterprise.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final BoardColumnRepository boardColumnRepository;
    private final TaskCommentRepository taskCommentRepository;
    private final UserRepository userRepository;
    private final ProjectService projectService;

    public TaskService(TaskRepository taskRepository,
                       BoardColumnRepository boardColumnRepository,
                       TaskCommentRepository taskCommentRepository,
                       UserRepository userRepository,
                       ProjectService projectService) {
        this.taskRepository = taskRepository;
        this.boardColumnRepository = boardColumnRepository;
        this.taskCommentRepository = taskCommentRepository;
        this.userRepository = userRepository;
        this.projectService = projectService;
    }

    @Transactional
    public TaskResponse create(Long projectId, Long columnId, CreateTaskRequest request, Long userId) {
        projectService.requireMembership(projectId, userId);
        BoardColumn col = requireColumnInProject(projectId, columnId);

        List<Task> existing = taskRepository.findByColumnIdOrderByPosition(col.getId());
        int nextPosition = existing.isEmpty() ? 0 : existing.getLast().getPosition() + 1000;

        Task task = new Task(request.title(), request.description(), columnId,
                request.assigneeId(), request.priority(), nextPosition, request.dueDate());
        task = taskRepository.save(task);

        return toResponse(task);
    }

    @Transactional
    public TaskResponse update(Long projectId, Long taskId, UpdateTaskRequest request, Long userId) {
        projectService.requireMembership(projectId, userId);
        Task task = findTaskInProject(projectId, taskId);

        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setAssigneeId(request.assigneeId());
        if (request.priority() != null) task.setPriority(request.priority());
        task.setDueDate(request.dueDate());

        task = taskRepository.save(task);
        return toResponse(task);
    }

    @Transactional
    public TaskResponse move(Long projectId, Long taskId, MoveTaskRequest request, Long userId) {
        projectService.requireMembership(projectId, userId);
        Task task = findTaskInProject(projectId, taskId);

        if (!task.getVersion().equals(request.version())) {
            throw new ConflictException("Task was modified by another request. Please reload and try again.");
        }

        requireColumnInProject(projectId, request.columnId());
        task.setColumnId(request.columnId());
        task.setPosition(request.position());

        task = taskRepository.save(task);
        return toResponse(task);
    }

    @Transactional
    public void delete(Long projectId, Long taskId, Long userId) {
        projectService.requireMembership(projectId, userId);
        Task task = findTaskInProject(projectId, taskId);
        taskCommentRepository.deleteByTaskId(taskId);
        taskRepository.delete(task);
    }

    private Task findTaskInProject(Long projectId, Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        BoardColumn col = boardColumnRepository.findById(task.getColumnId())
                .orElseThrow(() -> new ResourceNotFoundException("Column not found"));
        if (!col.getProjectId().equals(projectId)) {
            throw new ResourceNotFoundException("Task not found in this project");
        }
        return task;
    }

    private BoardColumn requireColumnInProject(Long projectId, Long columnId) {
        BoardColumn col = boardColumnRepository.findById(columnId)
                .orElseThrow(() -> new ResourceNotFoundException("Column not found"));
        if (!col.getProjectId().equals(projectId)) {
            throw new ResourceNotFoundException("Column not found in this project");
        }
        return col;
    }

    private TaskResponse toResponse(Task task) {
        String assigneeName = null;
        if (task.getAssigneeId() != null) {
            assigneeName = userRepository.findById(task.getAssigneeId())
                    .map(User::getDisplayName).orElse(null);
        }
        return new TaskResponse(
            task.getId(), task.getTitle(), task.getDescription(),
            task.getColumnId(), task.getAssigneeId(), assigneeName,
            task.getPriority(), task.getPosition(), task.getVersion(),
            task.getDueDate(), task.getCreatedAt(), task.getUpdatedAt()
        );
    }
}
