# Kanban Project/Task Management App — Design Spec

## Overview

A small-team project management application built around a kanban board workflow. Spring Boot 3 backend with Angular frontend in a monorepo. JWT authentication, role-based access control, and drag-and-drop task management.

## Target Users

Small teams (2-10 people) collaborating on projects with kanban-style task tracking.

## Tech Stack

- **Backend**: Spring Boot 3.4.4, Java 21, PostgreSQL, Spring Data JPA, Spring Security + JWT
- **Frontend**: Angular 17+ with Angular CDK DragDrop
- **Build**: Monorepo — Maven builds both via `frontend-maven-plugin`
- **Profiles**: dev (PostgreSQL, DDL update), test (H2, DDL create-drop), prod (PostgreSQL, DDL validate, env-based credentials)

## Data Model

### Users & Auth

**User**
| Field | Type | Constraints |
|-------|------|-------------|
| id | Long | PK, auto-generated |
| email | String | unique, not null |
| password | String | bcrypt hash, not null |
| displayName | String | not null |
| role | Enum | ADMIN, MEMBER |
| createdAt | Instant | not null, immutable |

**RefreshToken**
| Field | Type | Constraints |
|-------|------|-------------|
| id | Long | PK, auto-generated |
| token | String | unique, not null |
| userId | Long | FK -> User |
| expiresAt | Instant | not null |

### Projects & Boards

**Project**
| Field | Type | Constraints |
|-------|------|-------------|
| id | Long | PK, auto-generated |
| name | String | not null |
| description | String | nullable |
| ownerId | Long | FK -> User |
| createdAt | Instant | not null, immutable |

**ProjectMember**
| Field | Type | Constraints |
|-------|------|-------------|
| projectId | Long | FK -> Project, composite PK |
| userId | Long | FK -> User, composite PK |
| role | Enum | OWNER, MEMBER |

**Board**
| Field | Type | Constraints |
|-------|------|-------------|
| id | Long | PK, auto-generated |
| projectId | Long | FK -> Project |
| name | String | not null |

One board per project initially.

**BoardColumn**
| Field | Type | Constraints |
|-------|------|-------------|
| id | Long | PK, auto-generated |
| boardId | Long | FK -> Board |
| name | String | not null |
| position | Integer | not null (ordering) |

### Tasks

**Task**
| Field | Type | Constraints |
|-------|------|-------------|
| id | Long | PK, auto-generated |
| title | String | not null |
| description | String | nullable |
| columnId | Long | FK -> BoardColumn |
| assigneeId | Long | FK -> User, nullable |
| priority | Enum | P0, P1, P2, P3, P4 |
| position | Integer | not null (ordering within column) |
| dueDate | LocalDate | nullable |
| createdAt | Instant | not null, immutable |
| updatedAt | Instant | not null |

**TaskComment**
| Field | Type | Constraints |
|-------|------|-------------|
| id | Long | PK, auto-generated |
| taskId | Long | FK -> Task |
| authorId | Long | FK -> User |
| body | String | not null |
| createdAt | Instant | not null, immutable |

Moving a task = updating columnId + position. Reordering within a column = updating position.

## API Design

### Auth (public)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/signup` | Register (email, password, displayName) |
| POST | `/api/auth/login` | Returns JWT access + refresh token |
| POST | `/api/auth/refresh` | Exchange refresh token for new access token |

### Projects (authenticated)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/projects` | List user's projects |
| POST | `/api/projects` | Create project (auto-creates default board with 3 columns: To Do, In Progress, Done) |
| GET | `/api/projects/{id}` | Project details with members |
| PUT | `/api/projects/{id}` | Update project |
| DELETE | `/api/projects/{id}` | Delete project (owner only) |
| POST | `/api/projects/{id}/members` | Invite member by email |
| DELETE | `/api/projects/{id}/members/{userId}` | Remove member |

### Boards & Columns (authenticated, project member)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/projects/{projectId}/board` | Board with columns and tasks |
| POST | `/api/projects/{projectId}/board/columns` | Add column |
| PUT | `/api/board-columns/{id}` | Rename or reorder column |
| DELETE | `/api/board-columns/{id}` | Delete column (must be empty) |

### Tasks (authenticated, project member)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/board-columns/{columnId}/tasks` | Create task in column |
| PUT | `/api/tasks/{id}` | Update task fields |
| PATCH | `/api/tasks/{id}/move` | Move task (target columnId + position) |
| DELETE | `/api/tasks/{id}` | Delete task |
| GET | `/api/tasks/{id}/comments` | List comments |
| POST | `/api/tasks/{id}/comments` | Add comment |

### Authorization Rules

- All endpoints except `/api/auth/**` require valid JWT
- Project endpoints enforce project membership
- Delete/settings operations enforce owner role
- JWT validation errors return 401
- Permission errors return 403

## Angular Frontend

### Module Structure

- **AuthModule** — login/signup pages, JWT interceptor, auth guard
- **ProjectModule** — project list, project creation, member management
- **BoardModule** — kanban board view, drag-and-drop (Angular CDK DragDrop)
- **SharedModule** — navbar, avatar, priority badges

### Routes

| Path | View |
|------|------|
| `/login` | Login page |
| `/signup` | Signup page |
| `/projects` | Project list dashboard |
| `/projects/{id}/board` | Kanban board (main screen) |

### Kanban Board Behavior

- Columns rendered left-to-right
- Tasks as cards within each column
- Drag-and-drop cards between columns and reorder within columns (Angular CDK DragDrop)
- Card displays: title, assignee avatar, priority badge, due date
- Click card opens detail panel/modal for editing and comments

### Dev Workflow

- `ng serve` with proxy config pointing to `localhost:8081`
- `frontend-maven-plugin` runs `npm install` + `ng build` during Maven build
- Production build outputs to `src/main/resources/static/` for single JAR deployment

## Error Handling

- Global `@RestControllerAdvice` exception handler
- Consistent error response: `{ status, message, errors[] }`
- Custom exceptions: `ResourceNotFoundException`, `AccessDeniedException`, `BadRequestException`

## Testing

- **Backend unit tests**: Service layer with mocked repositories
- **Backend integration tests**: Controller tests with MockMvc, H2 in-memory DB for test profile
- **Frontend**: Default Angular test setup (Karma/Jasmine) for components and services

## Build Profiles

| Profile | Database | DDL | Credentials |
|---------|----------|-----|-------------|
| dev | PostgreSQL | update | application-dev.properties |
| test | H2 in-memory | create-drop | inline |
| prod | PostgreSQL | validate | environment variables |
