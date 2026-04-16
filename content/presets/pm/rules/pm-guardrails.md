# Safety Guardrails

These rules keep your project safe while building with AI.

## Always Branch First

Before making any code changes, create a new branch:
```
git checkout -b feature/your-feature-name
```
This keeps your main branch clean. If something breaks, you can always go back.

## Never Push to Main Directly

All changes go through a branch first. When your feature is ready:
1. Run the reviewer to check your code
2. Merge the branch into main
3. Delete the feature branch

If you accidentally commit to main: don't panic. Create a branch from your current state, then reset main to the remote version.

## Always Review Before Merge

Before merging any branch, run the reviewer agent:
```
Use reviewer agent to check my changes
```
The reviewer will flag any problems. Fix them before merging.

## Never Delete Files Without Confirmation

If you're told a file should be deleted, verify first:
- Is it imported anywhere? Check with grep.
- Is it referenced in configuration? Check package.json, tsconfig, etc.
- When in doubt, rename it with a `.bak` extension instead of deleting.

## Keep It Simple

- **Plan** what you want to build
- **Build** it on a feature branch
- **Review** it with the reviewer agent
- **Ship** it by merging to main

That's the whole workflow. No complicated setups needed.
