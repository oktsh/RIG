# GYRD Frontend Redesign — Architectural Decisions

## Decision Log

### [2024-02-16] Neural/Tech Dark Design System
**Context:** Original neo-brutalist design (#FFE600 yellow, Space Grotesk) didn't match desired technical/developer product identity.

**Decision:** Implement neural/tech dark aesthetic with #050505 background, #EAEAEA text, Inter/Space Mono fonts, crosshair cursor.

**Rationale:** Dark aesthetic better conveys AI/neural network theme. Crosshair cursor reinforces technical/developer tool positioning.

**Alternatives considered:**
- Material Design dark theme (rejected - too generic)
- Cyberpunk neon (rejected - too distracting)

---

### [2024-02-16] Three.js for Hero, Canvas 2D for Agents
**Context:** Needed interactive visualizations for landing page sections.

**Decision:** Use Three.js (3D wireframe grid with particles) for Hero section, Canvas 2D (neural network) for Agents section.

**Rationale:** Differentiation between sections. Three.js provides depth/immersion for hero, Canvas 2D lighter weight for secondary section. Avoids redundancy.

**Alternatives considered:**
- Both Three.js (rejected - too heavy)
- Both Canvas 2D (rejected - less impressive)

---

### [2024-02-16] Content Externalization to TypeScript Files
**Context:** Landing page content hardcoded in JSX, making updates require code changes.

**Decision:** Move all content to `content/landing/content.ts` with TypeScript structure, direct import via `@/lib/content`.

**Rationale:** Git-based workflow matches developer product identity. TypeScript provides type safety, zero runtime cost, IDE autocomplete. No need for CMS complexity.

**Alternatives considered:**
- Markdown files (rejected - overkill for structured data)
- CMS (rejected - against git-first philosophy)

---

### [2024-02-16] Minimal AgentCanvas (No Trails)
**Context:** Initial implementation had 15-position trajectory trails, looked too busy/bright.

**Decision:** Remove trails entirely (length: 0), reduce agent nodes to 2px with minimal glow.

**Rationale:** User feedback: "убери трейлы совсем сделай точки поменьше консистентно остальному". Minimal approach more consistent with neural/tech dark aesthetic.

**Alternatives considered:**
- Subtle trails (rejected - still too busy)
- Brighter nodes (rejected - inconsistent)

---

### [2024-02-16] Git-Only Content Management (No Admin UI)
**Context:** Need workflow for updating landing/docs content.

**Decision:** Content updates ONLY via git commits, no admin UI for content creation.

**Rationale:** Version control + PR review process built-in. Git blame for accountability. Easy rollback. Matches technical product identity.

**Alternatives considered:**
- Admin UI (rejected - adds complexity, breaks git-first workflow)

---

## Technical Stack Decisions

### Frontend
- **Framework:** Next.js 15 (App Router) - Server Components + Client Islands pattern
- **UI Library:** React 19 - Latest features (use, useActionState)
- **Styling:** Tailwind CSS v3 - Utility-first, custom neural theme
- **3D Graphics:** Three.js - Industry standard for WebGL
- **Typography:** Inter (body), Space Mono (monospace) - Professional, technical feel
- **Type Safety:** TypeScript 5 - Strict mode enabled

### Backend
- **Framework:** FastAPI - High performance, async-first
- **ORM:** SQLAlchemy - Mature, battle-tested
- **Database:** PostgreSQL/SQLite - Flexible for dev/prod
- **Validation:** Pydantic v2 - Type-safe data models
- **Auth:** Passlib (bcrypt) - Industry standard hashing

---

## Design Patterns

### Server Component + Client Island
**Pattern:** Server Components for data loading, Client Components for interactivity only.

**Example:** Landing page is client component for animations, Console uses Server Component for markdown loading.

**Benefits:** Reduced bundle size, better SEO, faster initial load.

---

### Git-Based Content Management
**Pattern:** All content in git repository, edited via commits/PRs.

**Workflow:**
1. Edit `content/landing/content.ts` locally
2. Commit with descriptive message
3. Push to remote branch
4. Create PR for review
5. Merge to deploy

**Benefits:** Version control, review process, rollback capability, no database sync.

---

### Memory Management for Canvas Animations
**Pattern:** All animations use `cancelAnimationFrame()` and cleanup functions.

**Example:**
```typescript
useEffect(() => {
  let animationId: number
  const animate = () => {
    animationId = requestAnimationFrame(animate)
    // animation logic
  }
  animate()

  return () => cancelAnimationFrame(animationId)
}, [])
```

**Benefits:** Prevents memory leaks, avoids multiple animation loops.

---

## Next Session Recovery

When resuming this project after a break, reference:
1. This file (DECISIONS.md) for **WHY** decisions were made
2. PROGRESS.md for **WHAT** is complete and **WHAT'S** next
3. README.md for **HOW** to run and develop
4. Plan file (`.claude/plans/calm-petting-lark.md`) for detailed implementation strategy
