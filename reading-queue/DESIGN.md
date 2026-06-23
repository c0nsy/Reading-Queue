# Reading Queue — UI / Product Plan

> Working design target so we're building toward *something*, not styling in a vacuum.
> This is a product/UX doc, intentionally separate from `reading-queue-project.md` (the React-learning curriculum).
> Styling effort is deliberately deferred until the functionality behind each piece exists.

## Product in one line
Paste a URL → it fetches the article's metadata → you tag it, filter/search/sort your queue, reorder it, and mark things read. A personal "read-it-later" you actually trust.

## Core screen — the Queue (single main view)

```
┌─────────────────────────────────────────────────────────────┐
│  Reading Queue                              [🌗 theme]        │  ← Header
│  ┌───────────────────────────────────────────────┐ [Add]     │  ← Add-URL form (Task 14)
│  │ paste a url…                                   │           │
│  └───────────────────────────────────────────────┘           │
├─────────────────────────────────────────────────────────────┤
│  🔎 search…   sort:[date ▾]   status:[all ▾]   #tags ▾        │  ← Toolbar (Task 6 reducer, Task 10 tags)
├─────────────────────────────────────────────────────────────┤
│  ⠿  Title of the article                        ● unread     │  ← Article row (drag handle = Task 12)
│     example.com · 4 min · #react #ts            [mark read]   │     (optimistic, Task 13)
│  ⠿  Another article…                            ◐ reading     │
│  ⠿  …                                                         │
└─────────────────────────────────────────────────────────────┘
```

## Secondary screen — the Reader view (Task 16)
Click a row → a focused, typography-first reading pane (full text / parsed content).
- Code-split via `React.lazy` + `Suspense` (its JS must not be in the initial bundle).
- Wrapped in an error boundary so a bad URL can't white-screen the app.

## Component inventory → mapped to the task roadmap
| UI piece | Task | Notes |
|---|---|---|
| ThemeProvider + toggle | 3 ✅ / 4 | warm-up now; re-render fix in Task 4 |
| Provider composition (Theme + Query + app state) | 5 | flatten the pyramid |
| Toolbar: search / sort / status / tags | 6 | one `useReducer`, UI intent only |
| Article list (server state) | 7 | TanStack Query, loading/error states |
| `useArticles(filters)` | 8 | clean consumer interface, derived filtering |
| Search stays smooth @ 2k items | 9 | `useDeferredValue` |
| `<TagFilter>` compound component | 10 | shares state via context |
| List-item memoization | 11 | measure first, then `React.memo` |
| Drag-to-reorder rows | 12 | stable `key`, not index |
| Mark-as-read | 13 | optimistic + rollback |
| Add-URL form | 14 | `useActionState`, pending/error |
| Reader view | 16 | lazy + Suspense + error boundary |
| Server-rendered list | 17 | RSC boundary |

## Visual direction (when we actually style — post-functionality)
- **Content-first, calm.** It's a *reading* app: generous whitespace, strong typography, low chrome. Think Instapaper/Reader, not a dashboard.
- **Neutral palette + one accent.** Zinc/slate grays; a single accent for primary actions (Add, links). Light + dark parity.
- **Status as quiet signal:** small colored dot/label (unread / reading / archived) — not loud badges.
- **Density:** comfortable rows, scannable. Drag handle appears on hover.
- **Dark mode:** class-driven (`.dark` on `<html>`), Tailwind v4 `@custom-variant`.

## Deliberately NOT doing yet
- No routing/multi-page until the reader view (Task 16).
- No auth, no real backend persistence until the data layer (Task 7) forces the decision.
- No heavy component library — hand-build the pieces the tasks teach (compound components, etc.).
- No pixel polish until the feature behind it works.
