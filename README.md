# Q&A Network

A question-and-answer social network where users can create and follow topics, ask questions inside them, answer questions, like answers, and browse other users' profiles.

Originally a university project built as a server-rendered Handlebars app, now refactored into a modern two-part architecture:

- **Angular SPA** (`client/`) - the entire user interface, consuming the API
- **Spring Boot JSON API** (`server/`, Java 17 + Maven) - authentication (JWT), business logic, PostgreSQL access (JPA/Hibernate + Flyway); also serves the built SPA and uploaded images in production

## Features

- Register / log in / log out (JWT bearer tokens, bcrypt password hashing)
- Browse topics with live search, follow/unfollow topics
- Create topics (optional cover image upload)
- Ask questions in a topic, answer questions
- Like/unlike answers (with live counts)
- User profiles: asked questions, given answers, created topics, followed topics

## Architecture

```
┌───────────────┐   /api/*, /images/*      ┌─────────────────┐   ┌───────────┐
│  Angular SPA  │ ───────────────────────► │ Spring Boot API │──►│ PostgreSQL│
│  (client/)    │ ◄─────────────────────── │ (server/, Java) │   └───────────┘
└───────────────┘  JSON + Bearer JWT       └─────────────────┘
```

### Backend (`server/`)

Spring Boot 4, Maven build (`mvn spring-boot:run` / `mvn package`):

```
server/src/main/java/com/qanetwork/
├── config/          # AppProperties, SecurityConfig (JWT filter chain), WebConfig (static files + SPA hosting)
├── security/        # JwtService (issue/verify HS256 tokens), JwtAuthFilter
├── domain/          # JPA entities: User, Topic, Question, Answer, Follow, Like (+ Role enum)
├── repository/      # Spring Data repositories
├── dto/             # request/response records - stable JSON shapes for the SPA
├── service/         # business logic (auth, topics, questions, profile, uploads)
├── exception/       # ApiException + global JSON error handler
└── web/             # REST controllers under /api

server/src/main/resources/
├── application.yml  # configuration with dev defaults (env vars override)
└── db/migration/    # Flyway migrations: V1 schema, V2 user roles, V3 demo data
```

Authentication is stateless: `POST /api/auth/login` and `/register` return `{ token, user }`; the SPA stores the token and sends it as `Authorization: Bearer <token>`. Passwords are bcrypt-hashed and never leave the server. Users have a `role` column (`USER`; `ADMIN` exists for future moderation features but nothing requires it today).

### API overview

| Method | Route                    | Auth | Description                          |
| ------ | ------------------------ | ---- | ------------------------------------ |
| POST   | `/api/auth/register`     | -    | Create account (+ optional image), returns `{token,user}` |
| POST   | `/api/auth/login`        | -    | Log in, returns `{token,user}`       |
| GET    | `/api/auth/me`           | Bearer | Current user (204 when anonymous)  |
| GET    | `/api/topics?search=`    | -    | List/search topics                   |
| POST   | `/api/topics`            | ✓    | Create topic                         |
| GET    | `/api/topics/:id`        | -    | Topic detail + questions + sidebar   |
| POST   | `/api/topics/:id/follow` | ✓    | Toggle follow                        |
| POST   | `/api/topics/:id/questions` | ✓ | Ask a question                       |
| GET    | `/api/questions/:id`     | -    | Question + answers + related         |
| POST   | `/api/questions/:id/answers` | ✓ | Write an answer                    |
| POST   | `/api/answers/:id/like`  | ✓    | Toggle like                          |
| GET    | `/api/users/:id`         | -    | Public profile (never includes hashes)|

There is no logout endpoint: JWTs are stateless, so logging out simply discards the token client-side.

Errors are always JSON: `{ "message": "...", "details": [...] }` with proper status codes (400 validation, 401 unauthenticated, 404 missing ids, 409 duplicates).

### Frontend (`client/`)

Angular 20 standalone components with lazy-loaded routes:

```
client/src/app/
├── core/                    # models, AuthService, Topic/Question/Answer/User services, guards
├── shared/                  # safe-content pipe (sanitized HTML), loading spinner, 404 page
├── topics/                  # topic list (live search), topic detail (follow + ask), topic form
├── questions/               # question detail (answers + likes + answer form)
├── profile/                 # profile page with tabs
└── auth/                    # login & register pages
```

During development the Angular dev server proxies `/api` and `/images` to the Spring Boot server (`client/proxy.conf.json`).

## Running it

### With Docker (production-style, easiest)

```bash
docker compose up --build
```

Then open http://localhost:3000. Migrations and demo data are applied automatically on first start. Adminer (database browser) runs at http://localhost:8082 (system: PostgreSQL, server: `postgres`, user: `postgres`, password: `secret`).

Demo accounts (email / password):

- alae@gmail.com / alae
- hamza@gmail.com / hamza
- farid@gmail.com / farid

### Local development

Requires Node.js >= 20 (for the Angular CLI), Java 17+ and Maven, plus Docker for the database.

1. Install client dependencies:

    ```bash
    npm run install:all
    ```

2. Start the database:

    ```bash
    npm run db:init
    ```

    This runs a Postgres container ([docker-compose.dev.yaml](docker-compose.dev.yaml), data persisted in a named volume). The schema and demo data are created automatically the first time the API starts - Flyway applies the migrations in [server/src/main/resources/db/migration](server/src/main/resources/db/migration) on boot.

    Useful variants:

    ```bash
    npm run db:start     # just start/keep Postgres
    npm run db:stop      # stop it
    npm run db:reset     # wipe the volume and start over
    ```

3. Run both processes:

    ```bash
    npm run dev:server    # terminal 1: API on http://localhost:3000
    npm run dev:client    # terminal 2: Angular dev server on http://localhost:4200
    ```

4. Open http://localhost:4200.

#### Configuration

- `server/.env` (optional) - backend settings (`PORT`, `DATABASE_URL`, `JWT_SECRET`, ...), loaded by Spring Boot automatically; copy `server/.env.example`. Defaults match the dev compose file. Real environment variables take precedence.
- `.env` (repo root, optional) - overrides for the full-stack `docker compose up` (ports, passwords). Copy `.env.example`.
- During development you can browse the database with Adminer (part of the full-stack compose file) or any SQL client.

### Production build (no docker)

```bash
npm install --prefix client
npm run build:client       # outputs client/dist/social-network/browser
npm run build:server       # outputs server/target/qa-network-server.jar
npm start                  # serves SPA + API on http://localhost:3000
```

## Data model

Relational schema managed by Flyway migrations (see `server/src/main/resources/db/migration`). The many-to-many relations live in dedicated join tables whose composite primary keys make duplicate follows/likes impossible; all other relations are plain foreign keys.

```
users(id, firstName, lastName, email UNIQUE, password*, imageName, registrationDate, role)
topics(id, name UNIQUE, description, imageName, creationDate, userId -> users)
questions(id, content, creationDate, userId -> users, topicId -> topics)
answers(id, content, creationDate, userId -> users, questionId -> questions)
follows(userId -> users, topicId -> topics)      primary key (userId, topicId)
likes(userId -> users, answerId -> answers)     primary key (userId, answerId)
```

(*) Passwords are stored as bcrypt hashes and are never included in API responses.

The original MongoDB export in `database/*.json` is kept as provenance: it was converted into the `V3__seed_demo_data.sql` migration that seeds the demo content.
