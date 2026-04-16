# Feature Specification: [Feature Name]

> **Branch:** `[N]-[feature-short-name]`
> **Date:** [YYYY-MM-DD]
> **Author:** [role/name]
> **Status:** Draft | Review | Approved

---

## 1. Problem Statement

[1-3 sentences: what problem does this solve and for whom]

---

## 2. User Scenarios & Testing

> Each user story must be INDEPENDENTLY testable.
> Priority: P1 = must have, P2 = should have, P3 = nice to have.

### US-1 (P1): [Story Title]

**As** [role],
**I want** [action],
**So that** [value].

#### Acceptance Criteria

| ID | Criterion | Details |
|----|-----------|---------|
| AC-001 | [What is verified] | [Specific logic or behavior] |
| AC-002 | [What is verified] | [Specific logic or behavior] |

#### Scenarios

```gherkin
Scenario: [Happy path]
  Given [precondition]
  When [action]
  Then [expected result]

Scenario: [Edge case]
  Given [precondition]
  When [action]
  Then [expected result]
```

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Linked US |
|----|-------------|----------|-----------|
| FR-001 | [Requirement description] | P1 | US-1 |

### 3.2 Non-Functional Requirements

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-001 | Performance | [e.g., page load < 2s on 3G] |

### 3.3 Out of Scope

- [Explicitly excluded feature/behavior]

---

## 4. Success Criteria

| # | Metric | Target |
|---|--------|--------|
| 1 | [Metric description] | [Quantifiable target] |

---

## 5. Open Questions

| # | Question | Status | Resolution |
|---|----------|--------|------------|
| 1 | [Question] | Open / Resolved | [Answer if resolved] |

---

## Handoff

- [ ] All AC IDs assigned
- [ ] All open questions resolved or escalated
- [ ] Success criteria are measurable
- [ ] Each US is independently testable
- [ ] Ready for technical planning
