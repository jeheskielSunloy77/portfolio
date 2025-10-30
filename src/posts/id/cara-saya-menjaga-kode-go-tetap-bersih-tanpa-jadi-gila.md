---
title: Cara Saya Menjaga Kode Go Tetap Bersih (Tanpa Jadi Gila) 🧹
publishedAt: 2025-03-02
description: Pendekatan praktis untuk menyusun aplikasi Go—pakai services, repository, dan interface di tempat yang masuk akal supaya kode tetap mudah dipahami dan diuji.
tags: ['go', 'design patterns', 'clean architecture']
keywords: 'golang architecture, go clean code, golang project structure, go services pattern, golang repositories, go best practices, golang testing, go code organization, clean architecture go, golang design patterns'
readTime: 9
lang: id
---

Dulu saya sering mencoba memaksakan "Clean Architecture" ke setiap proyek Go. Hasilnya: over-engineered, susah dipelihara, dan banyak headache.

Seiring waktu saya menyusun gaya yang lebih cocok dengan idiom Go: sederhana, eksplisit, dan praktis. Intinya: pakai clarity over ceremony — letakkan interface di tempat yang dipakai, gunakan service untuk logika bisnis, dan biarkan package Go menyusun batas-batasnya.

## Kenapa Clean Architecture kadang terasa berlebihan di Go

- Bahasa seperti Java/C# punya DI container dan pola yang cocok untuk lapisan kaku. Go tidak.
- Interface untuk segalanya sering jadi berlebihan.
- Error handling eksplisit di Go tidak cocok dengan pola exception-heavy.
- Menumpuk paket "abstrak" bisa membuat struktur lebih rumit daripada membantu.

Namun prinsip dasarnya tetap berharga: pisahkan concern, buat kode dapat diuji, dan hindari coupling berlebih.

## Struktur proyek yang saya pakai

```
project/
├── cmd/
│   └── server/
│       └── main.go          # Entry point
├── internal/
│   ├── domain/              # Business stuff kamu
│   │   ├── user.go
│   │   └── errors.go
│   ├── service/             # Business logic tinggal di sini
│   │   └── user.go
│   ├── repository/          # Data access
│   │   ├── postgres/
│   │   └── memory/
│   └── transport/           # HTTP/gRPC/CLI stuff
│       ├── http/
│       └── grpc/
├── pkg/                     # Bagian yang dapat digunakan ulang
└── go.mod
```

Fokusnya: services alih-alih "use cases", dan interface didefinisikan dekat tempat yang menggunakannya.

## Domain: keep it simple

Domain tipe cukup ringan — struct dan beberapa method validasi:

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

Tidak perlu constructor kompleks kalau tidak ada manfaatnya.

## Services: tempat logika bisnis hidup

Services mengorkestrasi domain dan repository:

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

Services mudah diuji karena dependensi bisa diganti dengan implementasi in-memory.

## Repository: interface di tempat yang masuk akal

Definisikan interface dekat consumer-nya:

```go
type UserRepository interface {
    Create(ctx context.Context, user *domain.User) error
    GetByEmail(ctx context.Context, email string) (*domain.User, error)
}
```

Implementasi Postgres atau memory tinggal dibuat terpisah.

## Handler: keep it thin

Handler HTTP hanya menerjemahkan request/response ke service:

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

Memisahkan concern membuat kode lebih mudah dirawat.

## Wiring: eksplisit, tanpa magic

Wiring dependency di main.go dengan fungsi sederhana:

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

Langsung dan mudah ditelusuri saat debugging.

## Testing: keuntungan nyata

Dengan implementasi in-memory, test jadi simpel:

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

Tidak perlu framework mocking rumit.

## Kapan cara ini cocok

- Aplikasi medium (5–50 endpoint)
- Tim yang butuh jelas boundary antara transport/service/repository
- Project yang berkembang tapi entitas intinya stabil

## Hal yang saya hindari

- Abstraksi berlebihan tanpa kebutuhan nyata
- Menyimpan interface di paket terpisah yang sulit diikuti
- Membuat lapisan hanya demi mengikuti diagram arsitektur

## Intinya

Clean Architecture punya ide bagus, tapi di Go pragmatisme menang. Buat batas yang jelas, tempatkan interface di dekat konsumen, dan pilih kesederhanaan daripada kepintaran. Kode yang jelas lebih mudah dimodifikasi, diuji, dan dipahami oleh tim.

Mulai sederhana, refactor ketika perlu, dan selalu utamakan kejelasan. Kode kamu harus menceritakan apa yang dilakukan aplikasi, bukan memaksa pembaca memecahkan teka-teki.
