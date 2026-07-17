# design-sync notes

## What this repo is

`typing-vocab` is a single vanilla-JS/HTML app (`index.html`) — there was no
component library or Storybook to sync. This sync's first step was building
one from scratch: `design-system/` (a new top-level package,
`@typing-vocab/design-system`) with 12 React components covering the app's
core visual language (extracted by hand from `index.html`'s inline styles,
not machine-generated). That package is now the thing `/design-sync` keeps
in sync with the claude.ai/design project — `index.html` itself is
untouched and still ships from the vanilla app.

Deliberately out of scope for this first pass (per user's "core visual
language" choice): one-off modal content (bulk-import textarea details,
notebook emoji/gradient picker, AI-prompt modal body) — these all compose
from the shipped primitives (`Modal`, `Button`, `TextInput`) rather than
getting their own components.

## Build

- `buildCmd` runs from `design-system/` (`npm run build`, i.e. `tsup`).
- No Storybook — `shape: "package"`.
- `cssEntry: "dist/index.css"` is required: tsup names the bundled CSS
  after the entry (`index.css`), which isn't one of the converter's default
  guessed paths (`dist/styles.css`, `styles.css`, etc.) — without this
  override the build reports `[CSS_RUNTIME]` (self-styling CSS-in-JS
  DS) even though this DS ships a real stylesheet.
- Fonts (Unbounded, Space Grotesk, JetBrains Mono) load via a Google Fonts
  `@import` in `src/tokens/typography.css` — informational `[FONT_REMOTE]`
  only, nothing to fix.

## Known render-check gotcha (fixed, but worth knowing for next time)

`Modal` uses `position:fixed;inset:0` for its overlay. In `cardMode:
"single"` preview mode, the harness gives the card wrapper a `transform`
(to contain fixed descendants) but no explicit height, so a plain
`<Modal open .../>` story collapses the containing block to ~0 height and
the panel renders straddling that zero line (half clipped above the
capture viewport). Fix applied in `.design-sync/previews/Modal.tsx`: wrap
each story's return value in a `<div style={{ height: '100vh' }}>` so the
transformed ancestor gets a real height. If a future component also uses
`position:fixed`/`position:absolute` overlay styling with `cardMode:
"single"`, apply the same wrapper.

Also hit early on: `cfg.overrides.Modal.viewport` — don't set this smaller
than the default `900x700` "just to tighten the card"; the render-check
screenshot itself is always taken at a fixed 1200x800 regardless of the
declared viewport (that value only sizes the card in the actual product),
so a too-small explicit viewport has no effect on the render-check but
signals a size the product will actually use — leave it at the default
unless the content genuinely needs more room.

Also: `TabGroup`'s root needed `display: inline-flex`, not `display: flex`
— as a block-level flex container it stretched to its parent's full width
whenever the parent was a plain block (visible on the `segmented` variant,
whose background pill made the stretch obvious; `glyph`/`chips` didn't
visibly reveal it since their variants have no full-width background).

## Re-sync risks

- The whole component set was hand-authored from `index.html` at one
  point in time (2026-07-17). If `index.html`'s visual language changes
  (new color tokens, new component patterns), `design-system/src/` needs
  manual updates to match — nothing here detects that automatically.
- All 12 previews are hand-authored (`.design-sync/previews/*.tsx`), not
  ported from real docs/stories (this repo has neither) — they're
  compositions I judged representative of real usage. A future maintainer
  changing the actual `index.html` UI should sanity-check whether the
  preview scenarios (e.g. `PracticeCard`'s `WordComplete`/`InProgress`
  states, `CharacterTile`'s tone set) still match real app behavior.
- No `docsDir`/`docsMap` configured — every `.prompt.md` is synthesized
  from `.d.ts` + previews (0/12 matched real docs, since none exist).
- Network flakiness observed once during validate: a `page.goto` timeout
  on `PracticeCard.html`, most likely the Google Fonts remote `@import`
  fetch stalling. Non-deterministic — a retry resolved it clean. If a
  future re-sync sees a single random `[RENDER]` timeout, retry once
  before treating it as a real bug.
