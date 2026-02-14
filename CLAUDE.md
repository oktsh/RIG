# RIG - Corporate Knowledge Base for AI-Assisted Development

> Internal platform for vibe-coding teams: prompts, guides, rules, agents.

---

## Project Info

**Name:** RIG
**Type:** Internal Corporate Platform
**Status:** MVP Implementation

**Description:**
RIG is a corporate knowledge base for AI-assisted development teams. It contains curated prompts, guides, context rules for AI assistants, and community contribution features. Neo-brutalist design system with 0 border-radius, offset box-shadows, and heavy black borders.

---

## Stack

### Technologies
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript 5
- **Backend:** FastAPI (Python), SQLAlchemy 2.0
- **Database:** SQLite (via SQLAlchemy, migration-ready for PostgreSQL)
- **Styling:** Tailwind CSS v3, custom neo-brutalist design system
- **Auth:** HMAC-SHA256 JWT, PBKDF2 password hashing
- **Fonts:** Space Grotesk (display), Manrope (body), IBM Plex Mono (code)

### Key Packages
```
# Frontend
next@15, react@19, tailwindcss@3, clsx, tailwind-merge, gray-matter

# Backend
fastapi, uvicorn, sqlalchemy, alembic, python-dotenv
```

---

## Commands

```bash
# Frontend (from /frontend)
cd frontend
npm run dev          # Start dev server on :3000
npm run build        # Production build
npm run lint         # ESLint

# Backend (from /backend)
cd backend
pip install -r requirements.txt   # Install deps
uvicorn app.main:app --reload     # Start API on :8000

# First run seeds admin user (admin@rig.ai / admin123) + all content
```

---

## Project Structure

```
RIG/
├── CLAUDE.md
├── frontend/                    # Next.js 15 application
│   ├── src/
│   │   ├── app/
│   │   │   ├── (public)/       # Public pages (sidebar + header shell)
│   │   │   │   ├── page.tsx              # Home
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── content/page.tsx      # Publications management
│   │   │   │   ├── prompts/page.tsx
│   │   │   │   ├── guides/page.tsx
│   │   │   │   ├── guides/[id]/page.tsx
│   │   │   │   └── rules-agents/page.tsx
│   │   │   ├── admin/          # Admin panel (separate sidebar)
│   │   │   │   ├── layout.tsx
│   │   │   │   └── users/page.tsx
│   │   │   └── api/proposals/route.ts
│   │   ├── components/
│   │   │   ├── layout/         # AppShell, Sidebar, Header, AdminSidebar
│   │   │   ├── ui/             # Button, Card, Tag, Modal, CopyButton, StatusBadge
│   │   │   ├── modals/         # ModalProvider, PromptModal, JoinModal, SuccessModal
│   │   │   ├── home/           # HeroSection, StarterKitCard, QuickAccessGrid
│   │   │   ├── dashboard/      # ActionCard, TeamTaskCard, EventCard
│   │   │   ├── prompts/        # PromptCard, CategoryFilter
│   │   │   ├── guides/         # GuideListItem
│   │   │   ├── rules-agents/   # RulesetCard, AgentListItem
│   │   │   ├── content/        # StatsBar, ContentCard, ContentFilter, CreateContentModal
│   │   │   └── admin/          # UserTable
│   │   ├── data/               # Static TypeScript data (prompts, guides, etc.)
│   │   ├── types/index.ts      # All TypeScript types
│   │   └── lib/                # utils.ts (cn), api.ts (fetch wrapper)
│   └── tailwind.config.ts
│
├── backend/                     # FastAPI application
│   ├── app/
│   │   ├── main.py             # App entry, CORS, router registration, startup seed
│   │   ├── config.py           # Settings from env vars
│   │   ├── database.py         # SQLAlchemy engine + session (SQLite)
│   │   ├── models/
│   │   │   ├── db.py           # ORM models (User, Prompt, Guide, Agent, Ruleset, Proposal)
│   │   │   └── schemas.py      # Pydantic request/response schemas
│   │   ├── routers/            # auth, users, prompts, guides, agents, rulesets, proposals
│   │   ├── services/           # auth (JWT, password), seed (initial data)
│   │   └── middleware/auth.py  # JWT verification, role-based access
│   ├── requirements.txt
│   └── .env.example
│
├── react-app-4.js              # Prototype reference (public pages)
├── react-app-5.js              # Prototype reference (publications)
└── react-app-6.js              # Prototype reference (admin panel)
```

---

## Roles

- **USER**: View public content, create/edit own content (requires approval by default)
- **MODERATOR**: Review and approve/reject pending content
- **ADMIN**: Full control, user management, direct publish

---

## Design System

- Neo-brutalist: `border-radius: 0`, `box-shadow: Npx Npx 0px #000`
- Colors: `#E5E5E5` (bg), `#000` (panels), `#F0F0F0` (cards), `#FFE600` (accent)
- Status badges: `#B4FF00` (published), `#DDD` (draft), `#FFE600` (pending)
- All text uppercase where design calls for it
- Logo animation: `colorShift` keyframes (yellow -> lime -> cyan -> blue -> purple)

---

## API Endpoints

```
POST   /api/auth/login          # Login, returns JWT
GET    /api/auth/me             # Current user info

GET    /api/prompts             # Public, published only
POST   /api/prompts             # Auth required
GET    /api/guides              # Public, published only
POST   /api/guides              # Auth required
GET    /api/agents              # Public
GET    /api/rulesets             # Public

POST   /api/proposals           # Public (community submissions)
GET    /api/proposals           # Admin/Moderator only

GET    /api/users               # Admin only
POST   /api/users               # Admin only
PATCH  /api/users/:id           # Admin only
DELETE /api/users/:id           # Admin only

GET    /api/health              # Health check
```
