## Setup

No provider or wrapper is required — every token has a sane dark-mode
default at `:root`, so components render correctly with zero setup. To
switch a subtree to the light theme, add the `tt-theme-light` class to any
ancestor element (it overrides the theme custom properties; components
underneath re-render with no extra markup):

```jsx
<div className="tt-theme-light">
  <AppHeader ... />
</div>
```

One surface never follows this toggle: `PracticeCard` and `CharacterTile`
render on a fixed cream "paper" surface (`--tt-paper-*` tokens) in both
themes — that's intentional, not a bug to "fix" by wrapping them in
`tt-theme-light`.

## Styling idiom: CSS custom properties, no utility classes

There is no Tailwind-style utility vocabulary and no prop-based style
system — components read from a small token set of CSS custom properties.
When you need to color something to match the system (a layout wrapper,
a custom composition), use these real tokens directly, never invented ones:

| Token | Role |
|---|---|
| `--tt-bg` / `--tt-bg-rgb` | page background |
| `--tt-ink-rgb` | primary text/border (use as `rgb(var(--tt-ink-rgb))` or `rgba(var(--tt-ink-rgb), N)`) |
| `--tt-input-bg` | form-field background |
| `--tt-accent` / `--tt-accent-rgb` / `--tt-accent-ink` | brand accent + its foreground text color |
| `--tt-warn` / `--tt-warn-rgb` | destructive/error |
| `--tt-font-display` | `Unbounded` — headings, counters, big numerals |
| `--tt-font-body` | `Space Grotesk` — everything else |
| `--tt-font-mono` | `JetBrains Mono` — badges/codes |
| `--tt-paper-bg` / `--tt-paper-ink` / `--tt-paper-accent` / `--tt-paper-gray` / `--tt-paper-red` / `--tt-paper-green` | the fixed cream practice surface — always these values, regardless of theme |

Colors are stored as `R, G, B` triplets (not full `rgb()` strings) so call
sites can control alpha: `rgba(var(--tt-ink-rgb), 0.45)`.

## Where the truth lives

Read `styles.css` (it `@import`s the compiled component stylesheet plus the
Google Fonts `@import` for Unbounded/Space Grotesk/JetBrains Mono) before
styling anything by hand — it's the full token/style closure every design
built with this system actually receives. Each component's `.prompt.md`
documents its own prop API; trust that over guessing.

## Composing a typing drill (the system's signature pattern)

`PracticeCard` is a shell — it does not generate the character row itself.
Compose it with `CharacterTile`, one tile per syllable/letter, and drive
`tone` from typing progress (`pending` → `active` → `correct`/`incorrect`):

```jsx
<PracticeCard
  counter="3 / 42"
  badge="NO.003"
  masteryFilled={2}
  romanization="Jeongok"
  onFavorite={...} onNotes={...} onRestart={...}
  inputProps={{ placeholder: '여기를 눌러 입력을 시작하세요' }}
  onPrev={...} onNext={...}
>
  <CharacterTile text="전" tone="correct" underline="dashes" slots={['ok', 'ok']} />
  <CharacterTile text="곡" tone="active" underline="dashes" slots={['ok', 'empty']} />
</PracticeCard>
```

Use `underline="dashes"` with a `slots` array for Hangul syllables (one
slot per 초성/중성/종성); use `underline="bar"` with `size="en"` for
individual Latin letters instead.
