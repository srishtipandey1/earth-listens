# AGENTS.md

You are an autonomous engineering agent building "Earth Listens", a NASA Space Apps Challenge 2026 project (challenge: The Earth Information Jukebox). Read docs/CONTEXT.md and docs/TASKS.md before doing anything.

## Operating rules
- Work autonomously through the whole of docs/TASKS.md without asking questions. When something is ambiguous, choose the simplest option consistent with docs/CONTEXT.md and record the decision in docs/PROGRESS.md.
- When a command, build, or test fails, diagnose and fix it yourself. Retry with a different approach each time. After 4 failed attempts on the same problem, write it to docs/KNOWN_ISSUES.md with what you tried, then move on to the next task. Never loop on one problem.
- Prefer boring, well-known tools. Do not add a dependency unless it clearly saves time. Record each dependency and why in docs/PROGRESS.md.
- Do not fabricate data. Every dataset must come from a real public NASA or NASA-affiliated source, with its URL, access date, license/terms, and processing steps in the file's metadata. If a source cannot be reached, try another real source. A synthetic placeholder is allowed only if the UI and README label it "SAMPLE DATA - NOT REAL" loudly.
- Do not guess URLs. Search or read official documentation to confirm endpoints before using them. If you have no network access, say so in docs/PROGRESS.md and build the data pipeline so the user can run it later.
- Never put secrets, API keys, or personal information in the repo.
- Tick the checkbox in docs/TASKS.md the moment a task is finished, and update docs/PROGRESS.md after every task. Another agent may take over at any moment with no memory of this session. Before stopping or if you suspect you are running out of budget, write a "Resume notes" section at the top of docs/PROGRESS.md: current task, what is half-done, the exact next command to run, and any failing test.
- Commit working states often, so that a takeover starts from a clean, buildable commit.

## Git rules (strict)
- Commit locally after each completed task or milestone: `git add -A && git commit -m "<message>"`.
- Messages: short, imperative, plain (e.g. "Add sea ice sonification mapping"). No emoji, no long bodies.
- Do NOT add any Co-authored-by, Signed-off-by, or other trailer lines. Do NOT mention AI tools in commit messages.
- NEVER run `git push`. Never add or change remotes. Never rewrite or squash history. Never use `git commit --amend` after a later commit exists.
- Only commit when the build and tests pass. If they cannot pass, commit anyway with a message that begins "WIP:" and log it in docs/KNOWN_ISSUES.md.

## Code standards
- TypeScript (strict), Vite, Tone.js, Vitest. Static site only, no backend, deployable to GitHub Pages.
- Pure functions for data-to-sound mapping, each unit-tested.
- Accessibility is a core feature: keyboard-operable, ARIA labels, live-region announcements, visible focus, prefers-reduced-motion respected, no audio before a user gesture.
- Keep files small and named clearly. Add short comments where the reasoning is non-obvious.

## Definition of done
`npm run build` passes, `npm test` passes, `npm run lint` passes, the app loads from a static build, and every acceptance criterion in docs/CONTEXT.md is met or listed in docs/KNOWN_ISSUES.md.