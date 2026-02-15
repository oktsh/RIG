# RIG — Corporate Knowledge Base for AI-Assisted Development

> Internal platform for vibe-coding teams: prompts, guides, context rules, agents.

---

## Role & Mindset

You are a **senior fullstack engineer with CPO/CTO vision**. You:

- Think in product outcomes, not just code tasks
- Consider UX impact, data model implications, and scalability of every change
- Write production-grade code: typed, tested, secure
- Follow existing patterns — don't invent new abstractions unless the current ones are insufficient
- Keep the neo-brutalist design language consistent across all new UI
- All user-facing text is in **Russian** unless explicitly told otherwise
- Prefer small, focused commits with clear intent

---

## Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js (App Router) | 15 |
| UI | React | 19 |
| Language | TypeScript | 5 |
| Styling | Tailwind CSS | 3 |
| Backend | FastAPI | 0.115+ |
| ORM | SQLAlchemy | 2.0 |
| Migrations | Alembic | 1.14+ |
| Database | SQLite (dev), PostgreSQL (prod-ready) | — |
| Auth | HMAC-SHA256 JWT + PBKDF2 | — |
| Fonts | Space Grotesk (display), Manrope (body), IBM Plex Mono (code) | — |

Key frontend deps: `clsx`, `tailwind-merge`, `gray-matter`
Key backend deps: `uvicorn`, `pydantic>=2.0`, `python-dotenv`, `httpx` (tests)

---

## Commands

```bash
# Frontend (from /frontend)
npm run dev          # Dev server → localhost:3000
npm run build        # Production build (use to verify no type errors)
npm run lint         # ESLint check

# Backend (from /backend)
uvicorn app.main:app --reload          # API → localhost:8000
python -m pytest tests/ -v             # Run all tests
python -m alembic upgrade head         # Apply migrations
python -m alembic revision --autogenerate -m "description"  # Create migration

# First backend startup auto-seeds: admin@rig.ai / admin123
```

---

## Project Structure

```
RIG/
├── CLAUDE.md                           # This file — project rules for AI
│
├── frontend/                           # Next.js 15
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx              # Root: fonts, AuthProvider
│   │   │   ├── globals.css
│   │   │   ├── error.tsx, not-found.tsx
│   │   │   │
│   │   │   ├── (public)/              # Public shell (Sidebar + Header via AppShell)
│   │   │   │   ├── layout.tsx          #   ModalProvider + AppShell wrapper
│   │   │   │   ├── page.tsx            #   Home (Hero, StarterKit, QuickAccess)
│   │   │   │   ├── dashboard/          #   Dashboard
│   │   │   │   ├── prompts/            #   Prompts list (search + pagination)
│   │   │   │   ├── guides/             #   Guides list + /guides/[id] detail
│   │   │   │   ├── rules-agents/       #   Rulesets + Agents
│   │   │   │   └── content/            #   My publications
│   │   │   │
│   │   │   ├── (auth)/login/           # Login page
│   │   │   │
│   │   │   ├── admin/                  # Admin area (AdminSidebar layout)
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── users/              #   User CRUD (ADMIN only)
│   │   │   │   └── moderation/         #   Content moderation (ADMIN + MODERATOR)
│   │   │   │
│   │   │   └── api/proposals/route.ts  # Next.js API route (proxy)
│   │   │
│   │   ├── components/
│   │   │   ├── layout/                 # AppShell, Sidebar, Header, AdminSidebar
│   │   │   ├── ui/                     # Button, Card, Tag, Modal, Pagination, StatusBadge, CopyButton
│   │   │   ├── modals/                 # ModalProvider, PromptModal, JoinModal, SuccessModal
│   │   │   ├── auth/                   # AuthProvider (context), ProtectedRoute
│   │   │   ├── home/                   # HeroSection, StarterKitCard, QuickAccessGrid
│   │   │   ├── dashboard/              # ActionCard, TeamTaskCard, EventCard
│   │   │   ├── prompts/                # PromptCard, CategoryFilter
│   │   │   ├── guides/                 # GuideListItem
│   │   │   ├── rules-agents/           # RulesetCard, AgentListItem
│   │   │   ├── content/                # StatsBar, ContentCard, ContentFilter, CreateContentModal
│   │   │   └── admin/                  # UserTable, ModerationCard
│   │   │
│   │   ├── data/                       # Static fallback data (prompts, guides, agents, rulesets, events, users, navigation, contents)
│   │   ├── types/index.ts              # All TS interfaces (Prompt, Guide, Agent, Ruleset, User, PaginatedResponse, etc.)
│   │   └── lib/
│   │       ├── api.ts                  # Fetch wrapper — all API calls centralized here
│   │       ├── useApi.ts               # Generic hook for API calls
│   │       ├── useDebounce.ts          # Debounce hook for search
│   │       └── utils.ts                # cn() — clsx + tailwind-merge
│   │
│   ├── tailwind.config.ts              # Neo-brutalist theme tokens
│   ├── package.json
│   └── .env.local                      # NEXT_PUBLIC_API_URL=http://localhost:8000
│
├── backend/                            # FastAPI
│   ├── app/
│   │   ├── main.py                     # App entry, CORS, lifespan (create tables + seed)
│   │   ├── config.py                   # Settings from .env
│   │   ├── database.py                 # Engine + SessionLocal + Base + get_db()
│   │   │
│   │   ├── models/
│   │   │   ├── db.py                   # ORM: User, Prompt, Guide, Agent, Ruleset, Proposal
│   │   │   └── schemas.py             # Pydantic: request/response + paginated wrappers
│   │   │
│   │   ├── routers/                    # One file per resource
│   │   │   ├── auth.py                 #   POST /login, GET /me
│   │   │   ├── users.py                #   CRUD (admin only)
│   │   │   ├── prompts.py              #   CRUD + /moderation/pending + /{id}/status
│   │   │   ├── guides.py               #   CRUD + /moderation/pending + /{id}/status
│   │   │   ├── agents.py               #   GET list
│   │   │   ├── rulesets.py             #   GET list
│   │   │   └── proposals.py            #   POST (public) + GET + PATCH status
│   │   │
│   │   ├── services/
│   │   │   ├── auth.py                 # hash_password, verify_password, create/decode JWT
│   │   │   └── seed.py                 # Idempotent seed: admin + sample content
│   │   │
│   │   ├── middleware/
│   │   │   └── auth.py                 # get_current_user(), require_role()
│   │   │
│   │   └── utils/
│   │       └── pagination.py           # paginate(query, page, limit) helper
│   │
│   ├── tests/
│   │   ├── conftest.py                 # In-memory SQLite, test users + tokens
│   │   ├── test_auth.py
│   │   ├── test_prompts.py
│   │   ├── test_proposals.py
│   │   ├── test_users.py
│   │   └── test_api.py
│   │
│   ├── alembic/                        # Migration scripts
│   │   └── versions/                   # 187a74dce15e_initial_schema.py
│   │
│   ├── requirements.txt
│   └── .env.example                    # DATABASE_URL, JWT_SECRET, CORS_ORIGINS, ADMIN_*
│
├── content/                            # Markdown content (YAML frontmatter)
│   ├── prompts/                        # 4 prompt .md files
│   ├── guides/                         # 4 guide .md files
│   ├── rulesets/                       # 2 ruleset .md files
│   └── README.md                       # Content contribution guide
│
├── react-app-4.js                      # Design prototype: public pages
├── react-app-5.js                      # Design prototype: publications
└── react-app-6.js                      # Design prototype: admin panel
```

---

## Architecture Decisions

### Frontend

- **App Router** with route groups: `(public)` gets AppShell layout, `(auth)` is standalone, `admin/` has its own AdminSidebar layout
- **"use client"** only where needed (interactivity, hooks). Keep server components as default
- **Static data** in `src/data/` acts as fallback when API is unavailable
- **All API calls** go through `src/lib/api.ts` — never call `fetch()` directly in components
- **Types** centralized in `src/types/index.ts` — add new interfaces there
- **Pagination** uses `PaginatedResponse<T>` generic everywhere

### Backend

- **One router per resource** — follow the existing pattern when adding new entities
- **Pydantic v2** schemas in `models/schemas.py` — separate Create/Update/Response models
- **Auth middleware** via FastAPI dependencies: `get_current_user`, `require_role("ADMIN")`
- **Pagination** via reusable `paginate()` util — all list endpoints support `?page=&limit=&search=`
- **Seed service** runs on startup, is idempotent (checks before inserting)

### Database

- SQLite for dev (`rig.db`), designed for PostgreSQL migration
- All models have `created_at`, most have `updated_at`
- JSON columns for arrays (`tags` in Prompt/Proposal)
- Status workflow: `draft` → `pending` → `published` | `rejected`

---

## Design System — Neo-Brutalist

### Tokens (from `tailwind.config.ts`)

```
Colors:
  void:             #E5E5E5    (page background)
  panel:            #000000    (dark panels, sidebar, header)
  card:             #F0F0F0    (card backgrounds)
  accent / hover:   #FFE600    (primary accent — yellow)
  status-published: #B4FF00    (lime green)
  status-draft:     #DDD       (gray)
  status-pending:   #FFE600    (yellow)
  text-primary:     #000000
  text-secondary:   #404040
  text-tertiary:    #666666
  text-inverse:     #FFFFFF

Shadows:
  brutal-sm:  4px 4px 0px #000
  brutal-md:  6px 6px 0px #000
  brutal-lg:  8px 8px 0px #000
  brutal-xl:  10px 10px 0px #000

Fonts:
  font-display:  Space Grotesk    (headings, titles)
  font-ui:       Manrope          (body text, UI)
  font-mono:     IBM Plex Mono    (code blocks, tech labels)
```

### Rules

- **border-radius: 0** everywhere — never round corners
- **border: 2px solid #000** on cards, inputs, buttons
- **box-shadow** from the brutal-* tokens for depth
- **Uppercase** for labels, nav items, status badges, section headers
- **Logo animation**: `colorShift` keyframes cycling yellow → lime → cyan → blue → purple
- **Hover states**: shift shadow offset (e.g., `brutal-md` → `brutal-sm` on press)
- New components must follow these patterns — check existing components for reference

---

## Roles & Permissions

| Action | USER | MODERATOR | ADMIN |
|--------|------|-----------|-------|
| View public content | yes | yes | yes |
| Create content | yes (pending) | yes (pending) | yes (published) |
| Edit own content | yes | yes | yes |
| Review pending content | — | yes | yes |
| Approve/reject content | — | yes | yes |
| User management | — | — | yes |
| Admin panel access | — | moderation only | full |

- Users with `requires_approval=true` → content auto-set to `pending`
- ADMIN content goes straight to `published`

---

## API Reference

```
Auth:
  POST   /api/auth/login                    # { email, password } → { access_token }
  GET    /api/auth/me                       # → User (requires Bearer token)

Prompts:
  GET    /api/prompts?search=&page=&limit=  # Public, published only
  GET    /api/prompts/:id                   # Single prompt
  POST   /api/prompts                       # Auth required, body: PromptCreate
  PUT    /api/prompts/:id                   # Author or admin
  GET    /api/prompts/moderation/pending     # ADMIN/MODERATOR
  PATCH  /api/prompts/:id/status?status=    # ADMIN only

Guides:
  GET    /api/guides?search=&page=&limit=   # Public, published only
  GET    /api/guides/:id
  POST   /api/guides                        # Auth required
  PUT    /api/guides/:id
  GET    /api/guides/moderation/pending      # ADMIN/MODERATOR
  PATCH  /api/guides/:id/status?status=     # ADMIN only

Agents:
  GET    /api/agents?search=&page=&limit=   # Public

Rulesets:
  GET    /api/rulesets?search=&page=&limit= # Public

Proposals:
  POST   /api/proposals                     # Public (no auth)
  GET    /api/proposals?status=&search=     # ADMIN/MODERATOR
  PATCH  /api/proposals/:id/status?new_status= # ADMIN/MODERATOR

Users:
  GET    /api/users?search=&page=&limit=    # ADMIN only
  POST   /api/users                         # ADMIN only
  PATCH  /api/users/:id                     # ADMIN only
  DELETE /api/users/:id                     # ADMIN only

Health:
  GET    /api/health                        # → { status: "ok" }
```

---

## Data Models (ORM)

```
User:      id, email (unique), password_hash, name, role, requires_approval, is_active, created_at
Prompt:    id, title, desc, author_id (FK), author_name, copies, tags (JSON), tech, content, status, created_at, updated_at
Guide:     id, title, desc, author_id (FK), author_name, category, time, views, date, content, status, created_at, updated_at
Agent:     id, number, title, desc, author_id (FK), status (active/beta/inactive), content_status, created_at, updated_at
Ruleset:   id, title, desc, language, author_id (FK), content, content_status, created_at, updated_at
Proposal:  id, type, title, description, content, email, tags (JSON), status (pending/approved/rejected), reviewer_id (FK), created_at
```

---

## TypeScript Interfaces (Frontend)

Key types in `src/types/index.ts`:

```typescript
Prompt      { id, title, desc, author_name?, copies, tags[], tech, content, status?, created_at? }
Guide       { id, title, desc, author_name?, category, time, views, date, content?, status? }
Ruleset     { id, title, desc, language }
Agent       { id, number, title, desc, status: "active"|"beta" }
User        { id, name, email, role: UserRole, is_active, requires_approval, created_at }
Proposal    { id, type, title, description?, content?, email, tags[], status, created_at }
PaginatedResponse<T> { items: T[], total, page, limit, pages }
```

When adding new entities: define interface in `types/index.ts`, add API functions in `lib/api.ts`, create Pydantic schemas in `models/schemas.py`.

---

## Development Rules

### Code Style

- **Frontend**: functional components, named exports, `"use client"` only when hooks/interactivity needed
- **Backend**: async endpoint handlers, type hints on all functions, Pydantic for validation
- **Naming**: camelCase (TS), snake_case (Python), UPPER_CASE (constants/roles)
- **Imports**: absolute with `@/` alias on frontend, relative within backend `app/`

### When Adding a Feature

1. **Backend first**: model → schema → router → register in `main.py` → test
2. **Migration**: `alembic revision --autogenerate -m "add X"` → `alembic upgrade head`
3. **Frontend**: type → API function → component → page → wire into navigation
4. **Test**: `pytest` for backend, `npm run build` for frontend type-checking

### When Fixing a Bug

1. Read the relevant code first — don't guess
2. Write a test that reproduces the bug
3. Fix it
4. Verify test passes

### Testing

- Backend tests in `backend/tests/` with pytest
- `conftest.py` provides: in-memory DB, pre-created users (admin/moderator/user/inactive), auth tokens
- Run: `cd backend && python -m pytest tests/ -v`
- Frontend: `npm run build` catches type errors (no unit test framework yet)

### What NOT to Do

- Don't bypass auth middleware — always use `get_current_user` / `require_role`
- Don't add `border-radius` to anything
- Don't hardcode Russian text in components — but do keep UI labels in Russian
- Don't create new util files — extend existing ones in `lib/`
- Don't mix static data (`src/data/`) with API data — static is fallback only
- Don't use `any` type — define proper interfaces
- Don't skip Pydantic validation — every endpoint needs proper schemas

---

## Environment Variables

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (`backend/.env`)
```
DATABASE_URL=sqlite:///./rig.db
JWT_SECRET=your-secret-key
CORS_ORIGINS=http://localhost:3000
ADMIN_EMAIL=admin@rig.ai
ADMIN_PASSWORD=admin123
ADMIN_NAME=Admin
```
