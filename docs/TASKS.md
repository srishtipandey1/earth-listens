# Tasks (do in order; commit after each)

- [x] 1. Scaffold Vite + TypeScript + Tone.js + Vitest + ESLint. Add scripts: dev, build, test, lint, preview. Create docs/PROGRESS.md and docs/KNOWN_ISSUES.md.
- [x] 2. Data: identify and verify real sources for the 3 scenes. Write scripts/ (Node or Python) that download and process them into public/data/*.json with metadata. Run them. If network is blocked, document it and write the scripts anyway.
- [x] 3. Core: data loader, normalization, and the sonification mapping functions with unit tests. Write docs/SONIFICATION.md.
- [x] 4. Audio engine with Tone.js: voices, scale handling, dissonance control, noise texture, stereo panning, mute, master limiter, start only after user gesture.
- [ ] 5. UI: scene picker, slider, play/pause, speed, visual layer synchronized with the sound, About panel with attribution.
- [ ] 6. Accessibility: keyboard map, ARIA, live region descriptions, focus styles, reduced motion. Test with automated checks (for example axe via vitest or playwright) if feasible.
- [ ] 7. Compare mode with stereo separation.
- [ ] 8. Polish: responsive layout, loading and error states, empty-data handling.
- [ ] 9. Docs: README, docs/AI_USE.md (fill it in accurately), docs/DEMO.md.
- [ ] 10. Final pass: run build, test, lint, preview. Fix everything fixable. Summarize in docs/PROGRESS.md: what is done, what is not, decisions made, anything the human must verify (data licenses, sound quality, rule compliance).