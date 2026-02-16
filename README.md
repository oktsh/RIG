# RIG — Reactive Intelligence Gateway

> Orchestrate Intelligence.

**Branch:** `experiment/ghosttly-ux` — Neural/tech dark aesthetic redesign

---

## Overview

RIG is a platform for building, deploying, and orchestrating autonomous AI agents with precision. Built with Next.js 15, React 19, and FastAPI.

**Current Branch:** Complete frontend redesign implementing neural/tech dark aesthetic with interactive 3D/2D canvas elements, externalized content management, and streamlined navigation.

---

## Design System

### Neural/Tech Dark Aesthetic

- **Background:** `#050505` (neural-bg), `#0a0a0a` (neural-surface)
- **Text:** `#EAEAEA` (text-primary), `#666666` (text-secondary)
- **Borders:** `#1a1a1a` (subtle), `#333333` (medium)
- **Fonts:** Inter (body), Space Mono (monospace)
- **Cursor:** Crosshair for developer/technical feel

### Interactive Elements

- **HeroCanvas:** Three.js 3D wireframe grid (PlaneGeometry 30×30×60) with exponential fog, 500 floating particles, and 3-wave vertex displacement animation
- **AgentCanvas:** Enhanced "Neural Agent Network" effect with 6 agents (minimal 2px nodes), central hub with pulse, connection lines, orbital rings, and 50 background particles
- **ScrambleText:** Auto-cycling text scramble animation with character randomization
- **BracketCard:** Expanding bracket corners on hover with smooth transitions
- **Section Dimming:** IntersectionObserver-based dimming effect on scroll

---

## Stack

### Frontend

- **Next.js 15** (App Router)
- **React 19** (Server Components + Client Islands)
- **TypeScript 5**
- **Tailwind CSS v3** (custom neural theme)
- **Three.js** (3D wireframe grid with particle system)
- **Canvas 2D API** (agent network visualization)

### Backend

- **FastAPI** (Python 3.11+)
- **SQLAlchemy** (ORM)
- **PostgreSQL/SQLite**
- **Pydantic v2** (validation)
- **Passlib** (bcrypt hashing)

---

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev  # http://localhost:3000 (experiment branch)
             # http://localhost:3001 (original design)
```

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload  # http://localhost:8000
```

---

## Pages

### Landing Page (/)

Full-screen scroll-based experience with:
- **Hero section** — 3D wireframe grid background with 500 floating particles
- **Prompts section** — Context rules and dynamic prompt injection
- **Agents section** — Neural network canvas with 6 agents and trajectory trails
- **Guides section** — Interactive documentation
- **No AppShell wrapper** for immersive full-page experience

### Console (/console)

Documentation hub with:
- Sidebar navigation (git-like tree structure)
- Tabbed interface: Prompts, Guides, Agents, Rulesets
- Markdown rendering with syntax highlighting
- No auth required (content-focused)

### Archived Routes

Auth and admin routes commented out (not deleted) to preserve code:
- `/login` → redirects to `/`
- `/register` → redirects to `/`
- `/admin/*` → redirects to `/`

---

## Content Management

**Git-Based Workflow** — All content stored in repository, no UI for content creation.

### Directory Structure

```
RIG/
├── content/                    # Git-managed content
│   └── landing/
│       └── content.ts         # Landing page copy (TypeScript)
├── frontend/
│   └── src/
│       ├── lib/
│       │   └── content.ts     # Content loader (build-time import)
│       └── app/
│           └── (public)/
│               └── page.tsx   # Landing page (uses externalized content)
```

### Workflow

1. **Edit content** — Modify `content/landing/content.ts` locally
2. **Commit** — `git add . && git commit -m "Update landing copy"`
3. **Push** — `git push origin experiment/ghosttly-ux`
4. **Deploy** — Rebuild triggers automatic content update

**Why Git-Only?**
- Version control + review process via PRs
- Git blame for accountability
- Easy rollback
- Matches technical/developer product identity

---

## Development

### Component Structure

```
frontend/src/
├── app/
│   ├── (public)/              # Public pages (landing)
│   ├── console/               # Documentation hub
│   └── layout.tsx             # Root layout (Inter + Space Mono fonts)
├── components/
│   ├── landing/               # Landing-specific components
│   │   ├── HeroCanvas.tsx     # Three.js 3D grid with particles
│   │   ├── AgentCanvas.tsx    # Neural network visualization
│   │   ├── ScrambleText.tsx   # Text scramble effect
│   │   ├── BracketCard.tsx    # Bracket corners animation
│   │   └── LandingNav.tsx     # Landing navigation
│   └── layout/                # AppShell (for non-landing pages)
├── hooks/
│   └── useSmoothScroll.ts     # Smooth scroll behavior
└── lib/
    └── content.ts             # Content loader utility
```

### Key Patterns

- **Server Component + Client Island** — Landing page is client component for animations, console uses Server Component for data loading
- **Memory Management** — All animations use `cancelAnimationFrame()` and `clearInterval()` in cleanup functions
- **Content Externalization** — No hardcoded strings in components, all text loaded from `content/` directory
- **Conditional AppShell** — Landing page bypasses AppShell wrapper for full-screen experience

---

## Configuration

### Path Aliases (`tsconfig.json`)

```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@content/*": ["../content/*"]
  }
}
```

### Port Configuration

- **Port 3000:** `experiment/ghosttly-ux` branch (neural design)
- **Port 3001:** `main` branch (original neo-brutalist design)

Run both simultaneously for comparison:

```bash
# Terminal 1 (experiment branch)
cd frontend && npm run dev

# Terminal 2 (main branch)
git checkout main
cd frontend && next dev -p 3001
```

---

## Phase Implementation

**6-Phase Plan** (3-4 weeks):
1. ✅ Design System Migration (Tailwind tokens, fonts, global CSS)
2. ✅ Interactive Components (HeroCanvas, AgentCanvas, ScrambleText)
3. ✅ Landing Page Redesign (full-screen sections, no AppShell)
4. ✅ Console Page (sidebar navigation, tabbed interface)
5. ✅ Route Management (commented out auth/admin, added redirects)
6. ✅ Content Externalization (git-based workflow, landing content TypeScript file)

**Pre-Phase 6 Fixes:**
- ✅ AgentCanvas Enhanced Neural Network Effect (6 agents, minimal nodes, hub)
- ✅ HeroCanvas particle system (500 particles)
- ✅ HeroCanvas reference parameters (fog, geometry, material, camera)
- ✅ HeroCanvas 3-wave vertex displacement

---

## Testing

### Frontend

```bash
cd frontend
npm run build  # Verify build succeeds
npm run dev    # Visual testing
```

### Backend

```bash
cd backend
pytest --cov=app --cov-report=term
```

---

## License

© 2024 RIG. All rights reserved.

---

**For development workflow and agent coordination, see:** [CLAUDE.md](./CLAUDE.md)
