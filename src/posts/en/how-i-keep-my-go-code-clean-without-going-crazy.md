---
title: How I Keep My Go Code Clean (Without Going Crazy) 🧹
publishedAt: 2025-03-02
description: Learn how to structure Go applications with clean, practical patterns that fit the language. I explain a pragmatic approach—services, repositories, and simple interfaces—that keeps code maintainable without over-engineering.
tags: ['go', 'design patterns', 'clean architecture']
keywords: 'golang architecture, go clean code, golang project structure, go services pattern, golang repositories, go best practices, golang testing, go code organization, clean architecture go, golang design patterns'
readTime: 9
lang: en
key: go-clean-code
---

I used to be the person who tried to bend "Clean Architecture" into every Go project. It rarely helped. After a few over-engineered APIs and some raised eyebrows, I found a simpler, more Go-friendly way to keep things tidy and testable.

The core idea is: prefer clarity over ceremony. Keep packages straightforward, put interfaces where they're actually used, and use small, focused services for business logic. Below is what worked for me in real projects.

## Why classic Clean Architecture feels off in Go

Uncle Bob's patterns shine in languages with heavy DI frameworks and lots of abstractions. Go prefers flatter, simpler code:

- Go likes plain packages and direct wiring; deep layering adds noise.
- Creating interfaces for everything is usually overkill.
- Go's explicit error handling clashes with exception-heavy examples in most Clean Architecture write-ups.
- Adding extra "interface" packages often fragments the codebase rather than improving it.

That said, the principles behind Clean Architecture—separation of concerns, testability, and decoupling—are still valuable. They just need a lighter, Go-centric application.

## A practical project layout that works

Here's a layout I use that keeps things organized without unnecessary complexity:

```
project/
├── cmd/
│   └── server/
│       └── main.go          # Entry point
├── internal/
│   ├── domain/              # Your business stuff
│   │   ├── user.go
│   │   └── errors.go
│   ├── service/             # Business logic lives here
│   │   └── user.go
│   ├── repository/          # Data access
│   │   ├── postgres/
│   │   └── memory/
│   └── transport/           # HTTP/gRPC/CLI stuff
│       ├── http/
│       └── grpc/
├── pkg/                     # Reusable bits
└── go.mod
```

The difference: I favor "services" over abstract "use cases" and let Go packages express boundaries naturally.

## Keep the domain small and clear

Domain types should be plain and easy to reason about:

```go
type User struct {
    ID        string    `json:"id"`
    Email     string    `json:"email"`
    Name      string    `json:"name"`
    CreatedAt time.Time `json:"created_at"`
}

func (u *User) Validate() error {
    if u.Email == "" {
        return ErrInvalidEmail
    }
    if u.Name == "" {
        return ErrInvalidName
    }
    return nil
}
```

No magic constructors, no unnecessary patterns—just a clear data shape and straightforward validation.

## Services: where business logic lives

Services coordinate domain logic and repositories. They keep complexity out of handlers:

```go
type UserService struct {
    repo   UserRepository
    logger *slog.Logger
}

func (s *UserService) CreateUser(ctx context.Context, email, name string) (*domain.User, error) {
    user := &domain.User{
        ID:        generateID(),
        Email:     email,
        Name:      name,
        CreatedAt: time.Now(),
    }

    if err := user.Validate(); err != nil {
        return nil, err
    }

    if existing, _ := s.repo.GetByEmail(ctx, email); existing != nil {
        return nil, domain.ErrUserExists
    }

    return user, s.repo.Create(ctx, user)
}
```

Services are easy to test and reason about, and they match Go's straightforward style.

## Repositories: interfaces where they make sense

Define repository interfaces close to their consumers—usually in the same package as the service that uses them:

```go
type UserRepository interface {
    Create(ctx context.Context, user *domain.User) error
    GetByEmail(ctx context.Context, email string) (*domain.User, error)
}
```

Implementations (Postgres, in-memory for tests, etc.) live where they belong.

## Thin transport layer

Keep HTTP or gRPC handlers minimal—just translate requests to service calls and format responses:

```go
type UserHandler struct {
    service *service.UserService
}

func (h *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
    var req CreateUserRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        writeError(w, "invalid JSON", http.StatusBadRequest)
        return
    }

    user, err := h.service.CreateUser(r.Context(), req.Email, req.Name)
    if err != nil {
        handleServiceError(w, err)
        return
    }

    writeJSON(w, user, http.StatusCreated)
}
```

Thin handlers make refactoring easier and keep transport concerns separate from business logic.

## Wiring: explicit and simple

I wire dependencies in main with plain functions—no DI container surprises:

```go
func main() {
    db := setupDatabase()
    logger := setupLogger()

    userRepo := postgres.NewUserRepository(db)
    userService := service.NewUserService(userRepo, logger)
    userHandler := http.NewUserHandler(userService)

    router := setupRoutes(userHandler)
    log.Fatal(http.ListenAndServe(":8080", router))
}
```

Explicit wiring is easy to follow and debug.

## Testing is the payoff

One big win from this structure: tests are straightforward. Swap in an in-memory repository and run service tests without mocks:

```go
func TestUserService_CreateUser(t *testing.T) {
    repo := memory.NewUserRepository()
    logger := slog.New(slog.NewTextHandler(io.Discard, nil))
    service := service.NewUserService(repo, logger)

    user, err := service.CreateUser(context.Background(), "test@example.com", "John")

    assert.NoError(t, err)
    assert.Equal(t, "test@example.com", user.Email)
}
```

No heavy mocking frameworks, simple setups, reliable tests.

## When this approach fits best

- Medium-sized APIs (5–50 endpoints)
- Team projects where clarity matters
- Projects that may need multiple transports (REST, gRPC, CLI)
- Codebases that evolve frequently

## What I avoid

- Over-abstraction and generic repositories
- Moving interfaces into separate "interface" packages
- Deep layering that hides intent

## Final note

Clean Architecture brings good ideas, but in Go the goal is pragmatic clarity. Prefer simple packages, interfaces where they’re useful, and services that do the orchestration. Your code should be readable and testable—prefer that over purist architectures.

---

Have you tried different Go structures in your projects? What patterns worked or failed for your team? I'd love to hear about your experiences.
