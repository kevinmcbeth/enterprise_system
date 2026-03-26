package com.kevinmcbeth.enterprise.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "board_columns")
public class BoardColumn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long projectId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer position;

    public BoardColumn() {}

    public BoardColumn(Long projectId, String name, Integer position) {
        this.projectId = projectId;
        this.name = name;
        this.position = position;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProjectId() { return projectId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getPosition() { return position; }
    public void setPosition(Integer position) { this.position = position; }
}
