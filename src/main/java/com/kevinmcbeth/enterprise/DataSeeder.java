package com.kevinmcbeth.enterprise;

import com.kevinmcbeth.enterprise.entity.*;
import com.kevinmcbeth.enterprise.entity.Task.Priority;
import com.kevinmcbeth.enterprise.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final BoardColumnRepository boardColumnRepository;
    private final TaskRepository taskRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository,
                      ProjectRepository projectRepository,
                      ProjectMemberRepository projectMemberRepository,
                      BoardColumnRepository boardColumnRepository,
                      TaskRepository taskRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.boardColumnRepository = boardColumnRepository;
        this.taskRepository = taskRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) return;

        User admin = userRepository.save(new User("admin@example.com",
                passwordEncoder.encode("password"), "Admin User", User.Role.ADMIN));
        User member = userRepository.save(new User("member@example.com",
                passwordEncoder.encode("password"), "Team Member", User.Role.MEMBER));

        Project project = projectRepository.save(new Project("Demo Project", "A sample kanban project"));

        projectMemberRepository.save(new ProjectMember(project.getId(), admin.getId(),
                ProjectMember.MemberRole.OWNER));
        projectMemberRepository.save(new ProjectMember(project.getId(), member.getId(),
                ProjectMember.MemberRole.MEMBER));

        BoardColumn todo = boardColumnRepository.save(new BoardColumn(project.getId(), "To Do", 0));
        BoardColumn inProgress = boardColumnRepository.save(new BoardColumn(project.getId(), "In Progress", 1000));
        BoardColumn done = boardColumnRepository.save(new BoardColumn(project.getId(), "Done", 2000));

        taskRepository.save(new Task("Set up CI/CD pipeline", "Configure GitHub Actions", todo.getId(),
                null, Priority.P1, 0, null));
        taskRepository.save(new Task("Design database schema", "ERD and migration scripts", todo.getId(),
                admin.getId(), Priority.P2, 1000, null));
        taskRepository.save(new Task("Implement user auth", "JWT-based authentication", inProgress.getId(),
                admin.getId(), Priority.P0, 0, null));
        taskRepository.save(new Task("Write API documentation", null, todo.getId(),
                member.getId(), Priority.P3, 2000, null));
        taskRepository.save(new Task("Project setup", "Initial Spring Boot scaffold", done.getId(),
                admin.getId(), Priority.P2, 0, null));
    }
}
