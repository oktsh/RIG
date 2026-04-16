# Discovery Workflow

When starting a new feature, follow these steps in order.

## 1. Problem

What problem are we solving? For whom?

Write a clear problem statement: who has the pain, what the pain is, and why current solutions don't work. If you can't explain the problem in 2 sentences, it's not clear enough yet.

## 2. Stories

Write user stories for each thing the user needs to do:

> As [role], I want [action], so that [value].

Keep stories small. Each one should be buildable independently. If a story takes more than a day to build, break it down further.

## 3. Criteria

Define acceptance criteria for each story. These are the specific conditions that must be true for the story to be "done":

- Start with "A user can..." not "The system should..."
- Include the happy path AND at least one edge case
- Make them testable -- you should be able to verify each one

## 4. Plan

Create a prototype plan:
- Which existing files need to change?
- What new files are needed?
- What order should things be built in?
- Are there any dependencies or blockers?

Save the plan to `specs/[feature-name]/spec.md`.

## 5. Build

Implement on a feature branch:
```
git checkout -b feature/[feature-name]
```

Build incrementally. Get the smallest version working first, then add features one at a time.

## 6. Review

Before merging, run the reviewer:
```
Use reviewer agent to check my changes
```

Fix any issues the reviewer finds. Re-run until approved.

## 7. Ship

Merge to main after review passes:
```
git checkout main
git merge feature/[feature-name]
git branch -d feature/[feature-name]
```
