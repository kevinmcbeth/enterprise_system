package com.kevinmcbeth.enterprise.controller;

import com.kevinmcbeth.enterprise.dto.column.BoardResponse;
import com.kevinmcbeth.enterprise.dto.column.CreateColumnRequest;
import com.kevinmcbeth.enterprise.dto.column.UpdateColumnRequest;
import com.kevinmcbeth.enterprise.entity.BoardColumn;
import com.kevinmcbeth.enterprise.security.JwtTokenProvider;
import com.kevinmcbeth.enterprise.service.BoardColumnService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/columns")
public class BoardColumnController {

    private final BoardColumnService boardColumnService;
    private final JwtTokenProvider jwtTokenProvider;

    public BoardColumnController(BoardColumnService boardColumnService,
                                  JwtTokenProvider jwtTokenProvider) {
        this.boardColumnService = boardColumnService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @GetMapping("/board")
    public List<BoardResponse> getBoard(@PathVariable Long projectId, HttpServletRequest request) {
        return boardColumnService.getBoard(projectId, getUserId(request));
    }

    @GetMapping
    public List<BoardColumn> list(@PathVariable Long projectId, HttpServletRequest request) {
        return boardColumnService.listColumns(projectId, getUserId(request));
    }

    @PostMapping
    public ResponseEntity<BoardColumn> create(@PathVariable Long projectId,
                                               @Valid @RequestBody CreateColumnRequest body,
                                               HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(boardColumnService.create(projectId, body, getUserId(request)));
    }

    @PutMapping("/{id}")
    public BoardColumn update(@PathVariable Long projectId, @PathVariable Long id,
                               @Valid @RequestBody UpdateColumnRequest body,
                               HttpServletRequest request) {
        return boardColumnService.update(projectId, id, body, getUserId(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long projectId, @PathVariable Long id,
                                        HttpServletRequest request) {
        boardColumnService.delete(projectId, id, getUserId(request));
        return ResponseEntity.noContent().build();
    }

    private Long getUserId(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtTokenProvider.getUserIdFromToken(token);
    }
}
