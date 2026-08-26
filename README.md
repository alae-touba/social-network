# Q&A Network

A question-and-answer social network where users can create and follow topics, ask questions inside them, answer questions, like answers, and browse other users' profiles.

Originally a university project built as a server-rendered Handlebars app, now refactored into a modern two-part architecture:

- **Angular SPA** (`client/`) - the entire user interface, consuming the API
- **Express JSON API** (`server/`) - authentication, business logic, PostgreSQL access (via Prisma); also serves the built SPA and uploaded images in production

## Features

- Register / log in / log out (session-based auth with bcrypt password hashing)
- Browse topics with live search, follow/unfollow topics
- Create topics (optional cover image upload)
- Ask questions in a topic, answer questions
- Like/unlike answers (with live counts)
- User profiles: asked questions, given answers, created topics, followed topics

## Architecture

```
┌───────────────┐   /api/*, /images/*    ┌────────────────┐   ┌───────────┐
│  Angular SPA  │ ─────────────────────► │  Express JSON  │──►│ PostgreSQL│
│  (client/)    │ ◄───────────────────── │  API (server/) │   └───────────┘
└───────────────┘   JSON + session cookie └────────────────┘
```

### Backend (`server/`)

```
server/
├── index.js                 # entrypoint: env → DB → HTTP server
├── app.js                   # express wiring: sessions, routes, SPA hosting, errors
├── config/
│   ├── env.js               # environment variables (with dev defaults)
│   ├── db.js                # shared Prisma client instance
│   └── passport.js          # local email/password strategy
├── prisma/
│   ├── schema.prisma        # tables: users, topics, questions, answers, follows, likes
│   └── migrations/          # generated SQL migrations (applied via `prisma migrate`)
├── scripts/seed.js          # imports database/*.json demo data into Postgres
├── routes/                  # one router per resource (/api/auth, /api/topics, ...)
├── controllers/             # request handlers, no framework concerns mixed in
└── middleware/
    ├── auth.js              # requireAuth (401 instead of redirect)
    ├── validate.js          # express-validator rules + id param check
    ├── upload.js            # multer image uploads (type & size limits)
    ├── serializers.js       # stable API response shapes, no sensitive fields
    └── errors.js            # HttpError helper used by the central error handler
```

### API overview

| Method | Route                    | Auth | Description                          |
| ------ | ------------------------ | ---- | ------------------------------------ |
| POST   | `/api/auth/register`     | -    | Create account (+ optional image)    |
| POST   | `/api/auth/login`        | -    | Log in                               |
| POST   | `/api/auth/logout`       | ✓    | Log out                              |
| GET    | `/api/auth/me`           | -    | Current session user (204 if none)   |
| GET    | `/api/topics?search=`    | -    | List/search topics                   |
| POST   | `/api/topics`            | ✓    | Create topic                         |
| GET    | `/api/topics/:id`        | -    | Topic detail + questions + sidebar   |
| POST   | `/api/topics/:id/follow` | ✓    | Toggle follow                        |
| POST   | `/api/topics/:id/questions` | ✓ | Ask a question                       |
| GET    | `/api/questions/:id`     | -    | Question + answers + related         |
| POST   | `/api/questions/:id/answers` | ✓ | Write an answer                    |
| POST   | `/api/answers/:id/like`  | ✓    | Toggle like                          |
| GET    | `/api/users/:id`         | -    | Public profile (never includes hashes)|

Errors are always JSON: `{ "message": "...", "details": [...] }` with proper status codes (400 validation, 401 unauthenticated, 404 missing/malformed ids, 409 duplicates).

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

During development the Angular dev server proxies `/api` and `/images` to the Express server (`client/proxy.conf.json`).

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

Requires Node.js >= 20 and a running PostgreSQL.

1. Install dependencies:

    ```bash
    npm run install:all
    ```

2. Start PostgreSQL on `localhost:5433` (or adjust `.env` - copy `.env.example` to `.env` first). For example:

    ```bash
    docker run -d --name qa-postgres -p 5433:5432 \
      -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=social_network_db postgres:17-alpine
    ```

3. Create the schema and load the demo data:

    ```bash
    cd server
    npm run migrate:dev     # or: npx prisma migrate deploy
    npm run seed
    ```

4. Run both processes:

    ```bash
    npm run dev:server    # terminal 1: API on http://localhost:3000
    npm run dev:client    # terminal 2: Angular dev server on http://localhost:4200
    ```

5. Open http://localhost:4200.

### Production build (no docker)

```bash
npm install && npm install --prefix client && npm install --prefix server
npm run build:client       # outputs client/dist/social-network/browser
npm start                  # serves SPA + API on http://localhost:3000
```

## Data model

Relational schema managed by Prisma (see `server/prisma/schema.prisma`). The many-to-many relations live in dedicated join tables whose composite primary keys make duplicate follows/likes impossible; all other relations are plain foreign keys.

```
users(id, firstName, lastName, email UNIQUE, password*, imageName, registrationDate)
topics(id, name UNIQUE, description, imageName, creationDate, userId -> users)
questions(id, content, creationDate, userId -> users, topicId -> topics)
answers(id, content, creationDate, userId -> users, questionId -> questions)
follows(userId -> users, topicId -> topics)      primary key (userId, topicId)
likes(userId -> users, answerId -> answers)     primary key (userId, answerId)
```

(*) Passwords are stored as bcrypt hashes and are never included in API responses.

The original MongoDB export in `database/*.json` is kept as the seed source: `npm run seed` imports it into Postgres.
