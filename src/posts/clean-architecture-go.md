---
title: How I Keep My Go Code Clean (Without Going Crazy) 🧹
publishedAt: 2023-10-15
summary: 'Learn how to structure your Go applications cleanly without over-engineering. Practical tips for services, repositories, and testing.'
---

Okay, let's be real for a sec. I used to be _that_ developer who tried to force Clean Architecture patterns into every Go project. Spoiler alert: it was a mess. 😅

After building way too many over-engineered APIs and getting weird looks from teammates, I finally figured out how to write Go code that's actually clean AND feels natural. Here's what I learned about structuring Go apps without losing my sanity.

## Why Clean Architecture Feels Weird in Go 🤔

Here's the thing: Uncle Bob's Clean Architecture is awesome, but it was designed for Java/C# folks who love their abstract factories and dependency injection containers. Go? Not so much.

**Go likes things flat** 📏 - All those rigid layers and circular dependencies make Go developers cry. We prefer simple, composable pieces.

**Interfaces everywhere = overkill** 🎭 - Go's implicit interfaces are magical, but Clean Architecture wants you to create interfaces for everything. Sometimes a simple function is better than an interface with one method!

**Error handling clash** ⚠️ - Go's explicit error returns don't play nice with the exception-heavy patterns you see in most Clean Architecture examples.

**Package conflicts** 📦 - Go's package system already gives us great organization. Adding more layers on top can make things confusing rather than clearer.

But hey! The _ideas_ behind Clean Architecture—keeping things separate, making code testable, not coupling everything together—those are gold in Go too. ✨

## My "Good Enough" Go Structure 🏗️

After trying every pattern under the sun, here's what actually works for me:

```
project/
├── cmd/
│   └── server/
│       └── main.go          # 🎯 Entry point
├── internal/
│   ├── domain/              # 📝 Your business stuff
│   │   ├── user.go
│   │   └── errors.go
│   ├── service/             # 🔧 Business logic lives here
│   │   └── user.go
│   ├── repository/          # 💾 Data access
│   │   ├── postgres/
│   │   └── memory/
│   └── transport/           # 🌐 HTTP/gRPC/CLI stuff
│       ├── http/
│       └── grpc/
├── pkg/                     # 📦 Reusable bits
└── go.mod
```

The secret sauce? **Services instead of "use cases"** and letting Go's packages do the heavy lifting. Way less ceremony, way more clarity! 🎉

## Domain Layer: Keep It Stupidly Simple 🧠

Your domain is where the important business stuff lives, but I keep it lightweight. No fancy constructors or complex validation—just the essentials:

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

See? No magic, no weird constructor patterns. Just a struct and a simple validation method. Go's zero values got our back! 💪

## Services: Where the Magic Happens ✨

Instead of confusing "use cases," I just call them services. They're basically structs with methods that do stuff—very Go-like!

```go
type UserService struct {
    repo   UserRepository
    logger *slog.Logger
}

func (s *UserService) CreateUser(ctx context.Context, email, name string) (*domain.User, error) {
    user := &domain.User{
        ID:        generateID(), // some UUID function
        Email:     email,
        Name:      name,
        CreatedAt: time.Now(),
    }

    if err := user.Validate(); err != nil {
        return nil, err // nope, try again
    }

    // Check if user already exists (nobody likes duplicates)
    if existing, _ := s.repo.GetByEmail(ctx, email); existing != nil {
        return nil, domain.ErrUserExists
    }

    return user, s.repo.Create(ctx, user)
}
```

This is where your business logic lives. It orchestrates everything but doesn't get bogged down in architectural ceremony. Simple! 🎯

## Repositories: Abstractions That Actually Make Sense 💾

Here's where I define my data interfaces. I put them right in the service package because that's where they're actually used:

```go
// Define interfaces where you use them, not in some abstract layer
type UserRepository interface {
    Create(ctx context.Context, user *domain.User) error
    GetByEmail(ctx context.Context, email string) (*domain.User, error)
    // Only the methods you actually need!
}
```

Then implement them wherever makes sense:

```go
// PostgreSQL implementation
type UserRepository struct {
    db *sql.DB
}

func (r *UserRepository) Create(ctx context.Context, user *domain.User) error {
    query := `INSERT INTO users (id, email, name, created_at) VALUES ($1, $2, $3, $4)`
    _, err := r.db.ExecContext(ctx, query, user.ID, user.Email, user.Name, user.CreatedAt)
    return err
}
```

For testing, I skip mocks entirely and use an in-memory version. Way easier to reason about! 🧠

```go
// Memory implementation for testing
type UserRepository struct {
    users map[string]*domain.User
    mu    sync.RWMutex
}

func (r *UserRepository) Create(ctx context.Context, user *domain.User) error {
    r.mu.Lock()
    defer r.mu.Unlock()
    r.users[user.ID] = user
    return nil
}
```

## Transport Layer: Keep Handlers Skinny 🚚

Your HTTP handlers (or gRPC, or CLI) should be super thin. They just translate between the outside world and your services:

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
        handleServiceError(w, err) // convert service errors to HTTP errors
        return
    }

    writeJSON(w, user, http.StatusCreated) // success! 🎉
}
```

See how thin that is? The handler just handles HTTP stuff, the service handles business stuff. Clean separation! ✨

## Wiring It Up: No Magic, Just Functions 🔌

Forget complex dependency injection frameworks. Just use functions and wire everything up in `main.go`:

```go
func main() {
    db := setupDatabase()      // connect to postgres
    logger := setupLogger()    // setup structured logging

    // Wire up the dependencies (no magic!)
    userRepo := postgres.NewUserRepository(db)
    userService := service.NewUserService(userRepo, logger)
    userHandler := http.NewUserHandler(userService)

    router := setupRoutes(userHandler)
    log.Fatal(http.ListenAndServe(":8080", router))
}
```

Explicit, easy to follow, and no framework to learn. This is the Go way! 🚀

## Testing: Where This Really Shines ✅

Honestly? This is why I structure my code this way. Testing becomes ridiculously easy:

```go
func TestUserService_CreateUser(t *testing.T) {
    // No mocking frameworks needed!
    repo := memory.NewUserRepository()
    logger := slog.New(slog.NewTextHandler(io.Discard, nil))
    service := service.NewUserService(repo, logger)

    user, err := service.CreateUser(context.Background(), "test@example.com", "John")

    assert.NoError(t, err)
    assert.Equal(t, "test@example.com", user.Email)
    // Test passes! 🎉
}
```

No complex mocking, no brittle test setup. Just swap in the memory implementation and you're good to go. Your future self will thank you! 😊

## When This Approach Works Best

This structure excels in several scenarios:

**Medium-Sized Applications**: More than a simple CRUD API but not a massive enterprise system. Think 5-50 endpoints with meaningful business logic.

**Team Projects**: Multiple developers can work without stepping on each other. Clear boundaries between transport, service, and repository layers.

**Evolving Requirements**: Business logic changes frequently, but core entities remain stable. The service layer adapbs without touching transport or repository code.

**Multiple Interfaces**: Need both REST API and CLI? Or REST and gRPC? Different transport implementations share the same service layer.

## What I Avoid

**Over-Abstraction**: If a piece of code only has one implementation and is unlikely to change, I don't abstract it. Interfaces in Go should represent behavior, not just enable testing.

**Deep Inheritance Hierarchies**: Go doesn't have inheritance, and that's a feature. I compose behaviors instead of trying to recreate OOP patterns.

**Generic Repositories**: Repository interfaces are specific to their domain. No `Repository<T>` generic types—they hide important domain concepts.

**Layered Packages**: I don't create separate packages for "interfaces" or "abstractions." Interfaces live with their consumers.

## Why This Beats "Pure" Clean Architecture in Go 🥊

My approach differs from textbook Clean Architecture in some key ways:

**Flexible boundaries** 🚪 - Instead of rigid layers that can never talk to each other, I have logical groups that can communicate when it makes sense.

**Interfaces where they belong** 🏠 - Interfaces live with the code that uses them, not in some abstract "interface layer."

**Go-style error handling** ⚠️ - Explicit error returns flow naturally through the layers. No weird exception abstractions!

**Simple beats pure** ✨ - When Go idioms conflict with architectural theory, I pick the Go way every time.

## Performance? Don't Worry About It 🚀

This structure has basically zero performance overhead:

- **No runtime reflection** - Simple constructor functions = zero runtime cost
- **Interface costs are tiny** - Go's interface dispatch is super fast, and usually negligible compared to database calls
- **Fewer allocations** - Struct-based services beat closure-heavy functional approaches

## Refactoring Existing Code? Take It Slow 🐌

When fixing existing spaghetti code:

1. **Start with repositories** - Extract database stuff first
2. **Group business logic** - Move related functions into service structs
3. **Thin your handlers** - Keep only HTTP concerns in HTTP handlers
4. **Add interfaces last** - Only when you actually need to swap implementations

Don't try to fix everything at once. Go compiles fast, so incremental changes are painless! 😌

## Wrapping Up 🎁

Look, Clean Architecture has great ideas, but trying to implement it exactly as written in Go is like wearing a suit to go swimming. It's technically possible, but why would you want to? 😅

By using services instead of use cases, keeping interfaces simple, and letting Go's package system do what it does best, you get apps that are:

- Easy to understand 🧠
- Simple to test ✅
- Actually fun to work with 🎉

The goal isn't architectural perfection—it's building software that you and your team can ship confidently. This approach has worked great for me across tons of Go projects, from tiny APIs to complex microservices.

Start simple, refactor when things hurt, and always pick clarity over cleverness. Your code should tell a story, not solve a puzzle! 📖

---

_Have you tried different patterns in Go? What worked for your team? Drop a comment below—I'd love to hear your war stories and wins! 💭_
