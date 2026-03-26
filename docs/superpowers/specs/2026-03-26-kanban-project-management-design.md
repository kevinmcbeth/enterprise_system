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

Refresh tokens are rotated on use: issuing a new access token invalidates the old refresh token and returns a new one. A scheduled job purges expired tokens daily.

### Projects & Boards

**Project**
| Field | Type | Constraints |
|-------|------|-------------|
| id | Long | PK, auto-generated |
| name | String | not null |
| description | String | nullable |
| createdAt | Instant | not null, immutable |
| updatedAt | Instant | not null |

**ProjectMember**
| Field | Type | Constraints |
|-------|------|-------------|
| projectId | Long | FK -> Project, composite PK |
| userId | Long | FK -> User, composite PK |
| role | Enum | OWNER, MEMBER |

Ownership is determined solely by `ProjectMember.role = OWNER`. There is no separate `ownerId` on Project — this avoids dual-source-of-truth drift.

**BoardColumn**
| Field | Type | Constraints |
|-------|------|-------------|
| id | Long | PK, auto-generated |
| projectId | Long | FK -> Project |
| name | String | not null |
| position | Integer | not null (ordering) |

Board is implicit — each project has columns directly. One logical board per project. If multi-board support is needed later, a Board entity can be introduced between Project and BoardColumn.

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
| position | Integer | not null (ordering within column, gapped by 1000) |
| version | Long | @Version, optimistic locking |
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

### Concurrency Strategy

Task positions use gapped integers (increments of 1000). Moving a task sets its position to the midpoint between its neighbors. When gaps become too small (< 1), rebalance all positions in the column within a transaction.

Tasks have a `version` field with JPA `@Version` for optimistic locking. If a concurrent move conflicts, the backend returns HTTP 409 and the frontend reloads the board state.

### Cascade Delete Rules

- **Delete Project**: cascades to ProjectMember, BoardColumn, Task (and their TaskComments)
- **Delete BoardColumn**: blocked if column contains tasks (400 Bad Request). "Empty" means zero tasks.
- **Delete Task**: cascades to TaskComments

Implemented via JPA `CascadeType.ALL` + `orphanRemoval` on parent-child relationships where cascading applies, and explicit validation where deletes are blocked.

## API Design

### Auth (public)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/signup` | Register (email, password, displayName). Duplicate email returns 409. |
| POST | `/api/auth/login` | Returns JWT access token + refresh token |
| POST | `/api/auth/refresh` | Rotates refresh token, returns new access + refresh token |
| POST | `/api/auth/logout` | Invalidates refresh token |

**Token lifetimes**: Access token 15 minutes, refresh token 7 days.

### Projects (authenticated)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/projects` | List user's projects (paginated) |
| POST | `/api/projects` | Create project (auto-creates 3 columns: To Do, In Progress, Done) |
| GET | `/api/projects/{id}` | Project details with members |
| PUT | `/api/projects/{id}` | Update project (member) |
| DELETE | `/api/projects/{id}` | Delete project with cascades (owner only) |
| POST | `/api/projects/{id}/members` | Invite member by email |
| DELETE | `/api/projects/{id}/members/{userId}` | Remove member (owner only) |

### Columns (authenticated, project member)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/projects/{projectId}/columns` | List columns with tasks |
| POST | `/api/projects/{projectId}/columns` | Add column |
| PUT | `/api/projects/{projectId}/columns/{id}` | Rename or reorder column |
| DELETE | `/api/projects/{projectId}/columns/{id}` | Delete column (must be empty) |

### Tasks (authenticated, project member)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/projects/{projectId}/columns/{columnId}/tasks` | Create task in column |
| PUT | `/api/projects/{projectId}/tasks/{id}` | Update task fields |
| PATCH | `/api/projects/{projectId}/tasks/{id}/move` | Move task (target columnId + position). Returns 409 on version conflict. |
| DELETE | `/api/projects/{projectId}/tasks/{id}` | Delete task with cascading comments |
| GET | `/api/projects/{projectId}/tasks/{id}/comments` | List comments (paginated) |
| POST | `/api/projects/{projectId}/tasks/{id}/comments` | Add comment |

All task/column endpoints are nested under `/api/projects/{projectId}/` so authorization can resolve project membership consistently from the path.

### Authorization Rules

- All endpoints except `/api/auth/**` require valid JWT
- Project endpoints enforce project membership via `projectId` in path
- Delete project and remove member enforce `ProjectMember.role = OWNER`
- JWT validation errors return 401
- Permission errors return 403

## Angular Frontend

### Module Structure

- **AuthModule** — login/signup pages, JWT interceptor, auth guard
- **ProjectModule** — project list, project creation, settings/member management
- **BoardModule** — kanban board view, drag-and-drop (Angular CDK DragDrop), task detail modal
- **SharedModule** — navbar, avatar, priority badges

### Routes

| Path | View |
|------|------|
| `/` | Redirect to `/projects` (or `/login` if unauthenticated) |
| `/login` | Login page |
| `/signup` | Signup page |
| `/projects` | Project list dashboard |
| `/projects/{id}/board` | Kanban board (main screen) |
| `/projects/{id}/settings` | Project settings and member management |
| `**` | 404 not found page |

### Kanban Board Behavior

- Columns rendered left-to-right
- Tasks as cards within each column
- Drag-and-drop cards between columns and reorder within columns (Angular CDK DragDrop)
- Card displays: title, assignee avatar, priority badge, due date
- Click card opens detail modal overlay (stays on board route) for editing and comments
- On 409 conflict from a move, reload board state and show brief notification

### Dev Workflow

- `ng serve` with proxy config pointing to `localhost:8081`
- `frontend-maven-plugin` runs `npm install` + `ng build` during Maven build
- Production build outputs to `src/main/resources/static/` for single JAR deployment

## Error Handling

- Global `@RestControllerAdvice` exception handler
- Consistent error response: `{ status, message, errors[] }`
- Custom exceptions: `ResourceNotFoundException`, `AccessDeniedException`, `BadRequestException`, `ConflictException`
- Duplicate email on signup returns 409 with user-friendly message
- Optimistic lock failure on task move returns 409

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

## Known Limitations & Future Enhancements

- **No real-time updates**: Board does not auto-refresh when other users make changes. WebSocket/SSE can be added later.
- **No cross-project task views**: No "my tasks" dashboard across all projects. Can be added as a read-only aggregation endpoint.
- **No audit trail**: Task moves and assignment changes are not logged. A TaskActivity table can be added later.
- **Hard deletes only**: No soft delete / recoverability. Can be added with a `deletedAt` timestamp if needed.
