package com.kevinmcbeth.enterprise.service;

import com.kevinmcbeth.enterprise.dto.column.BoardResponse;
import com.kevinmcbeth.enterprise.dto.column.CreateColumnRequest;
import com.kevinmcbeth.enterprise.dto.column.UpdateColumnRequest;
import com.kevinmcbeth.enterprise.dto.task.TaskResponse;
import com.kevinmcbeth.enterprise.entity.BoardColumn;
import com.kevinmcbeth.enterprise.entity.User;
import com.kevinmcbeth.enterprise.exception.BadRequestException;
import com.kevinmcbeth.enterprise.exception.ResourceNotFoundException;
import com.kevinmcbeth.enterprise.repository.BoardColumnRepository;
import com.kevinmcbeth.enterprise.repository.TaskRepository;
import com.kevinmcbeth.enterprise.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BoardColumnService {

    private final BoardColumnRepository boardColumnRepository;
    private final TaskRepository taskRepository;
    private final ProjectService projectService;
    private final UserRepository userRepository;

    public BoardColumnService(BoardColumnRepository boardColumnRepository,
                               TaskRepository taskRepository,
                               ProjectService projectService,
                               UserRepository userRepository) {
        this.boardColumnRepository = boardColumnRepository;
        this.taskRepository = taskRepository;
        this.projectService = projectService;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<BoardColumn> listColumns(Long projectId, Long userId) {
        projectService.requireMembership(projectId, userId);
        return boardColumnRepository.findByProjectIdOrderByPosition(projectId);
    }

    @Transactional(readOnly = true)
    public List<BoardResponse> getBoard(Long projectId, Long userId) {
        projectService.requireMembership(projectId, userId);
        List<BoardColumn> columns = boardColumnRepository.findByProjectIdOrderByPosition(projectId);

        return columns.stream().map(col -> {
            List<TaskResponse> tasks = taskRepository.findByColumnIdOrderByPosition(col.getId())
                    .stream().map(task -> {
                        String assigneeName = null;
                        if (task.getAssigneeId() != null) {
                            assigneeName = userRepository.findById(task.getAssigneeId())
                                    .map(User::getDisplayName).orElse(null);
                        }
                        return new TaskResponse(task.getId(), task.getTitle(), task.getDescription(),
                                task.getColumnId(), task.getAssigneeId(), assigneeName,
                                task.getPriority(), task.getPosition(), task.getVersion(),
                                task.getDueDate(), task.getCreatedAt(), task.getUpdatedAt());
                    }).toList();
            return new BoardResponse(col.getId(), col.getName(), col.getPosition(), tasks);
        }).toList();
    }

    @Transactional
    public BoardColumn create(Long projectId, CreateColumnRequest request, Long userId) {
        projectService.requireMembership(projectId, userId);
        List<BoardColumn> existing = boardColumnRepository.findByProjectIdOrderByPosition(projectId);
        int nextPosition = existing.isEmpty() ? 0 : existing.getLast().getPosition() + 1000;
        return boardColumnRepository.save(new BoardColumn(projectId, request.name(), nextPosition));
    }

    @Transactional
    public BoardColumn update(Long projectId, Long columnId, UpdateColumnRequest request, Long userId) {
        projectService.requireMembership(projectId, userId);
        BoardColumn col = findColumnInProject(projectId, columnId);
        col.setName(request.name());
        if (request.position() != null) {
            col.setPosition(request.position());
        }
        return boardColumnRepository.save(col);
    }

    @Transactional
    public void delete(Long projectId, Long columnId, Long userId) {
        projectService.requireMembership(projectId, userId);
        BoardColumn col = findColumnInProject(projectId, columnId);
        if (taskRepository.countByColumnId(columnId) > 0) {
            throw new BadRequestException("Cannot delete column: column is not empty");
        }
        boardColumnRepository.delete(col);
    }

    private BoardColumn findColumnInProject(Long projectId, Long columnId) {
        BoardColumn col = boardColumnRepository.findById(columnId)
                .orElseThrow(() -> new ResourceNotFoundException("Column not found"));
        if (!col.getProjectId().equals(projectId)) {
            throw new ResourceNotFoundException("Column not found in this project");
        }
        return col;
    }
}
