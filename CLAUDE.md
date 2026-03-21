# CLAUDE.md

## Project: MultiPawcation (Times Tables Race Game)

A board game web app where a child races an AI opponent by solving multiplication problems. iPad-first PWA hosted on GitHub Pages.

## Critical Technical Decisions

**State management:** Use `useReducer` for ALL game state. Do NOT use `useState` for game logic. The game has interconnected state (player position, AI position, current problem, active effects, timer) that must stay in sync.

**Input:** Build a custom on-screen NumberPad component (0-9, delete, submit). Do NOT use `<input>` elements or anything that triggers the iOS system keyboard. The keyboard slides up, shrinks the view, and ruins the game feel. The number pad is always visible during gameplay.

**Answer submission:** Explicit submit button on the number pad. Do NOT auto-submit. Two-digit answers (like "56") would get incorrectly submitted as "5".

## Tech Stack

- React + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Framer Motion (animations)
- Howler.js (audio, required for Safari compatibility)
- Vite PWA plugin (service worker, manifest, offline support)
- GitHub Pages via GitHub Actions (hosting/deployment)

## iPad/Safari Requirements (apply from Phase 0 onward)

These must be present in every build:

- `overscroll-behavior: none` on body/root (prevents pull-to-refresh wiping the game mid-race)
- `touch-action: manipulation` on all interactive elements (prevents 300ms double-tap-to-zoom delay)
- `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">` (prevents zoom on focus)
- Audio unlock: first user interaction (Play button) must trigger a silent Howler.js play to unlock the Safari audio context
- Touch targets: minimum 44x44px (Apple guideline), number pad buttons should be larger (56x56px+)
- Asset preloading: all images and audio must be preloaded before gameplay starts

## Data Persistence

- Game progress, fact tracking, and unlock state: localStorage
- Mid-game save: save full game state to localStorage on every move so interrupted games can resume
- On launch, detect saved state and offer "Resume Game"

## Animal Unlock System

4 starter animals (Cat, Dog, Frog, Bear), 8 unlockable through gameplay achievements. Locked animals visible but grayed out on character select. AI opponent only picks from unlocked animals.

## Project Structure Convention

- Components in `src/components/`
- Game logic in `src/game/` (gameState.ts uses useReducer)
- Data definitions in `src/data/`
- Custom hooks in `src/hooks/`
- Static assets in `public/assets/`

## Asset Locations

- Animal art and sound effects are staged in `./times-tables-race-assets/` (adjacent to this file)
- Copy animals from `./times-tables-race-assets/animals/` into `public/assets/animals/` during Phase 2
- Copy sounds from `./times-tables-race-assets/sounds/` into `public/assets/sounds/` during Phase 5

## Deployment

- GitHub repo: MultiPawcation
- GitHub Pages URL: https://marquisdcarabas.github.io/MultiPawcation/
- Auto-deploy via GitHub Actions on every push
- Vite base path must be set to `/MultiPawcation/` for GitHub Pages to work

## Development Workflow

- Deploy after every phase via `git push` (GitHub Actions auto-deploys)
- Write automated tests at the end of each phase
- Test on iPad Safari after every phase, not just at the end
- Full development plan: /Users/dirk/Obsidian/Memory Palace/Projects/Times Tables Race Game.md
