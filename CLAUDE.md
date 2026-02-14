# RIG - Personal Project

> Project-specific configuration for AI dev assistants.
> Inherits from `/Users/oktsh/Documents/ai-dev/CLAUDE.md`

---

## Project Info

**Name:** RIG
**Type:** Personal Product
**Status:** New / In Planning

**Description:**
[TODO: Add project description]

---

## Stack

### Technologies
- **Framework:** [TODO: e.g., Next.js, FastAPI, React Native]
- **Language:** [TODO: e.g., TypeScript, Python, Rust]
- **Database:** [TODO: e.g., PostgreSQL, MongoDB, SQLite]
- **Infrastructure:** [TODO: e.g., Docker, Vercel, AWS]

### Key Packages
```
[TODO: List main dependencies]
```

---

## Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Production build
npm run test         # Run tests
npm run lint         # Run linter
npm run typecheck    # TypeScript validation

# Database (if applicable)
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database
npm run db:reset     # Reset database
```

---

## Project Structure

```
RIG/
├── CLAUDE.md              # This file
├── specs/                 # Feature specs, plans, tasks
├── src/                   # Source code
├── tests/                 # Test files
├── docs/                  # Documentation
└── [TODO: Add structure]
```

---

## Patterns

### Code Organization
- [TODO: Define module/component conventions]
- [TODO: Define naming conventions]

### State Management
- [TODO: Define state management approach]

### API / Data Layer
- [TODO: Define API conventions]

### Testing
- [TODO: Define testing patterns]

---

## Rules

### Do's ✅
- [TODO: Project-specific best practices]
- Follow workspace-level CLAUDE.md rules
- Use spec-driven development for major features
- Keep commits atomic and well-described

### Don'ts ❌
- [TODO: Project-specific anti-patterns]
- Don't commit secrets or credentials
- Don't skip tests for critical paths
- Don't mix concerns in single module

---

## Development Workflow

### Feature Development
1. **Spec** - Use `spec-writer` agent → `specs/N-name/spec.md`
2. **Plan** - Use `spec-planner` agent → `specs/N-name/plan.md`
3. **Tasks** - Use `task-breakdown` agent → `specs/N-name/tasks.md`
4. **Implement** - Use domain agents (TDD)
5. **Review** - Use `code-reviewer` agent
6. **Validate** - Use `tech-lead` agent
7. **Ship** - Commit + push

### Quick Changes
For low-risk changes (typos, small fixes):
- Just do it → verify → commit

---

## Notes

- **Initialized:** [Current Date]
- **Last Updated:** [Current Date]
- **Primary Developer:** [Your Name]

---

## Next Steps

1. [ ] Define stack (framework, language, database)
2. [ ] Set up initial project structure
3. [ ] Configure development environment
4. [ ] Create first feature spec
5. [ ] Implement MVP

---

_This CLAUDE.md follows the workspace template from `/Users/oktsh/Documents/ai-dev/_hub/templates/`_
