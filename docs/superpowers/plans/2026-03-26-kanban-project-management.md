# Kanban Project/Task Management — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the existing Spring Boot Item CRUD app into a kanban-based project management tool with JWT auth and an Angular frontend.

**Architecture:** Spring Boot 3 REST API with Spring Security + JWT authentication, Spring Data JPA with PostgreSQL. Angular 17+ frontend in `frontend/` directory, built via `frontend-maven-plugin`. Monorepo — single JAR deployment for production.

**Tech Stack:** Java 21, Spring Boot 3.4.4, Spring Security, jjwt (JWT), PostgreSQL, H2 (test), Angular 17+, Angular CDK DragDrop, frontend-maven-plugin

**Spec:** `docs/superpowers/specs/2026-03-26-kanban-project-management-design.md`

---

## File Structure

### Backend — New Files

```
src/main/java/com/kevinmcbeth/enterprise/
├── config/
│   └── SecurityConfig.java              # Spring Security + JWT filter config
├── security/
│   ├── JwtTokenProvider.java            # JWT creation, validation, parsing
│   ├── JwtAuthenticationFilter.java     # OncePerRequestFilter for JWT
│   └── UserDetailsServiceImpl.java      # Loads UserDetails from DB
├── dto/
│   ├── auth/
│   │   ├── SignupRequest.java           # email, password, displayName
│   │   ├── LoginRequest.java            # email, password
│   │   ├── AuthResponse.java            # accessToken, refreshToken
│   │   └── RefreshRequest.java          # refreshToken
│   ├── project/
│   │   ├── CreateProjectRequest.java    # name, description
│   │   ├── UpdateProjectRequest.java    # name, description
│   │   ├── ProjectResponse.java         # id, name, description, members, updatedAt
│   │   └── AddMemberRequest.java        # email
│   ├── column/
│   │   ├── CreateColumnRequest.java     # name
│   │   └── UpdateColumnRequest.java     # name, position
│   ├── task/
│   │   ├── CreateTaskRequest.java       # title, description, assigneeId, priority, dueDate
│   │   ├── UpdateTaskRequest.java       # title, description, assigneeId, priority, dueDate
│   │   ├── MoveTaskRequest.java         # columnId, position, version
│   │   └── TaskResponse.java            # all fields + assignee display name
│   ├── comment/
│   │   ├── CreateCommentRequest.java    # body
│   │   └── CommentResponse.java         # id, body, authorName, createdAt
│   └── ErrorResponse.java              # status, message, errors[]
├── exception/
│   ├── GlobalExceptionHandler.java      # @RestControllerAdvice
│   ├── ResourceNotFoundException.java
│   ├── AccessDeniedException.java
│   ├── BadRequestException.java
│   └── ConflictException.java
├── entity/
│   ├── User.java
│   ├── RefreshToken.java
│   ├── Project.java
│   ├── ProjectMember.java
│   ├── ProjectMemberId.java            # Composite key class
│   ├── BoardColumn.java
│   ├── Task.java
│   └── TaskComment.java
├── repository/
│   ├── UserRepository.java
│   ├── RefreshTokenRepository.java
│   ├── ProjectRepository.java
│   ├── ProjectMemberRepository.java
│   ├── BoardColumnRepository.java
│   ├── TaskRepository.java
│   └── TaskCommentRepository.java
├── service/
│   ├── AuthService.java
│   ├── UserService.java
│   ├── ProjectService.java
│   ├── BoardColumnService.java
│   ├── TaskService.java
│   └── TaskCommentService.java
└── controller/
    ├── AuthController.java
    ├── ProjectController.java
    ├── BoardColumnController.java
    ├── TaskController.java
    └── TaskCommentController.java
```

### Backend — Files to Modify

```
pom.xml                                    # Add spring-security, jjwt, h2, validation deps
src/main/resources/application.properties  # Add JWT config, rename to dev profile
```

### Backend — Files to Remove

```
src/main/java/.../entity/Item.java         # Replaced by new entities
src/main/java/.../repository/ItemRepository.java
src/main/java/.../service/ItemService.java
src/main/java/.../controller/ItemController.java
src/main/java/.../DataSeeder.java          # Will be replaced with new seeder
```

### Config Files to Add

```
src/main/resources/application-dev.properties   # Dev profile (current PostgreSQL config)
src/main/resources/application-test.properties  # H2 in-memory for tests
```

### Frontend — New Files

```
frontend/
├── angular.json
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.spec.json
├── proxy.conf.json                       # Proxy /api to localhost:8081
├── src/
│   ├── index.html
│   ├── main.ts
│   ├── styles.scss
│   ├── app/
│   │   ├── app.component.ts
│   │   ├── app.routes.ts
│   │   ├── core/
│   │   │   ├── auth/
│   │   │   │   ├── auth.service.ts       # Login, signup, refresh, logout
│   │   │   │   ├── auth.guard.ts         # CanActivate guard
│   │   │   │   ├── auth.interceptor.ts   # Attach JWT, handle 401 refresh
│   │   │   │   └── auth.model.ts         # AuthResponse, User interfaces
│   │   │   ├── api/
│   │   │   │   ├── project.service.ts
│   │   │   │   ├── column.service.ts
│   │   │   │   ├── task.service.ts
│   │   │   │   └── comment.service.ts
│   │   │   └── error/
│   │   │       └── error.interceptor.ts  # Global error handling
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   │   └── login.component.ts
│   │   │   │   └── signup/
│   │   │   │       └── signup.component.ts
│   │   │   ├── projects/
│   │   │   │   ├── project-list/
│   │   │   │   │   └── project-list.component.ts
│   │   │   │   └── project-settings/
│   │   │   │       └── project-settings.component.ts
│   │   │   └── board/
│   │   │       ├── board.component.ts            # Main kanban view
│   │   │       ├── board-column/
│   │   │       │   └── board-column.component.ts # Single column
│   │   │       ├── task-card/
│   │   │       │   └── task-card.component.ts    # Card in column
│   │   │       └── task-detail/
│   │   │           └── task-detail.component.ts  # Modal for task editing + comments
│   │   └── shared/
│   │       ├── navbar/
│   │       │   └── navbar.component.ts
│   │       ├── priority-badge/
│   │       │   └── priority-badge.component.ts
│   │       └── not-found/
│   │           └── not-found.component.ts
│   └── environments/
│       ├── environment.ts
│       └── environment.prod.ts
```

---

## Phase 1: Backend

### Task 1: Update Dependencies

**Files:**
- Modify: `pom.xml`

- [ ] **Step 1: Add new dependencies to pom.xml**

Add inside `<dependencies>`:

```xml
<!-- Security -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<!-- JWT -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.6</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>

<!-- Validation -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>

<!-- H2 for tests -->
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>test</scope>
</dependency>
```

- [ ] **Step 2: Verify build compiles**

Run: `./mvnw compile -q`
Expected: BUILD SUCCESS

- [ ] **Step 3: Commit**

```bash
git add pom.xml
git commit -m "feat: add spring-security, jwt, validation, h2 dependencies"
```

---

### Task 2: Error Handling Infrastructure

**Files:**
- Create: `src/main/java/com/kevinmcbeth/enterprise/dto/ErrorResponse.java`
- Create: `src/main/java/com/kevinmcbeth/enterprise/exception/ResourceNotFoundException.java`
- Create: `src/main/java/com/kevinmcbeth/enterprise/exception/BadRequestException.java`
- Create: `src/main/java/com/kevinmcbeth/enterprise/exception/ConflictException.java`
- Create: `src/main/java/com/kevinmcbeth/enterprise/exception/GlobalExceptionHandler.java`

- [ ] **Step 1: Create ErrorResponse DTO**

```java
package com.kevinmcbeth.enterprise.dto;

import java.util.List;

public record ErrorResponse(int status, String message, List<String> errors) {
    public ErrorResponse(int status, String message) {
        this(status, message, List.of());
    }
}
```

- [ ] **Step 2: Create custom exceptions**

ResourceNotFoundException:
```java
package com.kevinmcbeth.enterprise.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
```

BadRequestException:
```java
package com.kevinmcbeth.enterprise.exception;

public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
```

ConflictException:
```java
package com.kevinmcbeth.enterprise.exception;

public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
```

- [ ] **Step 3: Create GlobalExceptionHandler**

```java
package com.kevinmcbeth.enterprise.exception;

import com.kevinmcbeth.enterprise.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(404, ex.getMessage()));
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(BadRequestException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(400, ex.getMessage()));
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ErrorResponse> handleConflict(ConflictException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse(409, ex.getMessage()));
    }

    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<ErrorResponse> handleOptimisticLock(ObjectOptimisticLockingFailureException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse(409, "Resource was modified by another request. Please reload and try again."));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .toList();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(400, "Validation failed", errors));
    }
}
```

- [ ] **Step 4: Verify build compiles**

Run: `./mvnw compile -q`
Expected: BUILD SUCCESS

- [ ] **Step 5: Commit**

```bash
git add src/main/java/com/kevinmcbeth/enterprise/dto/ErrorResponse.java \
        src/main/java/com/kevinmcbeth/enterprise/exception/
git commit -m "feat: add error handling infrastructure with global exception handler"
```

---

### Task 3: User Entity and Repository

**Files:**
- Create: `src/main/java/com/kevinmcbeth/enterprise/entity/User.java`
- Create: `src/main/java/com/kevinmcbeth/enterprise/repository/UserRepository.java`
- Create: `src/test/java/com/kevinmcbeth/enterprise/repository/UserRepositoryTest.java`
- Create: `src/test/resources/application-test.properties`

- [ ] **Step 1: Create test properties for H2**

`src/test/resources/application-test.properties`:
```properties
spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect
```

- [ ] **Step 2: Write failing test for User entity**

```java
package com.kevinmcbeth.enterprise.repository;

import com.kevinmcbeth.enterprise.entity.User;
import com.kevinmcbeth.enterprise.entity.User.Role;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldSaveAndFindByEmail() {
        User user = new User("test@example.com", "hashedpw", "Test User", Role.MEMBER);
        userRepository.save(user);

        Optional<User> found = userRepository.findByEmail("test@example.com");

        assertThat(found).isPresent();
        assertThat(found.get().getDisplayName()).isEqualTo("Test User");
        assertThat(found.get().getRole()).isEqualTo(Role.MEMBER);
        assertThat(found.get().getCreatedAt()).isNotNull();
    }

    @Test
    void shouldReturnEmptyForUnknownEmail() {
        Optional<User> found = userRepository.findByEmail("unknown@example.com");
        assertThat(found).isEmpty();
    }

    @Test
    void shouldCheckExistsByEmail() {
        User user = new User("exists@example.com", "hashedpw", "Exists", Role.MEMBER);
        userRepository.save(user);

        assertThat(userRepository.existsByEmail("exists@example.com")).isTrue();
        assertThat(userRepository.existsByEmail("nope@example.com")).isFalse();
    }
}
```

- [ ] **Step 3: Run test to verify it fails**

Run: `./mvnw test -pl . -Dtest=UserRepositoryTest -Dspring.profiles.active=test -q`
Expected: FAIL — User class does not exist

- [ ] **Step 4: Create User entity**

```java
package com.kevinmcbeth.enterprise.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "users")
public class User {

    public enum Role { ADMIN, MEMBER }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String displayName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    public User() {}

    public User(String email, String password, String displayName, Role role) {
        this.email = email;
        this.password = password;
        this.displayName = displayName;
        this.role = role;
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
```

- [ ] **Step 5: Create UserRepository**

```java
package com.kevinmcbeth.enterprise.repository;

import com.kevinmcbeth.enterprise.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `./mvnw test -pl . -Dtest=UserRepositoryTest -Dspring.profiles.active=test -q`
Expected: PASS (3 tests)

- [ ] **Step 7: Commit**

```bash
git add src/main/java/com/kevinmcbeth/enterprise/entity/User.java \
        src/main/java/com/kevinmcbeth/enterprise/repository/UserRepository.java \
        src/test/java/com/kevinmcbeth/enterprise/repository/UserRepositoryTest.java \
        src/test/resources/application-test.properties
git commit -m "feat: add User entity and repository with tests"
```

---

### Task 4: JWT Token Provider

**Files:**
- Create: `src/main/java/com/kevinmcbeth/enterprise/security/JwtTokenProvider.java`
- Create: `src/test/java/com/kevinmcbeth/enterprise/security/JwtTokenProviderTest.java`
- Modify: `src/main/resources/application.properties`

- [ ] **Step 1: Add JWT config to application.properties**

Append to `application.properties`:
```properties
# JWT
app.jwt.secret=ThisIsADevelopmentSecretKeyThatIsAtLeast256BitsLongForHS256Algorithm
app.jwt.access-token-expiration-ms=900000
app.jwt.refresh-token-expiration-ms=604800000
```

- [ ] **Step 2: Write failing test**

```java
package com.kevinmcbeth.enterprise.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JwtTokenProviderTest {

    private JwtTokenProvider provider;

    @BeforeEach
    void setUp() {
        provider = new JwtTokenProvider(
            "ThisIsADevelopmentSecretKeyThatIsAtLeast256BitsLongForHS256Algorithm",
            900000,
            604800000
        );
    }

    @Test
    void shouldGenerateAndValidateAccessToken() {
        String token = provider.generateAccessToken(1L, "test@example.com");

        assertThat(provider.validateToken(token)).isTrue();
        assertThat(provider.getUserIdFromToken(token)).isEqualTo(1L);
        assertThat(provider.getEmailFromToken(token)).isEqualTo("test@example.com");
    }

    @Test
    void shouldRejectInvalidToken() {
        assertThat(provider.validateToken("invalid.token.here")).isFalse();
    }

    @Test
    void shouldGenerateRefreshToken() {
        String token = provider.generateRefreshToken();
        assertThat(token).isNotBlank();
        assertThat(token.length()).isGreaterThan(20);
    }
}
```

- [ ] **Step 3: Run test to verify it fails**

Run: `./mvnw test -pl . -Dtest=JwtTokenProviderTest -q`
Expected: FAIL — class does not exist

- [ ] **Step 4: Implement JwtTokenProvider**

```java
package com.kevinmcbeth.enterprise.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtTokenProvider {

    private final SecretKey key;
    private final long accessTokenExpirationMs;
    private final long refreshTokenExpirationMs;

    public JwtTokenProvider(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.access-token-expiration-ms}") long accessTokenExpirationMs,
            @Value("${app.jwt.refresh-token-expiration-ms}") long refreshTokenExpirationMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenExpirationMs = accessTokenExpirationMs;
        this.refreshTokenExpirationMs = refreshTokenExpirationMs;
    }

    public String generateAccessToken(Long userId, String email) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + accessTokenExpirationMs);

        return Jwts.builder()
                .subject(userId.toString())
                .claim("email", email)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key)
                .compact();
    }

    public String generateRefreshToken() {
        return UUID.randomUUID().toString();
    }

    public long getRefreshTokenExpirationMs() {
        return refreshTokenExpirationMs;
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public Long getUserIdFromToken(String token) {
        Claims claims = Jwts.parser().verifyWith(key).build()
                .parseSignedClaims(token).getPayload();
        return Long.parseLong(claims.getSubject());
    }

    public String getEmailFromToken(String token) {
        Claims claims = Jwts.parser().verifyWith(key).build()
                .parseSignedClaims(token).getPayload();
        return claims.get("email", String.class);
    }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `./mvnw test -pl . -Dtest=JwtTokenProviderTest -q`
Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add src/main/java/com/kevinmcbeth/enterprise/security/JwtTokenProvider.java \
        src/test/java/com/kevinmcbeth/enterprise/security/JwtTokenProviderTest.java \
        src/main/resources/application.properties
git commit -m "feat: add JWT token provider with generation and validation"
```

---

### Task 5: RefreshToken Entity, Auth Service, and Auth Controller

**Files:**
- Create: `src/main/java/com/kevinmcbeth/enterprise/entity/RefreshToken.java`
- Create: `src/main/java/com/kevinmcbeth/enterprise/repository/RefreshTokenRepository.java`
- Create: `src/main/java/com/kevinmcbeth/enterprise/dto/auth/SignupRequest.java`
- Create: `src/main/java/com/kevinmcbeth/enterprise/dto/auth/LoginRequest.java`
- Create: `src/main/java/com/kevinmcbeth/enterprise/dto/auth/AuthResponse.java`
- Create: `src/main/java/com/kevinmcbeth/enterprise/dto/auth/RefreshRequest.java`
- Create: `src/main/java/com/kevinmcbeth/enterprise/service/AuthService.java`
- Create: `src/main/java/com/kevinmcbeth/enterprise/controller/AuthController.java`
- Create: `src/test/java/com/kevinmcbeth/enterprise/service/AuthServiceTest.java`

- [ ] **Step 1: Create RefreshToken entity**

```java
package com.kevinmcbeth.enterprise.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Instant expiresAt;

    public RefreshToken() {}

    public RefreshToken(String token, Long userId, Instant expiresAt) {
        this.token = token;
        this.userId = userId;
        this.expiresAt = expiresAt;
    }

    public Long getId() { return id; }
    public String getToken() { return token; }
    public Long getUserId() { return userId; }
    public Instant getExpiresAt() { return expiresAt; }
    public boolean isExpired() { return Instant.now().isAfter(expiresAt); }
}
```

- [ ] **Step 2: Create RefreshTokenRepository**

```java
package com.kevinmcbeth.enterprise.repository;

import com.kevinmcbeth.enterprise.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    void deleteByUserId(Long userId);

    @Modifying
    @Query("DELETE FROM RefreshToken r WHERE r.expiresAt < :now")
    int deleteExpiredTokens(Instant now);
}
```

- [ ] **Step 3: Create auth DTOs**

SignupRequest:
```java
package com.kevinmcbeth.enterprise.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SignupRequest(
    @NotBlank @Email String email,
    @NotBlank @Size(min = 8) String password,
    @NotBlank String displayName
) {}
```

LoginRequest:
```java
package com.kevinmcbeth.enterprise.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
    @NotBlank @Email String email,
    @NotBlank String password
) {}
```

AuthResponse:
```java
package com.kevinmcbeth.enterprise.dto.auth;

public record AuthResponse(String accessToken, String refreshToken) {}
```

RefreshRequest:
```java
package com.kevinmcbeth.enterprise.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record RefreshRequest(@NotBlank String refreshToken) {}
```

- [ ] **Step 4: Write failing test for AuthService**

```java
package com.kevinmcbeth.enterprise.service;

import com.kevinmcbeth.enterprise.dto.auth.AuthResponse;
import com.kevinmcbeth.enterprise.dto.auth.LoginRequest;
import com.kevinmcbeth.enterprise.dto.auth.SignupRequest;
import com.kevinmcbeth.enterprise.entity.RefreshToken;
import com.kevinmcbeth.enterprise.entity.User;
import com.kevinmcbeth.enterprise.exception.BadRequestException;
import com.kevinmcbeth.enterprise.exception.ConflictException;
import com.kevinmcbeth.enterprise.repository.RefreshTokenRepository;
import com.kevinmcbeth.enterprise.repository.UserRepository;
import com.kevinmcbeth.enterprise.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private RefreshTokenRepository refreshTokenRepository;

    private AuthService authService;
    private PasswordEncoder passwordEncoder;
    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        jwtTokenProvider = new JwtTokenProvider(
            "ThisIsADevelopmentSecretKeyThatIsAtLeast256BitsLongForHS256Algorithm",
            900000, 604800000
        );
        authService = new AuthService(userRepository, refreshTokenRepository,
                passwordEncoder, jwtTokenProvider);
    }

    @Test
    void signup_shouldCreateUserAndReturnTokens() {
        var request = new SignupRequest("new@example.com", "password123", "New User");
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(1L);
            return u;
        });
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> inv.getArgument(0));

        AuthResponse response = authService.signup(request);

        assertThat(response.accessToken()).isNotBlank();
        assertThat(response.refreshToken()).isNotBlank();
    }

    @Test
    void signup_shouldRejectDuplicateEmail() {
        var request = new SignupRequest("taken@example.com", "password123", "Taken");
        when(userRepository.existsByEmail("taken@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.signup(request))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void login_shouldReturnTokensForValidCredentials() {
        User user = new User("test@example.com", passwordEncoder.encode("password123"),
                "Test", User.Role.MEMBER);
        user.setId(1L);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> inv.getArgument(0));

        AuthResponse response = authService.login(new LoginRequest("test@example.com", "password123"));

        assertThat(response.accessToken()).isNotBlank();
        assertThat(response.refreshToken()).isNotBlank();
    }

    @Test
    void login_shouldRejectBadPassword() {
        User user = new User("test@example.com", passwordEncoder.encode("correct"),
                "Test", User.Role.MEMBER);
        user.setId(1L);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.login(new LoginRequest("test@example.com", "wrong")))
                .isInstanceOf(BadRequestException.class);
    }
}
```

- [ ] **Step 5: Run test to verify it fails**

Run: `./mvnw test -pl . -Dtest=AuthServiceTest -q`
Expected: FAIL — AuthService does not exist

- [ ] **Step 6: Implement AuthService**

```java
package com.kevinmcbeth.enterprise.service;

import com.kevinmcbeth.enterprise.dto.auth.*;
import com.kevinmcbeth.enterprise.entity.RefreshToken;
import com.kevinmcbeth.enterprise.entity.User;
import com.kevinmcbeth.enterprise.exception.BadRequestException;
import com.kevinmcbeth.enterprise.exception.ConflictException;
import com.kevinmcbeth.enterprise.repository.RefreshTokenRepository;
import com.kevinmcbeth.enterprise.repository.UserRepository;
import com.kevinmcbeth.enterprise.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserRepository userRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email already registered");
        }

        User user = new User(
            request.email(),
            passwordEncoder.encode(request.password()),
            request.displayName(),
            User.Role.MEMBER
        );
        user = userRepository.save(user);

        return generateTokens(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }

        return generateTokens(user);
    }

    @Transactional
    public AuthResponse refresh(RefreshRequest request) {
        RefreshToken existing = refreshTokenRepository.findByToken(request.refreshToken())
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));

        if (existing.isExpired()) {
            refreshTokenRepository.delete(existing);
            throw new BadRequestException("Refresh token expired");
        }

        User user = userRepository.findById(existing.getUserId())
                .orElseThrow(() -> new BadRequestException("User not found"));

        // Rotate: delete old, create new
        refreshTokenRepository.delete(existing);
        return generateTokens(user);
    }

    @Transactional
    public void logout(RefreshRequest request) {
        refreshTokenRepository.findByToken(request.refreshToken())
                .ifPresent(refreshTokenRepository::delete);
    }

    private AuthResponse generateTokens(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken();

        Instant expiresAt = Instant.now().plusMillis(jwtTokenProvider.getRefreshTokenExpirationMs());
        refreshTokenRepository.save(new RefreshToken(refreshToken, user.getId(), expiresAt));

        return new AuthResponse(accessToken, refreshToken);
    }
}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `./mvnw test -pl . -Dtest=AuthServiceTest -q`
Expected: PASS (4 tests)

- [ ] **Step 8: Create AuthController**

```java
package com.kevinmcbeth.enterprise.controller;

import com.kevinmcbeth.enterprise.dto.auth.*;
import com.kevinmcbeth.enterprise.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.signup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        return ResponseEntity.ok(authService.refresh(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody RefreshRequest request) {
        authService.logout(request);
        return ResponseEntity.noContent().build();
    }
}
```

- [ ] **Step 9: Commit**

```bash
git add src/main/java/com/kevinmcbeth/enterprise/entity/RefreshToken.java \
        src/main/java/com/kevinmcbeth/enterprise/repository/RefreshTokenRepository.java \
        src/main/java/com/kevinmcbeth/enterprise/dto/auth/ \
        src/main/java/com/kevinmcbeth/enterprise/service/AuthService.java \
        src/main/java/com/kevinmcbeth/enterprise/controller/AuthController.java \
        src/test/java/com/kevinmcbeth/enterprise/service/AuthServiceTest.java
git commit -m "feat: add auth system with signup, login, refresh, logout"
```

---

### Task 6: Spring Security Config and JWT Filter

**Files:**
- Create: `src/main/java/com/kevinmcbeth/enterprise/security/JwtAuthenticationFilter.java`
- Create: `src/main/java/com/kevinmcbeth/enterprise/security/UserDetailsServiceImpl.java`
- Create: `src/main/java/com/kevinmcbeth/enterprise/config/SecurityConfig.java`

- [ ] **Step 1: Create UserDetailsServiceImpl**

```java
package com.kevinmcbeth.enterprise.security;

import com.kevinmcbeth.enterprise.entity.User;
import com.kevinmcbeth.enterprise.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }
}
```

- [ ] **Step 2: Create JwtAuthenticationFilter**

```java
package com.kevinmcbeth.enterprise.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsServiceImpl userDetailsService;

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider,
                                    UserDetailsServiceImpl userDetailsService) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);

            if (jwtTokenProvider.validateToken(token)) {
                String email = jwtTokenProvider.getEmailFromToken(token);
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }

        filterChain.doFilter(request, response);
    }
}
```

- [ ] **Step 3: Create SecurityConfig**

```java
package com.kevinmcbeth.enterprise.config;

import com.kevinmcbeth.enterprise.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/health").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

- [ ] **Step 4: Verify build compiles**

Run: `./mvnw compile -q`
Expected: BUILD SUCCESS

- [ ] **Step 5: Commit**

```bash
git add src/main/java/com/kevinmcbeth/enterprise/security/JwtAuthenticationFilter.java \
        src/main/java/com/kevinmcbeth/enterprise/security/UserDetailsServiceImpl.java \
        src/main/java/com/kevinmcbeth/enterprise/config/SecurityConfig.java
git commit -m "feat: add Spring Security config with JWT filter"
```

---

### Task 7: Project and ProjectMember Entities

**Files:**
- Create: `src/main/java/com/kevinmcbeth/enterprise/entity/Project.java`
- Create: `src/main/java/com/kevinmcbeth/enterprise/entity/ProjectMember.java`
- Create: `src/main/java/com/kevinmcbeth/enterprise/entity/ProjectMemberId.java`
- Create: `src/main/java/com/kevinmcbeth/enterprise/repository/ProjectRepository.java`
- Create: `src/main/java/com/kevinmcbeth/enterprise/repository/ProjectMemberRepository.java`
- Create: `src/test/java/com/kevinmcbeth/enterprise/repository/ProjectRepositoryTest.java`

- [ ] **Step 1: Write failing test**

```java
package com.kevinmcbeth.enterprise.repository;

import com.kevinmcbeth.enterprise.entity.Project;
import com.kevinmcbeth.enterprise.entity.ProjectMember;
import com.kevinmcbeth.enterprise.entity.ProjectMember.MemberRole;
import com.kevinmcbeth.enterprise.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class ProjectRepositoryTest {

    @Autowired private ProjectRepository projectRepository;
    @Autowired private ProjectMemberRepository projectMemberRepository;
    @Autowired private UserRepository userRepository;

    @Test
    void shouldCreateProjectWithOwner() {
        User user = userRepository.save(new User("owner@test.com", "pw", "Owner", User.Role.MEMBER));
        Project project = projectRepository.save(new Project("My Project", "Description"));

        ProjectMember member = new ProjectMember(project.getId(), user.getId(), MemberRole.OWNER);
        projectMemberRepository.save(member);

        var projects = projectMemberRepository.findProjectsByUserId(user.getId());
        assertThat(projects).hasSize(1);
    }

    @Test
    void shouldCheckMembership() {
        User user = userRepository.save(new User("member@test.com", "pw", "Member", User.Role.MEMBER));
        Project project = projectRepository.save(new Project("Project", null));
        projectMemberRepository.save(new ProjectMember(project.getId(), user.getId(), MemberRole.MEMBER));

        assertThat(projectMemberRepository.existsByProjectIdAndUserId(project.getId(), user.getId())).isTrue();
        assertThat(projectMemberRepository.existsByProjectIdAndUserId(project.getId(), 999L)).isFalse();
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `./mvnw test -pl . -Dtest=ProjectRepositoryTest -Dspring.profiles.active=test -q`
Expected: FAIL

- [ ] **Step 3: Create Project entity**

```java
package com.kevinmcbeth.enterprise.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    public Project() {}

    public Project(String name, String description) {
        this.name = name;
        this.description = description;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    public void preUpdate() { this.updatedAt = Instant.now(); }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
```

- [ ] **Step 4: Create ProjectMemberId composite key**

```java
package com.kevinmcbeth.enterprise.entity;

import java.io.Serializable;
import java.util.Objects;

public class ProjectMemberId implements Serializable {
    private Long projectId;
    private Long userId;

    public ProjectMemberId() {}
    public ProjectMemberId(Long projectId, Long userId) {
        this.projectId = projectId;
        this.userId = userId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ProjectMemberId that)) return false;
        return Objects.equals(projectId, that.projectId) && Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() { return Objects.hash(projectId, userId); }
}
```

- [ ] **Step 5: Create ProjectMember entity**

```java
package com.kevinmcbeth.enterprise.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "project_members")
@IdClass(ProjectMemberId.class)
public class ProjectMember {

    public enum MemberRole { OWNER, MEMBER }

    @Id
    private Long projectId;

    @Id
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MemberRole role;

    public ProjectMember() {}

    public ProjectMember(Long projectId, Long userId, MemberRole role) {
        this.projectId = projectId;
        this.userId = userId;
        this.role = role;
    }

    public Long getProjectId() { return projectId; }
    public Long getUserId() { return userId; }
    public MemberRole getRole() { return role; }
    public void setRole(MemberRole role) { this.role = role; }
}
```

- [ ] **Step 6: Create repositories**

ProjectRepository:
```java
package com.kevinmcbeth.enterprise.repository;

import com.kevinmcbeth.enterprise.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Long> {
}
```

ProjectMemberRepository:
```java
package com.kevinmcbeth.enterprise.repository;

import com.kevinmcbeth.enterprise.entity.ProjectMember;
import com.kevinmcbeth.enterprise.entity.ProjectMemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, ProjectMemberId> {
    boolean existsByProjectIdAndUserId(Long projectId, Long userId);
    List<ProjectMember> findByProjectId(Long projectId);

    @Query("SELECT pm FROM ProjectMember pm WHERE pm.userId = :userId")
    List<ProjectMember> findProjectsByUserId(Long userId);

    Optional<ProjectMember> findByProjectIdAndUserId(Long projectId, Long userId);
    void deleteByProjectId(Long projectId);
}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `./mvnw test -pl . -Dtest=ProjectRepositoryTest -Dspring.profiles.active=test -q`
Expected: PASS (2 tests)

- [ ] **Step 8: Commit**

```bash
git add src/main/java/com/kevinmcbeth/enterprise/entity/Project.java \
        src/main/java/com/kevinmcbeth/enterprise/entity/ProjectMember.java \
        src/main/java/com/kevinmcbeth/enterprise/entity/ProjectMemberId.java \
        src/main/java/com/kevinmcbeth/enterprise/repository/ProjectRepository.java \
        src/main/java/com/kevinmcbeth/enterprise/repository/ProjectMemberRepository.java \
        src/test/java/com/kevinmcbeth/enterprise/repository/ProjectRepositoryTest.java
git commit -m "feat: add Project and ProjectMember entities with repositories"
```

---

### Task 8: Project Service and Controller

**Files:**
- Create: `src/main/java/com/kevinmcbeth/enterprise/dto/project/CreateProjectRequest.java`
- Create: `src/main/java/com/kevinmcbeth/enterprise/dto/project/UpdateProjectRequest.java`
- Create: `src/main/java/com/kevinmcbeth/enterprise/dto/project/ProjectResponse.java`
- Create: `src/main/java/com/kevinmcbeth/enterprise/dto/project/AddMemberRequest.java`
- Create: `src/main/java/com/kevinmcbeth/enterprise/service/ProjectService.java`
- Create: `src/main/java/com/kevinmcbeth/enterprise/controller/ProjectController.java`
- Create: `src/test/java/com/kevinmcbeth/enterprise/service/ProjectServiceTest.java`

- [ ] **Step 1: Create project DTOs**

CreateProjectRequest:
```java
package com.kevinmcbeth.enterprise.dto.project;

import jakarta.validation.constraints.NotBlank;

public record CreateProjectRequest(@NotBlank String name, String description) {}
```

UpdateProjectRequest:
```java
package com.kevinmcbeth.enterprise.dto.project;

import jakarta.validation.constraints.NotBlank;

public record UpdateProjectRequest(@NotBlank String name, String description) {}
```

AddMemberRequest:
```java
package com.kevinmcbeth.enterprise.dto.project;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AddMemberRequest(@NotBlank @Email String email) {}
```

ProjectResponse:
```java
package com.kevinmcbeth.enterprise.dto.project;

import java.time.Instant;
import java.util.List;

public record ProjectResponse(
    Long id,
    String name,
    String description,
    Instant createdAt,
    Instant updatedAt,
    List<MemberInfo> members
) {
    public record MemberInfo(Long userId, String displayName, String email, String role) {}
}
```

- [ ] **Step 2: Write failing test for ProjectService**

```java
package com.kevinmcbeth.enterprise.service;

import com.kevinmcbeth.enterprise.dto.project.CreateProjectRequest;
import com.kevinmcbeth.enterprise.dto.project.ProjectResponse;
import com.kevinmcbeth.enterprise.entity.Project;
import com.kevinmcbeth.enterprise.entity.ProjectMember;
import com.kevinmcbeth.enterprise.entity.User;
import com.kevinmcbeth.enterprise.exception.ResourceNotFoundException;
import com.kevinmcbeth.enterprise.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock private ProjectRepository projectRepository;
    @Mock private ProjectMemberRepository projectMemberRepository;
    @Mock private UserRepository userRepository;
    @Mock private BoardColumnRepository boardColumnRepository;
    @Mock private TaskRepository taskRepository;
    @Mock private TaskCommentRepository taskCommentRepository;

    private ProjectService projectService;

    @BeforeEach
    void setUp() {
        projectService = new ProjectService(projectRepository, projectMemberRepository,
                userRepository, boardColumnRepository, taskRepository, taskCommentRepository);
    }

    @Test
    void create_shouldCreateProjectWithDefaultColumnsAndOwner() {
        var request = new CreateProjectRequest("Test Project", "A description");
        when(projectRepository.save(any(Project.class))).thenAnswer(inv -> {
            Project p = inv.getArgument(0);
            p.setId(1L);
            return p;
        });

        ProjectResponse response = projectService.create(request, 42L);

        assertThat(response.name()).isEqualTo("Test Project");
        verify(projectMemberRepository).save(any(ProjectMember.class));
        verify(boardColumnRepository, times(3)).save(any()); // 3 default columns
    }

    @Test
    void getById_shouldThrowWhenNotMember() {
        when(projectMemberRepository.existsByProjectIdAndUserId(1L, 99L)).thenReturn(false);

        assertThatThrownBy(() -> projectService.getById(1L, 99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
```

- [ ] **Step 3: Run test to verify it fails**

Run: `./mvnw test -pl . -Dtest=ProjectServiceTest -q`
Expected: FAIL

- [ ] **Step 4: Implement ProjectService**

```java
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

        // Create default columns
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

        // Cascade: comments -> tasks -> columns -> members -> project
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
            throw new com.kevinmcbeth.enterprise.exception.AccessDeniedException("Only the project owner can perform this action");
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
```

- [ ] **Step 5: Create AccessDeniedException**

```java
package com.kevinmcbeth.enterprise.exception;

public class AccessDeniedException extends RuntimeException {
    public AccessDeniedException(String message) {
        super(message);
    }
}
```

Add handler in GlobalExceptionHandler:
```java
@ExceptionHandler(AccessDeniedException.class)
public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(new ErrorResponse(403, ex.getMessage()));
}
```

- [ ] **Step 6: Create ProjectController**

```java
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
```

- [ ] **Step 7: Run test to verify it passes**

Run: `./mvnw test -pl . -Dtest=ProjectServiceTest -q`
Expected: PASS (2 tests)

- [ ] **Step 8: Commit**

```bash
git add src/main/java/com/kevinmcbeth/enterprise/dto/project/ \
        src/main/java/com/kevinmcbeth/enterprise/service/ProjectService.java \
        src/main/java/com/kevinmcbeth/enterprise/controller/ProjectController.java \
        src/main/java/com/kevinmcbeth/enterprise/exception/AccessDeniedException.java \
        src/main/java/com/kevinmcbeth/enterprise/exception/GlobalExceptionHandler.java \
        src/test/java/com/kevinmcbeth/enterprise/service/ProjectServiceTest.java
git commit -m "feat: add project CRUD with member management"
```

---

### Task 9: BoardColumn Entity, Service, and Controller

**Files:**
- Create: `src/main/java/com/kevinmcbeth/enterprise/entity/BoardColumn.java`
- Create: `src/main/java/com/kevinmcbeth/enterprise/repository/BoardColumnRepository.java`
- Create: `src/main/java/com/kevinmcbeth/enterprise/dto/column/CreateColumnRequest.java`
- Create: `src/main/java/com/kevinmcbeth/enterprise/dto/column/UpdateColumnRequest.java`
- Create: `src/main/java/com/kevinmcbeth/enterprise/service/BoardColumnService.java`
- Create: `src/main/java/com/kevinmcbeth/enterprise/controller/BoardColumnController.java`
- Create: `src/test/java/com/kevinmcbeth/enterprise/service/BoardColumnServiceTest.java`

- [ ] **Step 1: Create BoardColumn entity**

```java
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
```

- [ ] **Step 2: Create BoardColumnRepository**

```java
package com.kevinmcbeth.enterprise.repository;

import com.kevinmcbeth.enterprise.entity.BoardColumn;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BoardColumnRepository extends JpaRepository<BoardColumn, Long> {
    List<BoardColumn> findByProjectIdOrderByPosition(Long projectId);
    void deleteByProjectId(Long projectId);
}
```

- [ ] **Step 3: Create column DTOs**

CreateColumnRequest:
```java
package com.kevinmcbeth.enterprise.dto.column;

import jakarta.validation.constraints.NotBlank;

public record CreateColumnRequest(@NotBlank String name) {}
```

UpdateColumnRequest:
```java
package com.kevinmcbeth.enterprise.dto.column;

import jakarta.validation.constraints.NotBlank;

public record UpdateColumnRequest(@NotBlank String name, Integer position) {}
```

- [ ] **Step 4: Write failing test for BoardColumnService**

```java
package com.kevinmcbeth.enterprise.service;

import com.kevinmcbeth.enterprise.dto.column.CreateColumnRequest;
import com.kevinmcbeth.enterprise.entity.BoardColumn;
import com.kevinmcbeth.enterprise.exception.BadRequestException;
import com.kevinmcbeth.enterprise.repository.BoardColumnRepository;
import com.kevinmcbeth.enterprise.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BoardColumnServiceTest {

    @Mock private BoardColumnRepository boardColumnRepository;
    @Mock private TaskRepository taskRepository;
    @Mock private ProjectService projectService;

    private BoardColumnService service;

    @BeforeEach
    void setUp() {
        service = new BoardColumnService(boardColumnRepository, taskRepository, projectService);
    }

    @Test
    void create_shouldAppendColumnAtEnd() {
        when(boardColumnRepository.findByProjectIdOrderByPosition(1L))
                .thenReturn(List.of(
                    new BoardColumn(1L, "To Do", 0),
                    new BoardColumn(1L, "Done", 1000)));
        when(boardColumnRepository.save(any(BoardColumn.class))).thenAnswer(inv -> inv.getArgument(0));

        BoardColumn col = service.create(1L, new CreateColumnRequest("Review"), 42L);

        assertThat(col.getName()).isEqualTo("Review");
        assertThat(col.getPosition()).isEqualTo(2000);
    }

    @Test
    void delete_shouldBlockIfColumnHasTasks() {
        BoardColumn col = new BoardColumn(1L, "In Progress", 1000);
        col.setId(5L);
        when(boardColumnRepository.findById(5L)).thenReturn(Optional.of(col));
        when(taskRepository.countByColumnId(5L)).thenReturn(3L);

        assertThatThrownBy(() -> service.delete(1L, 5L, 42L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("not empty");
    }
}
```

- [ ] **Step 5: Run test to verify it fails**

Run: `./mvnw test -pl . -Dtest=BoardColumnServiceTest -q`
Expected: FAIL

- [ ] **Step 6: Implement BoardColumnService**

```java
package com.kevinmcbeth.enterprise.service;

import com.kevinmcbeth.enterprise.dto.column.CreateColumnRequest;
import com.kevinmcbeth.enterprise.dto.column.UpdateColumnRequest;
import com.kevinmcbeth.enterprise.entity.BoardColumn;
import com.kevinmcbeth.enterprise.exception.BadRequestException;
import com.kevinmcbeth.enterprise.exception.ResourceNotFoundException;
import com.kevinmcbeth.enterprise.repository.BoardColumnRepository;
import com.kevinmcbeth.enterprise.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BoardColumnService {

    private final BoardColumnRepository boardColumnRepository;
    private final TaskRepository taskRepository;
    private final ProjectService projectService;

    public BoardColumnService(BoardColumnRepository boardColumnRepository,
                               TaskRepository taskRepository,
                               ProjectService projectService) {
        this.boardColumnRepository = boardColumnRepository;
        this.taskRepository = taskRepository;
        this.projectService = projectService;
    }

    @Transactional(readOnly = true)
    public List<BoardColumn> listColumns(Long projectId, Long userId) {
        projectService.requireMembership(projectId, userId);
        return boardColumnRepository.findByProjectIdOrderByPosition(projectId);
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
```

- [ ] **Step 7: Create BoardColumnController**

```java
package com.kevinmcbeth.enterprise.controller;

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
```

- [ ] **Step 8: Run test to verify it passes**

Run: `./mvnw test -pl . -Dtest=BoardColumnServiceTest -q`
Expected: PASS (2 tests)

- [ ] **Step 9: Commit**

```bash
git add src/main/java/com/kevinmcbeth/enterprise/entity/BoardColumn.java \
        src/main/java/com/kevinmcbeth/enterprise/repository/BoardColumnRepository.java \
        src/main/java/com/kevinmcbeth/enterprise/dto/column/ \
        src/main/java/com/kevinmcbeth/enterprise/service/BoardColumnService.java \
        src/main/java/com/kevinmcbeth/enterprise/controller/BoardColumnController.java \
        src/test/java/com/kevinmcbeth/enterprise/service/BoardColumnServiceTest.java
git commit -m "feat: add board column CRUD with position management"
```

---

### Task 10: Task Entity, Service, and Controller

**Files:**
- Create: `src/main/java/com/kevinmcbeth/enterprise/entity/Task.java`
- Create: `src/main/java/com/kevinmcbeth/enterprise/repository/TaskRepository.java`
- Create: `src/main/java/com/kevinmcbeth/enterprise/dto/task/CreateTaskRequest.java`
- Create: `src/main/java/com/kevinmcbeth/enterprise/dto/task/UpdateTaskRequest.java`
- Create: `src/main/java/com/kevinmcbeth/enterprise/dto/task/MoveTaskRequest.java`
- Create: `src/main/java/com/kevinmcbeth/enterprise/dto/task/TaskResponse.java`
- Create: `src/main/java/com/kevinmcbeth/enterprise/service/TaskService.java`
- Create: `src/main/java/com/kevinmcbeth/enterprise/controller/TaskController.java`
- Create: `src/test/java/com/kevinmcbeth/enterprise/service/TaskServiceTest.java`

- [ ] **Step 1: Create Task entity**

```java
package com.kevinmcbeth.enterprise.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "tasks")
public class Task {

    public enum Priority { P0, P1, P2, P3, P4 }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String description;

    @Column(nullable = false)
    private Long columnId;

    private Long assigneeId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority;

    @Column(nullable = false)
    private Integer position;

    @Version
    private Long version;

    private LocalDate dueDate;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    public Task() {}

    public Task(String title, String description, Long columnId, Long assigneeId,
                Priority priority, Integer position, LocalDate dueDate) {
        this.title = title;
        this.description = description;
        this.columnId = columnId;
        this.assigneeId = assigneeId;
        this.priority = priority;
        this.position = position;
        this.dueDate = dueDate;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    public void preUpdate() { this.updatedAt = Instant.now(); }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Long getColumnId() { return columnId; }
    public void setColumnId(Long columnId) { this.columnId = columnId; }
    public Long getAssigneeId() { return assigneeId; }
    public void setAssigneeId(Long assigneeId) { this.assigneeId = assigneeId; }
    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }
    public Integer getPosition() { return position; }
    public void setPosition(Integer position) { this.position = position; }
    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
```

- [ ] **Step 2: Create TaskRepository**

```java
package com.kevinmcbeth.enterprise.repository;

import com.kevinmcbeth.enterprise.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByColumnIdOrderByPosition(Long columnId);
    long countByColumnId(Long columnId);
    void deleteByColumnId(Long columnId);
}
```

- [ ] **Step 3: Create task DTOs**

CreateTaskRequest:
```java
package com.kevinmcbeth.enterprise.dto.task;

import com.kevinmcbeth.enterprise.entity.Task.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CreateTaskRequest(
    @NotBlank String title,
    String description,
    Long assigneeId,
    @NotNull Priority priority,
    LocalDate dueDate
) {}
```

UpdateTaskRequest:
```java
package com.kevinmcbeth.enterprise.dto.task;

import com.kevinmcbeth.enterprise.entity.Task.Priority;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record UpdateTaskRequest(
    @NotBlank String title,
    String description,
    Long assigneeId,
    Priority priority,
    LocalDate dueDate
) {}
```

MoveTaskRequest:
```java
package com.kevinmcbeth.enterprise.dto.task;

import jakarta.validation.constraints.NotNull;

public record MoveTaskRequest(
    @NotNull Long columnId,
    @NotNull Integer position,
    @NotNull Long version
) {}
```

TaskResponse:
```java
package com.kevinmcbeth.enterprise.dto.task;

import com.kevinmcbeth.enterprise.entity.Task.Priority;

import java.time.Instant;
import java.time.LocalDate;

public record TaskResponse(
    Long id,
    String title,
    String description,
    Long columnId,
    Long assigneeId,
    String assigneeName,
    Priority priority,
    Integer position,
    Long version,
    LocalDate dueDate,
    Instant createdAt,
    Instant updatedAt
) {}
```

- [ ] **Step 4: Write failing test for TaskService**

```java
package com.kevinmcbeth.enterprise.service;

import com.kevinmcbeth.enterprise.dto.task.CreateTaskRequest;
import com.kevinmcbeth.enterprise.dto.task.MoveTaskRequest;
import com.kevinmcbeth.enterprise.dto.task.TaskResponse;
import com.kevinmcbeth.enterprise.entity.BoardColumn;
import com.kevinmcbeth.enterprise.entity.Task;
import com.kevinmcbeth.enterprise.entity.Task.Priority;
import com.kevinmcbeth.enterprise.exception.ConflictException;
import com.kevinmcbeth.enterprise.repository.BoardColumnRepository;
import com.kevinmcbeth.enterprise.repository.TaskCommentRepository;
import com.kevinmcbeth.enterprise.repository.TaskRepository;
import com.kevinmcbeth.enterprise.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock private TaskRepository taskRepository;
    @Mock private BoardColumnRepository boardColumnRepository;
    @Mock private TaskCommentRepository taskCommentRepository;
    @Mock private UserRepository userRepository;
    @Mock private ProjectService projectService;

    private TaskService service;

    @BeforeEach
    void setUp() {
        service = new TaskService(taskRepository, boardColumnRepository,
                taskCommentRepository, userRepository, projectService);
    }

    @Test
    void create_shouldSetPositionWithGap() {
        BoardColumn col = new BoardColumn(1L, "To Do", 0);
        col.setId(10L);
        when(boardColumnRepository.findById(10L)).thenReturn(Optional.of(col));
        when(taskRepository.findByColumnIdOrderByPosition(10L)).thenReturn(List.of());
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> {
            Task t = inv.getArgument(0);
            t.setId(1L);
            return t;
        });

        var request = new CreateTaskRequest("Task 1", null, null, Priority.P2, null);
        TaskResponse response = service.create(1L, 10L, request, 42L);

        assertThat(response.title()).isEqualTo("Task 1");
        assertThat(response.position()).isEqualTo(0);
    }

    @Test
    void move_shouldRejectVersionMismatch() {
        Task task = new Task("Task", null, 10L, null, Priority.P2, 0, null);
        task.setId(1L);
        task.setVersion(5L);

        BoardColumn col = new BoardColumn(1L, "To Do", 0);
        col.setId(10L);

        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));
        when(boardColumnRepository.findById(10L)).thenReturn(Optional.of(col));

        var moveRequest = new MoveTaskRequest(10L, 500, 3L); // version mismatch

        assertThatThrownBy(() -> service.move(1L, 1L, moveRequest, 42L))
                .isInstanceOf(ConflictException.class);
    }
}
```

- [ ] **Step 5: Run test to verify it fails**

Run: `./mvnw test -pl . -Dtest=TaskServiceTest -q`
Expected: FAIL

- [ ] **Step 6: Implement TaskService**

```java
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

        // Optimistic lock check
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
```

- [ ] **Step 7: Create TaskController**

```java
package com.kevinmcbeth.enterprise.controller;

import com.kevinmcbeth.enterprise.dto.task.*;
import com.kevinmcbeth.enterprise.security.JwtTokenProvider;
import com.kevinmcbeth.enterprise.service.TaskService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects/{projectId}")
public class TaskController {

    private final TaskService taskService;
    private final JwtTokenProvider jwtTokenProvider;

    public TaskController(TaskService taskService, JwtTokenProvider jwtTokenProvider) {
        this.taskService = taskService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/columns/{columnId}/tasks")
    public ResponseEntity<TaskResponse> create(@PathVariable Long projectId,
                                                @PathVariable Long columnId,
                                                @Valid @RequestBody CreateTaskRequest body,
                                                HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(taskService.create(projectId, columnId, body, getUserId(request)));
    }

    @PutMapping("/tasks/{id}")
    public TaskResponse update(@PathVariable Long projectId, @PathVariable Long id,
                                @Valid @RequestBody UpdateTaskRequest body,
                                HttpServletRequest request) {
        return taskService.update(projectId, id, body, getUserId(request));
    }

    @PatchMapping("/tasks/{id}/move")
    public TaskResponse move(@PathVariable Long projectId, @PathVariable Long id,
                              @Valid @RequestBody MoveTaskRequest body,
                              HttpServletRequest request) {
        return taskService.move(projectId, id, body, getUserId(request));
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long projectId, @PathVariable Long id,
                                        HttpServletRequest request) {
        taskService.delete(projectId, id, getUserId(request));
        return ResponseEntity.noContent().build();
    }

    private Long getUserId(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtTokenProvider.getUserIdFromToken(token);
    }
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `./mvnw test -pl . -Dtest=TaskServiceTest -q`
Expected: PASS (2 tests)

- [ ] **Step 9: Commit**

```bash
git add src/main/java/com/kevinmcbeth/enterprise/entity/Task.java \
        src/main/java/com/kevinmcbeth/enterprise/repository/TaskRepository.java \
        src/main/java/com/kevinmcbeth/enterprise/dto/task/ \
        src/main/java/com/kevinmcbeth/enterprise/service/TaskService.java \
        src/main/java/com/kevinmcbeth/enterprise/controller/TaskController.java \
        src/test/java/com/kevinmcbeth/enterprise/service/TaskServiceTest.java
git commit -m "feat: add task CRUD with optimistic locking for moves"
```

---

### Task 11: TaskComment Entity, Service, and Controller

**Files:**
- Create: `src/main/java/com/kevinmcbeth/enterprise/entity/TaskComment.java`
- Create: `src/main/java/com/kevinmcbeth/enterprise/repository/TaskCommentRepository.java`
- Create: `src/main/java/com/kevinmcbeth/enterprise/dto/comment/CreateCommentRequest.java`
- Create: `src/main/java/com/kevinmcbeth/enterprise/dto/comment/CommentResponse.java`
- Create: `src/main/java/com/kevinmcbeth/enterprise/service/TaskCommentService.java`
- Create: `src/main/java/com/kevinmcbeth/enterprise/controller/TaskCommentController.java`

- [ ] **Step 1: Create TaskComment entity**

```java
package com.kevinmcbeth.enterprise.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "task_comments")
public class TaskComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long taskId;

    @Column(nullable = false)
    private Long authorId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    public TaskComment() {}

    public TaskComment(Long taskId, Long authorId, String body) {
        this.taskId = taskId;
        this.authorId = authorId;
        this.body = body;
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public Long getTaskId() { return taskId; }
    public Long getAuthorId() { return authorId; }
    public String getBody() { return body; }
    public Instant getCreatedAt() { return createdAt; }
}
```

- [ ] **Step 2: Create TaskCommentRepository**

```java
package com.kevinmcbeth.enterprise.repository;

import com.kevinmcbeth.enterprise.entity.TaskComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskCommentRepository extends JpaRepository<TaskComment, Long> {
    Page<TaskComment> findByTaskIdOrderByCreatedAtDesc(Long taskId, Pageable pageable);
    void deleteByTaskId(Long taskId);
}
```

- [ ] **Step 3: Create comment DTOs**

CreateCommentRequest:
```java
package com.kevinmcbeth.enterprise.dto.comment;

import jakarta.validation.constraints.NotBlank;

public record CreateCommentRequest(@NotBlank String body) {}
```

CommentResponse:
```java
package com.kevinmcbeth.enterprise.dto.comment;

import java.time.Instant;

public record CommentResponse(Long id, String body, Long authorId, String authorName, Instant createdAt) {}
```

- [ ] **Step 4: Implement TaskCommentService**

```java
package com.kevinmcbeth.enterprise.service;

import com.kevinmcbeth.enterprise.dto.comment.CommentResponse;
import com.kevinmcbeth.enterprise.dto.comment.CreateCommentRequest;
import com.kevinmcbeth.enterprise.entity.TaskComment;
import com.kevinmcbeth.enterprise.entity.User;
import com.kevinmcbeth.enterprise.repository.TaskCommentRepository;
import com.kevinmcbeth.enterprise.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TaskCommentService {

    private final TaskCommentRepository taskCommentRepository;
    private final UserRepository userRepository;
    private final ProjectService projectService;

    public TaskCommentService(TaskCommentRepository taskCommentRepository,
                               UserRepository userRepository,
                               ProjectService projectService) {
        this.taskCommentRepository = taskCommentRepository;
        this.userRepository = userRepository;
        this.projectService = projectService;
    }

    @Transactional(readOnly = true)
    public Page<CommentResponse> list(Long projectId, Long taskId, Pageable pageable, Long userId) {
        projectService.requireMembership(projectId, userId);
        return taskCommentRepository.findByTaskIdOrderByCreatedAtDesc(taskId, pageable)
                .map(this::toResponse);
    }

    @Transactional
    public CommentResponse create(Long projectId, Long taskId, CreateCommentRequest request, Long userId) {
        projectService.requireMembership(projectId, userId);
        TaskComment comment = new TaskComment(taskId, userId, request.body());
        comment = taskCommentRepository.save(comment);
        return toResponse(comment);
    }

    private CommentResponse toResponse(TaskComment comment) {
        String authorName = userRepository.findById(comment.getAuthorId())
                .map(User::getDisplayName).orElse("Unknown");
        return new CommentResponse(comment.getId(), comment.getBody(),
                comment.getAuthorId(), authorName, comment.getCreatedAt());
    }
}
```

- [ ] **Step 5: Create TaskCommentController**

```java
package com.kevinmcbeth.enterprise.controller;

import com.kevinmcbeth.enterprise.dto.comment.CommentResponse;
import com.kevinmcbeth.enterprise.dto.comment.CreateCommentRequest;
import com.kevinmcbeth.enterprise.security.JwtTokenProvider;
import com.kevinmcbeth.enterprise.service.TaskCommentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects/{projectId}/tasks/{taskId}/comments")
public class TaskCommentController {

    private final TaskCommentService taskCommentService;
    private final JwtTokenProvider jwtTokenProvider;

    public TaskCommentController(TaskCommentService taskCommentService,
                                  JwtTokenProvider jwtTokenProvider) {
        this.taskCommentService = taskCommentService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @GetMapping
    public Page<CommentResponse> list(@PathVariable Long projectId, @PathVariable Long taskId,
                                       Pageable pageable, HttpServletRequest request) {
        return taskCommentService.list(projectId, taskId, pageable, getUserId(request));
    }

    @PostMapping
    public ResponseEntity<CommentResponse> create(@PathVariable Long projectId,
                                                    @PathVariable Long taskId,
                                                    @Valid @RequestBody CreateCommentRequest body,
                                                    HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(taskCommentService.create(projectId, taskId, body, getUserId(request)));
    }

    private Long getUserId(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtTokenProvider.getUserIdFromToken(token);
    }
}
```

- [ ] **Step 6: Verify build compiles**

Run: `./mvnw compile -q`
Expected: BUILD SUCCESS

- [ ] **Step 7: Commit**

```bash
git add src/main/java/com/kevinmcbeth/enterprise/entity/TaskComment.java \
        src/main/java/com/kevinmcbeth/enterprise/repository/TaskCommentRepository.java \
        src/main/java/com/kevinmcbeth/enterprise/dto/comment/ \
        src/main/java/com/kevinmcbeth/enterprise/service/TaskCommentService.java \
        src/main/java/com/kevinmcbeth/enterprise/controller/TaskCommentController.java
git commit -m "feat: add task comments with pagination"
```

---

### Task 12: Remove Old Item Code and Update DataSeeder

**Files:**
- Remove: `src/main/java/com/kevinmcbeth/enterprise/entity/Item.java`
- Remove: `src/main/java/com/kevinmcbeth/enterprise/repository/ItemRepository.java`
- Remove: `src/main/java/com/kevinmcbeth/enterprise/service/ItemService.java`
- Remove: `src/main/java/com/kevinmcbeth/enterprise/controller/ItemController.java`
- Modify: `src/main/java/com/kevinmcbeth/enterprise/DataSeeder.java`
- Modify: `src/test/java/com/kevinmcbeth/enterprise/EnterpriseApplicationTests.java`

- [ ] **Step 1: Delete old Item files**

```bash
rm src/main/java/com/kevinmcbeth/enterprise/entity/Item.java
rm src/main/java/com/kevinmcbeth/enterprise/repository/ItemRepository.java
rm src/main/java/com/kevinmcbeth/enterprise/service/ItemService.java
rm src/main/java/com/kevinmcbeth/enterprise/controller/ItemController.java
```

- [ ] **Step 2: Replace DataSeeder with project-aware seeder**

```java
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

        // Create demo users
        User admin = userRepository.save(new User("admin@example.com",
                passwordEncoder.encode("password"), "Admin User", User.Role.ADMIN));
        User member = userRepository.save(new User("member@example.com",
                passwordEncoder.encode("password"), "Team Member", User.Role.MEMBER));

        // Create demo project
        Project project = projectRepository.save(new Project("Demo Project", "A sample kanban project"));

        // Add members
        projectMemberRepository.save(new ProjectMember(project.getId(), admin.getId(),
                ProjectMember.MemberRole.OWNER));
        projectMemberRepository.save(new ProjectMember(project.getId(), member.getId(),
                ProjectMember.MemberRole.MEMBER));

        // Create columns
        BoardColumn todo = boardColumnRepository.save(new BoardColumn(project.getId(), "To Do", 0));
        BoardColumn inProgress = boardColumnRepository.save(new BoardColumn(project.getId(), "In Progress", 1000));
        BoardColumn done = boardColumnRepository.save(new BoardColumn(project.getId(), "Done", 2000));

        // Create sample tasks
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
```

- [ ] **Step 3: Update EnterpriseApplicationTests to use test profile**

```java
package com.kevinmcbeth.enterprise;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class EnterpriseApplicationTests {

    @Test
    void contextLoads() {
    }
}
```

- [ ] **Step 4: Verify all tests pass**

Run: `./mvnw test -Dspring.profiles.active=test -q`
Expected: BUILD SUCCESS, all tests pass

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: replace item scaffold with kanban project seed data"
```

---

## Phase 2: Angular Frontend

### Task 13: Angular Project Setup

**Files:**
- Create: `frontend/` (via Angular CLI)
- Modify: `pom.xml` (add frontend-maven-plugin)

- [ ] **Step 1: Install Node.js if needed and create Angular project**

```bash
cd /home/kmcbeth/gt/enterprise_system/mayor/rig
npx @angular/cli new frontend --routing --style=scss --skip-git --skip-tests=false
```

- [ ] **Step 2: Create proxy config**

`frontend/proxy.conf.json`:
```json
{
  "/api": {
    "target": "http://localhost:8081",
    "secure": false
  },
  "/health": {
    "target": "http://localhost:8081",
    "secure": false
  }
}
```

- [ ] **Step 3: Update angular.json to use proxy in serve**

In `frontend/angular.json`, under `architect.serve.options`, add:
```json
"proxyConfig": "proxy.conf.json"
```

- [ ] **Step 4: Add frontend-maven-plugin to pom.xml**

Add inside `<build><plugins>`:
```xml
<plugin>
    <groupId>com.github.eirslett</groupId>
    <artifactId>frontend-maven-plugin</artifactId>
    <version>1.15.1</version>
    <configuration>
        <workingDirectory>frontend</workingDirectory>
        <installDirectory>target</installDirectory>
    </configuration>
    <executions>
        <execution>
            <id>install-node-and-npm</id>
            <goals><goal>install-node-and-npm</goal></goals>
            <configuration>
                <nodeVersion>v20.11.1</nodeVersion>
            </configuration>
        </execution>
        <execution>
            <id>npm-install</id>
            <goals><goal>npm</goal></goals>
        </execution>
        <execution>
            <id>npm-build</id>
            <goals><goal>npm</goal></goals>
            <configuration>
                <arguments>run build</arguments>
            </configuration>
        </execution>
    </executions>
</plugin>
```

- [ ] **Step 5: Configure Angular build output**

Update `frontend/angular.json` — set `outputPath` to `../src/main/resources/static`.

- [ ] **Step 6: Verify Angular dev server starts**

```bash
cd frontend && npm start
```
Expected: Angular dev server starts on port 4200

- [ ] **Step 7: Commit**

```bash
git add frontend/ pom.xml
git commit -m "feat: add Angular frontend project with proxy and Maven integration"
```

---

### Task 14: Angular Auth Module

**Files:**
- Create: `frontend/src/app/core/auth/auth.model.ts`
- Create: `frontend/src/app/core/auth/auth.service.ts`
- Create: `frontend/src/app/core/auth/auth.guard.ts`
- Create: `frontend/src/app/core/auth/auth.interceptor.ts`
- Create: `frontend/src/app/features/auth/login/login.component.ts`
- Create: `frontend/src/app/features/auth/signup/signup.component.ts`
- Modify: `frontend/src/app/app.routes.ts`

- [ ] **Step 1: Create auth model**

```typescript
// frontend/src/app/core/auth/auth.model.ts
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserInfo {
  id: number;
  email: string;
}
```

- [ ] **Step 2: Create auth service**

```typescript
// frontend/src/app/core/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse } from './auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(!!localStorage.getItem('accessToken'));
  isLoggedIn$ = this.loggedIn.asObservable();

  constructor(private http: HttpClient) {}

  signup(email: string, password: string, displayName: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/signup', { email, password, displayName })
      .pipe(tap(res => this.storeTokens(res)));
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/login', { email, password })
      .pipe(tap(res => this.storeTokens(res)));
  }

  refresh(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post<AuthResponse>('/api/auth/refresh', { refreshToken })
      .pipe(tap(res => this.storeTokens(res)));
  }

  logout(): void {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      this.http.post('/api/auth/logout', { refreshToken }).subscribe();
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.loggedIn.next(false);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  private storeTokens(res: AuthResponse): void {
    localStorage.setItem('accessToken', res.accessToken);
    localStorage.setItem('refreshToken', res.refreshToken);
    this.loggedIn.next(true);
  }
}
```

- [ ] **Step 3: Create auth guard**

```typescript
// frontend/src/app/core/auth/auth.guard.ts
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.getAccessToken()) {
    return true;
  }
  return router.parseUrl('/login');
};
```

- [ ] **Step 4: Create auth interceptor**

```typescript
// frontend/src/app/core/auth/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  if (token && !req.url.includes('/api/auth/')) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req);
};
```

- [ ] **Step 5: Create login component**

```typescript
// frontend/src/app/features/auth/login/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <h2>Login</h2>
      <form (ngSubmit)="onSubmit()">
        <div><label>Email</label><input type="email" [(ngModel)]="email" name="email" required></div>
        <div><label>Password</label><input type="password" [(ngModel)]="password" name="password" required></div>
        <p *ngIf="error" class="error">{{ error }}</p>
        <button type="submit">Login</button>
      </form>
      <p>No account? <a routerLink="/signup">Sign up</a></p>
    </div>
  `,
  styles: [`
    .auth-container { max-width: 400px; margin: 80px auto; padding: 24px; }
    form div { margin-bottom: 16px; }
    label { display: block; margin-bottom: 4px; font-weight: 600; }
    input { width: 100%; padding: 8px; box-sizing: border-box; }
    button { width: 100%; padding: 10px; background: #1a73e8; color: white; border: none; cursor: pointer; }
    .error { color: red; }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.error = '';
    this.authService.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/projects']),
      error: () => this.error = 'Invalid email or password'
    });
  }
}
```

- [ ] **Step 6: Create signup component**

```typescript
// frontend/src/app/features/auth/signup/signup.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <h2>Sign Up</h2>
      <form (ngSubmit)="onSubmit()">
        <div><label>Display Name</label><input [(ngModel)]="displayName" name="displayName" required></div>
        <div><label>Email</label><input type="email" [(ngModel)]="email" name="email" required></div>
        <div><label>Password</label><input type="password" [(ngModel)]="password" name="password" required minlength="8"></div>
        <p *ngIf="error" class="error">{{ error }}</p>
        <button type="submit">Sign Up</button>
      </form>
      <p>Already have an account? <a routerLink="/login">Login</a></p>
    </div>
  `,
  styles: [`
    .auth-container { max-width: 400px; margin: 80px auto; padding: 24px; }
    form div { margin-bottom: 16px; }
    label { display: block; margin-bottom: 4px; font-weight: 600; }
    input { width: 100%; padding: 8px; box-sizing: border-box; }
    button { width: 100%; padding: 10px; background: #1a73e8; color: white; border: none; cursor: pointer; }
    .error { color: red; }
  `]
})
export class SignupComponent {
  displayName = '';
  email = '';
  password = '';
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.error = '';
    this.authService.signup(this.email, this.password, this.displayName).subscribe({
      next: () => this.router.navigate(['/projects']),
      error: (err) => this.error = err.error?.message || 'Signup failed'
    });
  }
}
```

- [ ] **Step 7: Set up routes and app config**

```typescript
// frontend/src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/projects', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'signup', loadComponent: () => import('./features/auth/signup/signup.component').then(m => m.SignupComponent) },
  { path: 'projects', loadComponent: () => import('./features/projects/project-list/project-list.component').then(m => m.ProjectListComponent), canActivate: [authGuard] },
  { path: 'projects/:id/board', loadComponent: () => import('./features/board/board.component').then(m => m.BoardComponent), canActivate: [authGuard] },
  { path: 'projects/:id/settings', loadComponent: () => import('./features/projects/project-settings/project-settings.component').then(m => m.ProjectSettingsComponent), canActivate: [authGuard] },
  { path: '**', loadComponent: () => import('./shared/not-found/not-found.component').then(m => m.NotFoundComponent) }
];
```

- [ ] **Step 8: Commit**

```bash
git add frontend/src/app/core/auth/ frontend/src/app/features/auth/ frontend/src/app/app.routes.ts
git commit -m "feat: add Angular auth module with login, signup, guard, interceptor"
```

---

### Task 15: Angular Project List and API Services

**Files:**
- Create: `frontend/src/app/core/api/project.service.ts`
- Create: `frontend/src/app/features/projects/project-list/project-list.component.ts`
- Create: `frontend/src/app/features/projects/project-settings/project-settings.component.ts`
- Create: `frontend/src/app/shared/navbar/navbar.component.ts`
- Create: `frontend/src/app/shared/not-found/not-found.component.ts`

- [ ] **Step 1: Create project API service**

```typescript
// frontend/src/app/core/api/project.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProjectResponse {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  members: MemberInfo[];
}

export interface MemberInfo {
  userId: number;
  displayName: string;
  email: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class ProjectService {
  constructor(private http: HttpClient) {}

  list(): Observable<ProjectResponse[]> {
    return this.http.get<ProjectResponse[]>('/api/projects');
  }

  get(id: number): Observable<ProjectResponse> {
    return this.http.get<ProjectResponse>(`/api/projects/${id}`);
  }

  create(name: string, description: string): Observable<ProjectResponse> {
    return this.http.post<ProjectResponse>('/api/projects', { name, description });
  }

  update(id: number, name: string, description: string): Observable<ProjectResponse> {
    return this.http.put<ProjectResponse>(`/api/projects/${id}`, { name, description });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/api/projects/${id}`);
  }

  addMember(projectId: number, email: string): Observable<void> {
    return this.http.post<void>(`/api/projects/${projectId}/members`, { email });
  }

  removeMember(projectId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`/api/projects/${projectId}/members/${userId}`);
  }
}
```

- [ ] **Step 2: Create navbar component**

```typescript
// frontend/src/app/shared/navbar/navbar.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav>
      <a routerLink="/projects">Projects</a>
      <button (click)="logout()">Logout</button>
    </nav>
  `,
  styles: [`
    nav { display: flex; justify-content: space-between; align-items: center; padding: 12px 24px; background: #1a73e8; color: white; }
    a { color: white; text-decoration: none; font-weight: 600; }
    button { background: transparent; color: white; border: 1px solid white; padding: 6px 12px; cursor: pointer; }
  `]
})
export class NavbarComponent {
  constructor(private authService: AuthService) {}
  logout() { this.authService.logout(); window.location.href = '/login'; }
}
```

- [ ] **Step 3: Create not-found component**

```typescript
// frontend/src/app/shared/not-found/not-found.component.ts
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `<div class="container"><h2>404 — Page Not Found</h2><a routerLink="/projects">Back to Projects</a></div>`,
  styles: [`.container { text-align: center; margin-top: 80px; } a { color: #1a73e8; }`]
})
export class NotFoundComponent {}
```

- [ ] **Step 4: Create project list component**

```typescript
// frontend/src/app/features/projects/project-list/project-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { ProjectService, ProjectResponse } from '../../../core/api/project.service';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
  template: `
    <app-navbar />
    <div class="container">
      <div class="header">
        <h2>Projects</h2>
        <button (click)="showCreate = !showCreate">+ New Project</button>
      </div>
      <div *ngIf="showCreate" class="create-form">
        <input [(ngModel)]="newName" placeholder="Project name" />
        <input [(ngModel)]="newDescription" placeholder="Description (optional)" />
        <button (click)="create()">Create</button>
      </div>
      <div *ngFor="let project of projects" class="project-card">
        <a [routerLink]="['/projects', project.id, 'board']">
          <h3>{{ project.name }}</h3>
          <p>{{ project.description }}</p>
          <small>{{ project.members.length }} member(s)</small>
        </a>
      </div>
      <p *ngIf="projects.length === 0">No projects yet. Create one to get started.</p>
    </div>
  `,
  styles: [`
    .container { max-width: 800px; margin: 24px auto; padding: 0 24px; }
    .header { display: flex; justify-content: space-between; align-items: center; }
    .header button { background: #1a73e8; color: white; border: none; padding: 8px 16px; cursor: pointer; }
    .create-form { display: flex; gap: 8px; margin-bottom: 16px; }
    .create-form input { flex: 1; padding: 8px; }
    .create-form button { background: #1a73e8; color: white; border: none; padding: 8px 16px; cursor: pointer; }
    .project-card { border: 1px solid #ddd; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
    .project-card a { text-decoration: none; color: inherit; }
    .project-card h3 { margin: 0 0 4px; }
    .project-card p { margin: 0 0 4px; color: #666; }
  `]
})
export class ProjectListComponent implements OnInit {
  projects: ProjectResponse[] = [];
  showCreate = false;
  newName = '';
  newDescription = '';

  constructor(private projectService: ProjectService) {}

  ngOnInit() { this.load(); }

  load() {
    this.projectService.list().subscribe(p => this.projects = p);
  }

  create() {
    if (!this.newName.trim()) return;
    this.projectService.create(this.newName, this.newDescription).subscribe(() => {
      this.newName = '';
      this.newDescription = '';
      this.showCreate = false;
      this.load();
    });
  }
}
```

- [ ] **Step 5: Create project settings component (placeholder)**

```typescript
// frontend/src/app/features/projects/project-settings/project-settings.component.ts
import { Component } from '@angular/core';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';

@Component({
  selector: 'app-project-settings',
  standalone: true,
  imports: [NavbarComponent],
  template: `<app-navbar /><div class="container"><h2>Project Settings</h2><p>Coming soon.</p></div>`,
  styles: [`.container { max-width: 800px; margin: 24px auto; padding: 0 24px; }`]
})
export class ProjectSettingsComponent {}
```

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/core/api/ frontend/src/app/features/projects/ \
        frontend/src/app/shared/
git commit -m "feat: add project list, navbar, not-found, and project API service"
```

---

### Task 16: Angular Kanban Board

**Files:**
- Create: `frontend/src/app/core/api/column.service.ts`
- Create: `frontend/src/app/core/api/task.service.ts`
- Create: `frontend/src/app/core/api/comment.service.ts`
- Create: `frontend/src/app/features/board/board.component.ts`
- Create: `frontend/src/app/features/board/board-column/board-column.component.ts`
- Create: `frontend/src/app/features/board/task-card/task-card.component.ts`
- Create: `frontend/src/app/features/board/task-detail/task-detail.component.ts`
- Create: `frontend/src/app/shared/priority-badge/priority-badge.component.ts`

- [ ] **Step 1: Create column and task API services**

`column.service.ts`:
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BoardColumnResponse {
  id: number;
  projectId: number;
  name: string;
  position: number;
}

@Injectable({ providedIn: 'root' })
export class ColumnService {
  constructor(private http: HttpClient) {}

  list(projectId: number): Observable<BoardColumnResponse[]> {
    return this.http.get<BoardColumnResponse[]>(`/api/projects/${projectId}/columns`);
  }

  create(projectId: number, name: string): Observable<BoardColumnResponse> {
    return this.http.post<BoardColumnResponse>(`/api/projects/${projectId}/columns`, { name });
  }
}
```

`task.service.ts`:
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TaskResponse {
  id: number;
  title: string;
  description: string;
  columnId: number;
  assigneeId: number | null;
  assigneeName: string | null;
  priority: string;
  position: number;
  version: number;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  constructor(private http: HttpClient) {}

  create(projectId: number, columnId: number, body: any): Observable<TaskResponse> {
    return this.http.post<TaskResponse>(`/api/projects/${projectId}/columns/${columnId}/tasks`, body);
  }

  update(projectId: number, taskId: number, body: any): Observable<TaskResponse> {
    return this.http.put<TaskResponse>(`/api/projects/${projectId}/tasks/${taskId}`, body);
  }

  move(projectId: number, taskId: number, columnId: number, position: number, version: number): Observable<TaskResponse> {
    return this.http.patch<TaskResponse>(`/api/projects/${projectId}/tasks/${taskId}/move`, { columnId, position, version });
  }

  delete(projectId: number, taskId: number): Observable<void> {
    return this.http.delete<void>(`/api/projects/${projectId}/tasks/${taskId}`);
  }
}
```

`comment.service.ts`:
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CommentResponse {
  id: number;
  body: string;
  authorId: number;
  authorName: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class CommentService {
  constructor(private http: HttpClient) {}

  list(projectId: number, taskId: number, page = 0, size = 20): Observable<any> {
    return this.http.get(`/api/projects/${projectId}/tasks/${taskId}/comments?page=${page}&size=${size}`);
  }

  create(projectId: number, taskId: number, body: string): Observable<CommentResponse> {
    return this.http.post<CommentResponse>(`/api/projects/${projectId}/tasks/${taskId}/comments`, { body });
  }
}
```

- [ ] **Step 2: Create priority badge component**

```typescript
// frontend/src/app/shared/priority-badge/priority-badge.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-priority-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="badge" [ngClass]="priority">{{ priority }}</span>`,
  styles: [`
    .badge { font-size: 11px; padding: 2px 6px; border-radius: 4px; font-weight: 600; }
    .P0 { background: #dc3545; color: white; }
    .P1 { background: #fd7e14; color: white; }
    .P2 { background: #ffc107; color: black; }
    .P3 { background: #6c757d; color: white; }
    .P4 { background: #e9ecef; color: black; }
  `]
})
export class PriorityBadgeComponent {
  @Input() priority = 'P2';
}
```

- [ ] **Step 3: Create task card component**

```typescript
// frontend/src/app/features/board/task-card/task-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PriorityBadgeComponent } from '../../../shared/priority-badge/priority-badge.component';
import { TaskResponse } from '../../../core/api/task.service';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, PriorityBadgeComponent],
  template: `
    <div class="card" (click)="clicked.emit(task)">
      <div class="card-header">
        <app-priority-badge [priority]="task.priority" />
      </div>
      <h4>{{ task.title }}</h4>
      <div class="card-footer">
        <span *ngIf="task.assigneeName" class="assignee">{{ task.assigneeName }}</span>
        <span *ngIf="task.dueDate" class="due">{{ task.dueDate }}</span>
      </div>
    </div>
  `,
  styles: [`
    .card { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 12px; cursor: pointer; margin-bottom: 8px; }
    .card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h4 { margin: 8px 0 4px; font-size: 14px; }
    .card-footer { display: flex; justify-content: space-between; font-size: 12px; color: #666; }
    .assignee { background: #e8f0fe; padding: 2px 8px; border-radius: 12px; }
  `]
})
export class TaskCardComponent {
  @Input() task!: TaskResponse;
  @Output() clicked = new EventEmitter<TaskResponse>();
}
```

- [ ] **Step 4: Create board column component**

```typescript
// frontend/src/app/features/board/board-column/board-column.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { TaskCardComponent } from '../task-card/task-card.component';
import { TaskResponse } from '../../../core/api/task.service';

@Component({
  selector: 'app-board-column',
  standalone: true,
  imports: [CommonModule, DragDropModule, TaskCardComponent],
  template: `
    <div class="column">
      <h3>{{ name }}</h3>
      <div cdkDropList [cdkDropListData]="tasks" [id]="'col-' + columnId"
           [cdkDropListConnectedTo]="connectedLists"
           (cdkDropListDropped)="dropped.emit($event)" class="task-list">
        <div *ngFor="let task of tasks" cdkDrag [cdkDragData]="task">
          <app-task-card [task]="task" (clicked)="taskClicked.emit($event)" />
        </div>
      </div>
    </div>
  `,
  styles: [`
    .column { background: #f4f5f7; border-radius: 8px; padding: 12px; min-width: 280px; max-width: 280px; }
    h3 { margin: 0 0 12px; font-size: 14px; text-transform: uppercase; color: #5e6c84; }
    .task-list { min-height: 40px; }
  `]
})
export class BoardColumnComponent {
  @Input() columnId!: number;
  @Input() name!: string;
  @Input() tasks: TaskResponse[] = [];
  @Input() connectedLists: string[] = [];
  @Output() dropped = new EventEmitter<CdkDragDrop<TaskResponse[]>>();
  @Output() taskClicked = new EventEmitter<TaskResponse>();
}
```

- [ ] **Step 5: Create task detail modal component**

```typescript
// frontend/src/app/features/board/task-detail/task-detail.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PriorityBadgeComponent } from '../../../shared/priority-badge/priority-badge.component';
import { TaskResponse, TaskService } from '../../../core/api/task.service';
import { CommentService, CommentResponse } from '../../../core/api/comment.service';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, PriorityBadgeComponent],
  template: `
    <div class="overlay" (click)="close.emit()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ task.title }}</h3>
          <button class="close-btn" (click)="close.emit()">&times;</button>
        </div>
        <div class="modal-body">
          <app-priority-badge [priority]="task.priority" />
          <p *ngIf="task.description">{{ task.description }}</p>
          <p *ngIf="task.assigneeName"><strong>Assignee:</strong> {{ task.assigneeName }}</p>
          <p *ngIf="task.dueDate"><strong>Due:</strong> {{ task.dueDate }}</p>

          <h4>Comments</h4>
          <div *ngFor="let c of comments" class="comment">
            <strong>{{ c.authorName }}</strong>
            <p>{{ c.body }}</p>
            <small>{{ c.createdAt | date:'short' }}</small>
          </div>
          <div class="add-comment">
            <textarea [(ngModel)]="newComment" placeholder="Add a comment..."></textarea>
            <button (click)="addComment()">Post</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: white; border-radius: 12px; width: 500px; max-height: 80vh; overflow-y: auto; padding: 24px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; }
    .close-btn { background: none; border: none; font-size: 24px; cursor: pointer; }
    .comment { border-top: 1px solid #eee; padding: 8px 0; }
    .add-comment textarea { width: 100%; padding: 8px; box-sizing: border-box; min-height: 60px; }
    .add-comment button { margin-top: 8px; background: #1a73e8; color: white; border: none; padding: 8px 16px; cursor: pointer; }
  `]
})
export class TaskDetailComponent implements OnInit {
  @Input() task!: TaskResponse;
  @Input() projectId!: number;
  @Output() close = new EventEmitter<void>();

  comments: CommentResponse[] = [];
  newComment = '';

  constructor(private commentService: CommentService) {}

  ngOnInit() {
    this.commentService.list(this.projectId, this.task.id).subscribe(
      (page: any) => this.comments = page.content
    );
  }

  addComment() {
    if (!this.newComment.trim()) return;
    this.commentService.create(this.projectId, this.task.id, this.newComment).subscribe(c => {
      this.comments.unshift(c);
      this.newComment = '';
    });
  }
}
```

- [ ] **Step 6: Create main board component**

```typescript
// frontend/src/app/features/board/board.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { BoardColumnComponent } from './board-column/board-column.component';
import { TaskDetailComponent } from './task-detail/task-detail.component';
import { ColumnService, BoardColumnResponse } from '../../core/api/column.service';
import { TaskService, TaskResponse } from '../../core/api/task.service';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, NavbarComponent, BoardColumnComponent, TaskDetailComponent],
  template: `
    <app-navbar />
    <div class="board-container">
      <div class="board-header">
        <h2>Board</h2>
        <div class="add-task">
          <input [(ngModel)]="newTaskTitle" placeholder="New task title..." />
          <button (click)="createTask()" [disabled]="!newTaskTitle.trim()">Add Task</button>
        </div>
      </div>
      <div class="board">
        <app-board-column *ngFor="let col of columns"
          [columnId]="col.id"
          [name]="col.name"
          [tasks]="tasksByColumn[col.id] || []"
          [connectedLists]="connectedListIds"
          (dropped)="onDrop($event, col.id)"
          (taskClicked)="selectedTask = $event" />
      </div>
    </div>
    <app-task-detail *ngIf="selectedTask"
      [task]="selectedTask"
      [projectId]="projectId"
      (close)="selectedTask = null" />
  `,
  styles: [`
    .board-container { padding: 24px; }
    .board-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .add-task { display: flex; gap: 8px; }
    .add-task input { padding: 8px; width: 250px; }
    .add-task button { background: #1a73e8; color: white; border: none; padding: 8px 16px; cursor: pointer; }
    .board { display: flex; gap: 16px; overflow-x: auto; padding-bottom: 24px; }
  `]
})
export class BoardComponent implements OnInit {
  projectId!: number;
  columns: BoardColumnResponse[] = [];
  tasksByColumn: Record<number, TaskResponse[]> = {};
  connectedListIds: string[] = [];
  selectedTask: TaskResponse | null = null;
  newTaskTitle = '';

  constructor(
    private route: ActivatedRoute,
    private columnService: ColumnService,
    private taskService: TaskService
  ) {}

  ngOnInit() {
    this.projectId = +this.route.snapshot.paramMap.get('id')!;
    this.loadBoard();
  }

  loadBoard() {
    this.columnService.list(this.projectId).subscribe(columns => {
      this.columns = columns;
      this.connectedListIds = columns.map(c => 'col-' + c.id);
      // The columns endpoint returns columns; we need tasks per column
      // Load all tasks by fetching the board (columns already include task data via GET /columns)
      // For now, we need a way to get tasks. Let's use a simple approach:
      // The backend GET /api/projects/{id}/columns returns columns. Tasks are separate.
      // We'll need to load tasks per column or add a board endpoint.
      // Simple approach: load tasks for each column from the column list response
      this.tasksByColumn = {};
      // Note: The backend currently doesn't return tasks with columns.
      // We'll add this in a follow-up or use a dedicated board endpoint.
      // For now, initialize empty.
      columns.forEach(c => this.tasksByColumn[c.id] = []);
    });
  }

  createTask() {
    if (!this.columns.length || !this.newTaskTitle.trim()) return;
    const firstColumn = this.columns[0];
    this.taskService.create(this.projectId, firstColumn.id, {
      title: this.newTaskTitle,
      priority: 'P2'
    }).subscribe(task => {
      if (!this.tasksByColumn[firstColumn.id]) {
        this.tasksByColumn[firstColumn.id] = [];
      }
      this.tasksByColumn[firstColumn.id].push(task);
      this.newTaskTitle = '';
    });
  }

  onDrop(event: CdkDragDrop<TaskResponse[]>, targetColumnId: number) {
    const task: TaskResponse = event.item.data;
    const newPosition = event.currentIndex * 1000;

    this.taskService.move(this.projectId, task.id, targetColumnId, newPosition, task.version)
      .subscribe({
        next: (updated) => {
          // Remove from old column
          Object.values(this.tasksByColumn).forEach(tasks => {
            const idx = tasks.findIndex(t => t.id === task.id);
            if (idx >= 0) tasks.splice(idx, 1);
          });
          // Add to new column
          if (!this.tasksByColumn[targetColumnId]) {
            this.tasksByColumn[targetColumnId] = [];
          }
          this.tasksByColumn[targetColumnId].splice(event.currentIndex, 0, updated);
        },
        error: () => {
          // Conflict — reload board
          this.loadBoard();
        }
      });
  }
}
```

- [ ] **Step 7: Install Angular CDK**

```bash
cd frontend && npm install @angular/cdk
```

- [ ] **Step 8: Commit**

```bash
git add frontend/src/app/core/api/ frontend/src/app/features/board/ \
        frontend/src/app/shared/priority-badge/
git commit -m "feat: add kanban board with drag-and-drop, task cards, and detail modal"
```

---

### Task 17: Board Data Loading — Add Tasks to Column Response

The board needs to load all tasks for all columns in one request. Add a board endpoint that returns columns with their tasks.

**Files:**
- Modify: `src/main/java/com/kevinmcbeth/enterprise/service/BoardColumnService.java`
- Modify: `src/main/java/com/kevinmcbeth/enterprise/controller/BoardColumnController.java`
- Modify: `frontend/src/app/features/board/board.component.ts`

- [ ] **Step 1: Add board response DTO**

Create `src/main/java/com/kevinmcbeth/enterprise/dto/column/BoardResponse.java`:
```java
package com.kevinmcbeth.enterprise.dto.column;

import com.kevinmcbeth.enterprise.dto.task.TaskResponse;

import java.util.List;

public record BoardResponse(Long id, String name, Integer position, List<TaskResponse> tasks) {}
```

- [ ] **Step 2: Add getBoard method to BoardColumnService**

```java
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
                                .map(u -> u.getDisplayName()).orElse(null);
                    }
                    return new TaskResponse(task.getId(), task.getTitle(), task.getDescription(),
                            task.getColumnId(), task.getAssigneeId(), assigneeName,
                            task.getPriority(), task.getPosition(), task.getVersion(),
                            task.getDueDate(), task.getCreatedAt(), task.getUpdatedAt());
                }).toList();
        return new BoardResponse(col.getId(), col.getName(), col.getPosition(), tasks);
    }).toList();
}
```

Add `UserRepository` injection to `BoardColumnService` constructor.

- [ ] **Step 3: Add board endpoint to controller**

Add to `BoardColumnController`:
```java
@GetMapping("/board")
public List<BoardResponse> getBoard(@PathVariable Long projectId, HttpServletRequest request) {
    return boardColumnService.getBoard(projectId, getUserId(request));
}
```

Update the `@RequestMapping` to `/api/projects/{projectId}` and adjust column paths accordingly, or add a separate mapping.

- [ ] **Step 4: Update Angular board component to use board endpoint**

Update `loadBoard()` in `board.component.ts` to call `GET /api/projects/{id}/columns` which now includes tasks in the response, or add a separate board service call.

- [ ] **Step 5: Verify board loads with tasks**

Start the backend and frontend, navigate to a project board. Should see columns with seeded tasks.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add board endpoint returning columns with tasks"
```

---

### Task 18: Final Integration and Cleanup

**Files:**
- Modify: `frontend/src/app/app.component.ts`
- Modify: `frontend/src/app/app.config.ts`

- [ ] **Step 1: Configure app with HttpClient and interceptor**

```typescript
// frontend/src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
```

- [ ] **Step 2: Set up app component**

```typescript
// frontend/src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`
})
export class AppComponent {}
```

- [ ] **Step 3: Run all backend tests**

```bash
cd /home/kmcbeth/gt/enterprise_system/mayor/rig
./mvnw test -Dspring.profiles.active=test
```
Expected: All tests pass

- [ ] **Step 4: Start backend and frontend, verify end-to-end**

Terminal 1: `./mvnw spring-boot:run`
Terminal 2: `cd frontend && ng serve`

1. Navigate to `http://localhost:4200` — should redirect to `/login`
2. Sign up with email/password
3. Create a project — should see it in the list
4. Open the board — should see 3 columns with seeded tasks (if using demo data)
5. Drag a task between columns
6. Click a task to open the detail modal
7. Add a comment

- [ ] **Step 5: Push to GitHub**

```bash
git push origin main
```

- [ ] **Step 6: Commit any remaining changes**

```bash
git add -A
git commit -m "feat: complete kanban project management app integration"
```
