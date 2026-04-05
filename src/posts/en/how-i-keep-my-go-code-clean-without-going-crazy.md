---
title: How I Keep My Go Code Clean (Without Going Crazy) 🧹
publishedAt: 2025-03-02
description: I stopped forcing textbook Clean Architecture into Go projects and started using a simpler structure built around services, focused interfaces, and explicit wiring. The code got easier to test and much easier to maintain.
tags: ['go', 'design patterns', 'clean architecture']
keywords: 'golang architecture, go clean code, golang project structure, go services pattern, golang repositories, go best practices, golang testing, go code organization, clean architecture go, golang design patterns'
readTime: 9
lang: en
key: go-clean-code
---

I like clean code. I do not like architecture cosplay.

For a while, I tried to force every Go project through a version of Clean Architecture that looked great on whiteboards and felt awkward everywhere else. Too many layers. Too many abstractions. Too many packages created to satisfy a diagram instead of a codebase.

The result was predictable: slower development, weaker readability, and code that looked "enterprise" long before it earned the right.

These days my rule is simpler. In Go, structure should make the code easier to follow on a tired Tuesday afternoon. If it does not, I am not interested.

## What goes wrong when people over-apply Clean Architecture

The original ideas behind Clean Architecture are fine. Separation of concerns matters. Testability matters. Decoupling matters.

What people often copy is not the principle. It is the ceremony.

That is where Go pushes back.

- Go likes explicit wiring.
- Go rewards small packages with obvious responsibilities.
- Go does not need interfaces for every dependency in sight.
- Go becomes harder to read when every concept gets split across three layers and five files.

I have seen codebases where "clean" meant a handler calling a use case calling a service calling a repository through interfaces defined nowhere near their consumers. At that point the code is not flexible. It is padded.

## The structure I keep coming back to

I prefer a layout that reflects how the application actually behaves:

```text
project/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── domain/
│   ├── service/
│   ├── repository/
│   └── transport/
└── go.mod
```

This is not sacred. It is just honest.

Domain types hold the business language. Services coordinate work. Repositories deal with persistence. Transport adapts the outside world to the inside world. `main.go` wires the whole thing together in plain sight.

That gets me most of the benefits people want from "architecture" without burying the code under ceremony.

## I keep the domain boring on purpose

Boring domain code is a compliment.

```go
type User struct {
    ID        string
    Email     string
    Name      string
    CreatedAt time.Time
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

I do not need clever constructors, hidden mutation rules, or a maze of patterns to represent a user. I need a shape that is obvious and validation that is easy to trust.

## Services are where the real decisions live

I like services because they make the business rules visible.

```go
type UserService struct {
    repo UserRepository
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

Handlers should not own this logic. Repositories should not own this logic. A service is a good place for orchestration because the application rules remain easy to find and easy to test.

## I define interfaces where they are consumed

This is one of the most useful Go habits I picked up.

```go
type UserRepository interface {
    Create(ctx context.Context, user *domain.User) error
    GetByEmail(ctx context.Context, email string) (*domain.User, error)
}
```

I do not create a global `interfaces` package and call it architecture. If a service depends on a repository contract, that contract should usually live close to the service. The consumer defines the seam.

That keeps abstractions tight and prevents the codebase from turning into a scavenger hunt.

## Transport should stay thin

HTTP and gRPC layers should translate, not think.

```go
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

When handlers stay thin, changing transport details does not spill all over the business logic. It also makes the project easier to extend if I later add gRPC, a CLI, or background jobs.

## Explicit wiring is a feature, not a missing framework

I wire dependencies in `main.go` with regular code.

```go
func main() {
    db := setupDatabase()

    userRepo := postgres.NewUserRepository(db)
    userService := service.NewUserService(userRepo)
    userHandler := http.NewUserHandler(userService)

    router := setupRoutes(userHandler)
    log.Fatal(http.ListenAndServe(":8080", router))
}
```

I want to see how the application is assembled. Hidden dependency graphs do not impress me. They make debugging worse.

## Why this structure keeps paying off

The biggest payoff is not purity. It is speed with confidence.

I can test services with an in-memory repository. I can trace request flow without opening twelve files. I can explain the codebase to another engineer without drawing a multi-layer diagram first.

That is what good structure buys you. Not prestige. Not pattern points. Clarity under pressure.

## What I avoid now

- Generic repositories that abstract the database into mush
- Interfaces created "just in case"
- Deep layers with vague names like `usecase`, `manager`, or `processor`
- Clever indirection that hides plain business rules

If a pattern does not make the next engineer faster, it is probably decoration.

## My rule of thumb

Go does not need less design. It needs more honest design.

I still care about boundaries, testing, and maintainability. I just do not confuse those goals with abstraction density. If the code reads clearly, wires cleanly, and bends without drama, that is usually enough.

Most Go projects get better when you stop trying to make them look important and start trying to make them obvious.
