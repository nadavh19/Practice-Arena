# Frontend UI Refresh

## Summary

The app UI was refreshed across auth, profile, new session, current session, and history so the product feels cohesive instead of like separate default forms. The design follows the local `design-taste-frontend` direction: Geist typography, zinc/slate neutrals, emerald as the only accent, asymmetric desktop layouts, mobile-safe single-column collapse, and CSS-only motion.

## Pages Refreshed

- `/auth`: split product intro and refined login/signup panel.
- `/profile`: asymmetric profile setup with a summary panel and clearer form hierarchy.
- `/session/new`: practice context form with a live preview sidebar.
- `/session/current`: stronger summary, task list, and feedback hierarchy.
- `/history`: polished metrics, session rows, empty state, and expanded task details.

## Shared UI Changes

- `PageShell` now supports wider layouts and uses `min-h-[100dvh]` for viewport stability.
- `SurfaceCard` uses softer borders, rounded surfaces, and diffusion-style shadows.
- `AppButton`, `FormField`, `InlineStatus`, and `PageHeading` now share stronger typography, focus rings, tactile active states, and contrast-safe styling.
- The protected navigation has a clearer brand area, active route treatment, and responsive wrapping.

## Motion And Accessibility

- Motion is CSS-only; no new dependencies were added.
- Staggered section/list reveals animate only `opacity` and `transform`.
- `prefers-reduced-motion` disables entrance animation.
- Focus rings and active press states are applied to primary controls.
- Long task tabs remain horizontally scrollable in monospace blocks.

## Background Assets

The supplied music images were copied into `public/backgrounds/` with stable names and are used as full-page route backgrounds:

- `warm-fretboard.png` is used on `/auth` and `/profile`.
- `blue-equalizer-wave.png` is used on `/session/new` and `/history`.
- `dark-guitar-glow.png` is used on `/session/current`, plus the current practice summary and completion footer.

Each image is paired with a gradient overlay in `app/globals.css` so foreground text and form surfaces stay readable. To replace an image later, keep the same filename or update the matching CSS utility: `.auth-image-shell`, `.profile-page-background`, `.new-session-page-background`, `.current-session-page-background`, `.history-page-background`, or `.music-accent-panel`.

## Verification

Run:

```bash
npm run lint
npm run build
npm run dev
```

Then verify `http://localhost:3000` and check auth, profile, session generation, current session completion/feedback, and history disclosure behavior on desktop and mobile widths.
