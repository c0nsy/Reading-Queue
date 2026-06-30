# LEARNINGS — Reading Queue

> **How to use this doc:** Read it at the *start* of each task to reload what you already
> earned. It's organized per task: **the concept**, **the mistakes I actually made** (so I
> can spot the pattern when I'm about to repeat them), and **how to remember**. The mistakes
> matter more than the right answers — the right answer is googleable; the trap you keep
> falling into is not.
>
> This is *my* reflection log, separate from `reading-queue-project.md` (the curriculum) and
> `reading-queue/DESIGN.md` (the product plan).

---

## Cross-cutting principles (the stuff that shows up in every task)

- **Value-space vs type-space.** TS has two parallel worlds. `useState` (a function you *call*)
  lives in value-space; `Dispatch<SetStateAction<Theme>>` (the *shape* of its setter) lives in
  type-space. `() => {}` (a function body) is a value; `void` (what it returns) is a type. I kept
  trying to put a *value* where a *type* goes (`setTheme: useState`). **When the slot is after a
  `:` in a type, it wants a type. When it's after `=`, it wants a value.**
- **Identity vs equality.** Two objects with the same contents are *not* the same reference.
  `{a:1} !== {a:1}`. React leans on `===` (identity) constantly to decide "did this change?".
  Primitives (`'light'`, `5`, `true`) compare by *value*, so they sidestep the whole problem.
  **Most of my React re-render bugs were really identity bugs in disguise.**
- **Calling vs passing a function.** `onClick={fn}` hands React the function to call later.
  `onClick={fn()}` calls it *now* and hands React the result. `onClick={setTheme}` passes the
  click *event* as the argument. When I want to call with my *own* args, I wrap: `onClick={() => fn(x)}`.
- **Valid syntax in → tooling out.** When IntelliSense/autocomplete goes silent, my first
  suspicion should be: *the file doesn't parse.* The language server can't help with broken JSX.
  Fix the syntax error first, then expect suggestions.
- **Stale caches lie.** When behavior doesn't match my code, suspect the build cache (`.next`)
  before I suspect my understanding. Kill the dev server, delete `.next`, restart clean, *then*
  re-diagnose.
- **The contract:** I'm here to learn, not to be unblocked. "Just do it" is me robbing myself.
  Effort first, then a *narrowed* hint, then I still write it.

---

# React General Concepts — Cheat Sheet

> Reusable React mechanics, pulled out of the per-task narratives below. Each card:
> **what it is / when to reach for it / how / the gotcha I hit.** This is the part to skim fast.

## Re-rendering — when does a component actually re-render?

A component re-renders when **one** of these happens:
1. its **own state** changes (`setX`),
2. its **parent re-renders** (and it isn't bailed out — i.e. props are referentially equal, or it's `React.memo`'d),
3. a **context it consumes** gets a new value **identity**.

- **Gotcha:** *re-render ≠ DOM update.* "Re-render" means React re-runs the component function and
  diffs; it only touches the DOM if the output actually changed. So a render isn't automatically
  "bad" — it's wasted only when nothing it produces changed.
- **Gotcha:** the DevTools "highlight updates" boxes wrap DOM *regions* and overstate what
  rendered. **`console.log` at the top of a component is ground truth.**

## Referential equality (identity vs value)

- Objects, arrays, and functions compare by **identity** (`===`): `{a:1} !== {a:1}`. A fresh literal
  every render is a **new** reference.
- Primitives (`string`, `number`, `boolean`) compare by **value** — `'light' === 'light'`. They
  dodge the whole problem.
- React leans on `===` everywhere to answer "did this change?" — context values, `memo` props,
  `useMemo`/`useEffect` deps. **Most of my re-render bugs were identity bugs wearing a costume.**
- **Reflex:** if I'm building a new object/array/function in render and handing it somewhere that
  cares about `===`, ask whether it could be a primitive, a stable value, or memoized.

## Context — `createContext` / `Provider` / `useContext`

- **What:** broadcast a value to an entire subtree with **zero prop drilling.**
- **How:** `createContext<T>(default)` (the `<T>` generic **pins the type**; the `default` is the
  **no-Provider fallback**) → wrap with `<Ctx.Provider value={…}>` → read with `useContext(Ctx)`
  (returns the nearest provider's value above you).
- **Key facts:**
  - A Provider is **not a global** — its scope is exactly its subtree.
  - `useContext` **subscribes to the whole value object, not the fields I destructure.** Any change
    to the value's *identity* re-renders **every** consumer, even ones reading nothing that changed.
  - **Split state & dispatch into two contexts** so a dispatch-only consumer doesn't re-render when
    state changes (the stable setter lives in its own context whose identity never changes).
  - **Pass primitives / stable functions directly** as `value` → no object to rebuild → no `useMemo`.
- **Gotchas:** missing Provider → consumer silently falls back to the **default** (symptom: a value
  frozen at its initial). `createContext` with no `<T>` infers too-loose a type (`string` instead of
  my union). Nesting order only matters if an inner provider **consumes** an outer one.

## `useMemo`

> Built around the exact things I kept mixing up.

**One-line model:**
```jsx
const value = useMemo(() => ({ ob1, ob2 }), [ob1]);
```
*"Snapshot `{ ob1, ob2 }`. Watch `ob1`. Changed? No → hand back the **same cached** object. Yes →
build a **fresh** object."*

**Two stages — keep them separate:**
- **Stage 1 — `useMemo` decides identity:** deps unchanged → return *same* object; deps changed →
  return *fresh* object. **`useMemo` never renders anything.** It sets the object and walks away.
- **Stage 2 — consumers react:** got same object → skip rendering; got fresh object → re-render.
- *Doorbell:* useMemo decides whether to swap the object; the consumers wake or stay asleep based on
  what they got. **useMemo sets the condition; the consumers do the reacting.**

**My five mix-ups:**
1. **"useMemo causes re-renders."** No — it only decides **object identity** (Stage 1). The
   re-render is a *downstream* consequence handled by consumers (Stage 2).
2. **Saying "re-render" when I meant "rebuild the object."** useMemo's yes/no is about *whether it
   builds a new object*, not whether anything renders.
3. **Thinking deps = "pick one representative."** It's **"list every ingredient that can change."**
   `[ob1]` is only correct if `ob2` can *never* change; otherwise `ob2` goes **stale** (cached
   object still holds the old `ob2`).
4. **Reading deps as a *prediction* ("ob1 could change") instead of an *instruction* ("watch ob1;
   when it changes, rebuild").** I'm telling React what to react to, not guessing the future.
5. **`[setTheme]` "because the setter never changes."** Trap: a setter from `useState` is stable
   forever → deps never trip → **same object forever → `theme` is frozen too.** Toggling does
   nothing. `theme` is the *whole reason* the object must be reactive, so `theme` is exactly what
   belongs in deps. (It only *looked* like "pick one" because `setTheme` wasn't even **eligible** to
   change — the set of changeable ingredients had one member.)

**Condensed rules:**
1. useMemo **decides object identity**; it never renders.
2. Deps = **every ingredient whose change should rebuild the result.** List all of them.
3. Only safe to omit values **guaranteed never to change** (e.g. `useState` setters) — and including
   them is harmless.
4. **Never** keep the stable ingredient in deps while dropping the changeable one — that's the
   stale-snapshot bug.
5. Per-ingredient gut-check: *"Delete it from deps — if it changes, does the output go stale? Then
   it belongs."*

**Safety net:** ESLint `react-hooks/exhaustive-deps` flags exactly this (`[setTheme]` → *"missing
dependency: 'theme'"*). When it yells, the stale-snapshot bug is usually what it's protecting me
from — don't silence it without understanding why.

**When do I even reach for `useMemo`?** Only when I'm handing an **object/array/function** somewhere
that compares by identity (a context value, a `memo`'d child's prop, another hook's deps) **and** the
provider/parent re-renders for unrelated reasons. If the value is a **primitive** or already
**stable**, I don't need it — *that's* why Task 4 ended with the memos deleted.

## `useReducer`

- **What:** manage related state through a **pure function** `(state, action) => newState`, updated by
  **dispatching actions** instead of calling setters directly.
- **When:** several state values that change **together**, atomic multi-field updates, or the next
  state depends on the previous. **Not** for a single independent primitive — that's `useState`.
- **How:** `const [state, dispatch] = useReducer(reducer, initialState)`. You call `dispatch(action)`;
  React then calls `reducer(currentState, action)` **for you**; the returned object becomes the new
  state → re-render.
- **Vocabulary (the part I kept not having words for):**
  - **action** = an object literal describing *what happened*: `{ type, ...payload }`. `type` is the
    **discriminant** (picks the `switch` case); the other fields are the **payload** (the data).
  - **reducer** = the pure function. No mutation, no side effects. Returns a **new** object:
    `{ ...state, field: action.x }` — copy everything, override one field. **PATCH, not PUT.**
  - **dispatch** = the "mail slot." I drop an action in; I **never call the reducer myself.**
- **Why over four `useState`s:** one central place for all transitions; atomic multi-field updates
  (one "reset" action vs four setters); pure → testable with zero UI; scales as fields grow.
- **Gotchas:** state holds **values**, not action objects. Initial state must be **complete** (every
  required field). Put the `never` exhaustiveness check in `default`. The pure reducer file should
  **not** import `useReducer` — that hook is called in the *component*, not the reducer.

## `useEffect` — sync state to an external system

- **What:** run a side effect *after* render to keep an **external** system in sync with React state.
- **When:** the system is **not** React — toggling a DOM class (`.dark` on `<html>`), subscriptions,
  timers, listeners. **Not** for deriving a value from props/state (do that in render). Fetching in an
  effect is the classic anti-pattern — but for Task 7 I'm **hand-rolling** it on purpose (no data
  library) to feel what a query lib does for me. See the *Fetching server state by hand* card.
- **How:** `useEffect(fn, [deps])` re-runs when a dep changes; `[]` = once on mount; no array =
  every render. Same identity rules apply to the deps array.

## Functional state updaters

`setX(prev => next)` vs `setX(value)`. Use the **updater form** when the new value depends on the old
(`setTheme(prev => prev === 'light' ? 'dark' : 'light')`) — it reads the latest state and avoids
**stale closures**.

## Event handlers in JSX (calling vs passing)

- `onClick={fn}` **passes** the function (React calls it on click, with the **event** as the arg).
- `onClick={fn()}` **calls it now**, during render, and passes the *result*.
- To call with my **own** args: wrap it — `onClick={() => fn(x)}`.
- `value={expr}` is an **expression** slot; `value='literal'` is a plain **string** (and has nothing
  to autocomplete).

## Server vs Client Components (Next App Router)

- **Server Component (default):** runs on the server, can touch DB/filesystem, ships **zero JS**, but
  **no** hooks / state / event handlers.
- **`'use client'`** marks a boundary: that file and everything it renders downward is a **client**
  component (hooks, state, handlers allowed).
- A page can stay a Server Component and mount small **client islands** (like `ThemeProvider`) where
  interactivity is needed.

## Custom hooks — extracting stateful logic

- **What:** a function named `useX` that *calls other hooks* and returns whatever shape the caller
  needs. It packages `useState`/`useEffect` so components don't repeat them.
- **Two Rules of Hooks (and *why*):**
  1. **Call hooks only at the top level** — never inside `useEffect`, a callback, a condition, or a
     loop. React identifies each hook purely by **call order**, which must be identical every render.
     Hiding a hook inside an effect/branch breaks that bookkeeping → "Invalid hook call."
  2. **Call hooks only from React functions** (components or other hooks), not plain functions.
- **Where it lives:** module scope / its own file (`app/hooks/`), **not** nested inside a component
  (a hook defined inside a component is rebuilt every render and can't be reused).
- **Consuming pattern:** call at the **top level**, **read the return directly** —
  `const { data, isLoading, error } = useThing(arg)`. The hook **owns** that state.
- **Gotchas I hit:** defined a hook but never *called* it (defining ≠ using); called it *inside*
  `useEffect`; copied its return into a **second `useState`** (second source of truth) and called
  `setX` **in the render body** → **infinite loop**. The hook already holds the state — just use it.

## What React will (and won't) put on screen

- **Visible:** **strings and numbers** only.
- **Renders as nothing** (no error): `null`, `undefined`, `false`, `true`. A bare boolean
  (`<h1>{loading}</h1>`) shows **empty** — booleans don't display.
- **Throws** *"Objects are not valid as a React child"*: a plain object, an array of objects, an
  **`Error` object**. To show an error, render a **string** off it (`error.message`), not the object.
- **To show nothing on purpose, `return null`** — don't return an empty tag.
- **Gotcha:** `error` typed `unknown` → narrow before `.message`:
  `error instanceof Error ? error.message : String(error)`.

## Fetching server state by hand (Task 7, no data library)

- **Three phases of one fetch:** *pending* (loading) → *fulfilled* (data) → *rejected* (error).
  One request = **one** `isLoading` + **one** `error` + the data. Model and render all three.
- **`fetch` does NOT throw on `4xx`/`5xx`** — only on a *network* failure. A `500` still **resolves**
  with `response.ok === false`. Check `if (!response.ok) throw …` **before** `.json()`, or the
  `catch`/error state never fires.
- **`response.json()` returns `any`** — the wire is untyped (where Zod would later go).
- **Loading/error live where the async work happens** — at the list level, **not** per-card. A
  presentational card does no async (and during loading there are *zero* cards anyway).
- **StrictMode double-fires effects in dev** to expose effects that aren't safe to run twice — a
  preview of Task 15's race/cleanup work. Don't disable it.
- **Measuring:** a `console.log` in the component body counts **renders**, not **fetches**. Count
  fetches in the **Network tab** (DevTools' `installHook.js` echoes aren't extra work).
- **Next.js *is* the backend** — App Router **Route Handlers** (`app/api/.../route.ts`) serve JSON;
  no Express. Same-origin → fetch a **relative** path (`/api/articles`); dev is **http**, not https.
- **Still owed (what a library would give):** dedup / shared cache (two components → one fetch),
  no-empty-flash on refetch. That's ③.

---

## Task 1 — Stack decision (Next.js vs Vite)

**Concept:** I chose **Next.js (App Router) + React 19 + Tailwind v4** — not because it's popular,
but because **Task 17 requires React Server Components**, which Vite's client-only SPA model can't
do. The decision was driven by a concrete future requirement, not vibes.

**The three things I kept conflating (untangle these every time):**
- **SSR** = render HTML on the server for the *first paint*, then hydrate on the client.
- **RSC (Server Components)** = components that run *only* on the server, can touch the
  DB/filesystem directly, and ship **zero JS** for themselves to the client. Can't use hooks or
  event handlers.
- **"Stop fetching in `useEffect`"** = a *client* data-fetching anti-pattern. Unrelated to the
  above two — it's about *when/where* you fetch, not server vs client rendering.

**Mistakes:**
- Treated SSR and RSC as the same thing. They're not — SSR is *where the HTML is generated*; RSC
  is *where the component code runs and what it's allowed to do*.
- Almost justified the choice with "everyone uses Next." The contract rejects popularity as a
  reason. The real reason was Task 17.

**How to remember:** *"Vite can't do 17."* One requirement killed the alternative. And the
ladder: **SSR = first paint, RSC = no-JS server code, useEffect-fetch = a separate sin.**

---

## Task 2 — Domain types (discriminated unions)

**Concept:** A **discriminated (tagged) union** = several object shapes that all share **one common
property name** (the *discriminant*), each with a **distinct literal value** for it. TS uses that
literal to *narrow* which member you're holding inside a `switch`. **Exhaustiveness check:** a
`default` branch that assigns the value to a `never` parameter — if I add a new union member and
forget to handle it, TS errors because the un-handled member isn't `never`. The compiler becomes
my checklist.

**The distinction I kept missing:**
- **String-literal union** = `"unread" | "reading" | "archived"` — a value is *one of* these strings.
- **Discriminated union** = `ActionSort | ActionSearch | ...` — a value is *one of these object
  shapes*, told apart by a shared `type` field.

**Mistakes:**
- `type: string` on each member — a plain `string` **can't discriminate**; the whole point is the
  *literal* (`type: "sort"`), so TS can tell members apart.
- `type: ActionType` (a circular alias) instead of a concrete literal per member.
- Thought every member needed a *different* property name. No — **same property name, different
  literal values.** (`type: "sort"` vs `type: "search"`.)
- Got `Argument of type 'X' is not assignable to parameter of type 'never'` and panicked — that
  error is the exhaustiveness check **working**: a member reached `default` un-handled.

**`never` has TWO jobs in this pattern (Task 6 made this click):**
- **As the parameter** `assertUnreachable(x: never)` — proves *exhaustiveness*. If I forget a case,
  the leftover action isn't `never` and won't fit the param → compile error.
- **As the return type** `assertUnreachable(...): never` — tells the compiler the function **never
  returns / terminates control flow.** If I type it `: void` instead, the compiler thinks control
  *continues past the call*, falls through to the end of the reducer, and implicitly returns
  `undefined` → *"Function lacks ending return statement."* The fix is `void → never`. The compiler
  doesn't know it throws (that's a runtime fact); `never` is how I *tell* it "execution stops here."
- **The distinction to keep straight:** `void` = "returns normally, no useful value (control
  continues)"; `never` = "does not return at all (control does **not** continue)."

**Why not `enum`?** String-literal unions are simpler, have zero runtime footprint (enums emit JS
objects), serialize cleanly, and play perfectly with discriminated unions. Reached for them on
purpose, not by default.

**How to remember:** *"Same label, different values, and `never` is the bouncer that checks I
handled everyone."*

---

## Task 3 — First custom provider (Context)

**Concept:** `createContext<T>(default)` makes a context. The `<T>` generic **pins the type the
context carries** — without it, TS infers `T` from the default value and usually guesses too loose
(e.g. `string` instead of my union). The **default value is the no-Provider fallback**: it's what
`useContext` returns when there's no matching `Provider` above the consumer. A `Provider`'s
`value` prop is the data being broadcast to *every descendant* that calls `useContext` — **zero
prop drilling**. A Provider is **not a global** — its scope is exactly its subtree.

**Also learned here:**
- `useEffect` to **sync state → an external system** (toggling `.dark` on `<html>`) is a *legit*
  use of effects — different from the fetch anti-pattern. Dependency array `[theme]` = "re-run
  when theme changes."
- **Functional updater** `setTheme(prev => ...)` reads the latest state and avoids stale closures,
  vs closing over a possibly-stale `theme`.
- **JSX:** `value=''` is a *string* attribute (nothing to autocomplete); `value={}` is an
  *expression* slot. Strings have nothing to complete — that's why suggestions were empty.
- **Tailwind v4 dark mode is CSS-first:** `@custom-variant dark (&:where(.dark, .dark *));` in
  `globals.css`, **not** v3's `tailwind.config darkMode`.

**Mistakes:**
- `createContext({...})` with no generic → it inferred the wrong type → `value={{...}}` "not
  assignable to `string`". Fixed by adding the `<T>` generic.
- `onClick={setTheme((prev)=>...)}` — *called* it during render instead of passing a handler.
  Wrapped in `() =>`.
- `classList.toggle('dark', someString)` — passed a *string* (always truthy) as the toggle force;
  it needs a **boolean** (`theme === 'dark'`). Also briefly inverted the condition.
- Dark mode "not working" was a **stale `.next` cache**, not my code. Burned a lot of time before
  checking the served CSS.

**How to remember:** *"Generic pins the type, default is the no-Provider answer, Provider scopes a
subtree (not a global). `value={}` to compute, `value=''` for a literal string."*

---

## Task 4 — Break the provider, then fix it (re-renders & referential equality)

**Concept:** This is the one to internalize. Three layered truths:

1. **`value={{ theme, setTheme }}` builds a brand-new object every render.** New identity →
   *every* consumer re-renders, even ones that read nothing that changed.
2. **`useContext` subscribes to the WHOLE value object, not the fields I destructured.** React
   can't see that `SetOnly` only used `setTheme`. It only knows "this component reads this
   context, and the context's value got a new identity → re-render." Destructuring is just me
   picking fields off an object I already received in full.
3. **`setTheme` from `useState` is referentially stable** — same function every render, forever.
   The *only* thing that actually changes is `theme`. But bundling them in one object **drags the
   stable setter into re-renders** whenever `theme` changes.

**The fix ladder (and what each rung does NOT solve):**
- **`useMemo(() => ({theme,setTheme}), [theme])`** stabilizes the object's identity so an
  *unrelated* provider re-render (my `count` button) doesn't churn consumers. **It does NOT** stop
  a `setTheme`-only consumer from re-rendering when `theme` changes — because theme changing
  *correctly* makes a new memoized object.
- **Split into two contexts** (`ThemeStateContext` holds `theme`, `ThemeDispatchContext` holds
  `setTheme`). The dispatch context's value never changes identity → dispatch-only consumers go
  **silent** on theme change. **Cost:** more boilerplate, two providers to nest, and a component
  that needs *both* now reads two contexts.
- **Passing primitives directly** (`value={theme}`, `value={setTheme}`) means there's **no object
  to stabilize**, so `useMemo` disappears entirely. The memo only ever existed to babysit an
  object I shouldn't have been building.

**Mistakes (this task was a minefield — these are the patterns to watch):**
- **Cargo-culting the fix:** added `useMemo` *before* ever watching the broken version re-render.
  The spec names this trap. **Make it break → SEE it in the profiler/console → then fix.**
- **No control variable:** every button toggled `theme`, so *everything* re-rendering looked like
  a bug but was correct (theme really changed). Needed an *unrelated* `count` state to re-render
  the provider *without* changing theme — only then can I tell a real over-render from a correct one.
- **Trusted the DevTools highlight boxes** over the `console.log`. The boxes wrap DOM *regions* and
  look like "everything rendered." The `console.log('SetOnly rendered')` is **ground truth.**
- **Re-wrapped values in objects, then memoized them back to safety** — reintroduced the exact
  problem I'd just removed. If I'm memoizing an object into a context, ask first: *does this need
  to be an object at all?*
- **Type/value mismatch:** typed the context `<Theme>` (a string) but passed `{theme}` (an object).
  Generic and value have to describe the *same shape*. Pick one lane (primitive) and apply it
  across the provider *and* the consumers.
- **Deleted a provider by accident:** simplified down to only `ThemeDispatchContext.Provider` and
  dropped `ThemeStateContext.Provider`. The state consumer silently fell back to the **default**
  value (`'light'`) and the label froze. Symptom of a missing provider = consumer stuck on the
  default.
- **`onClick={setTheme}`** again — passed the click event as the new theme. (Same calling-vs-passing
  lesson from Task 3.)

**How to remember:**
- *"Context subscribes to the whole object, not the field."* (Why `SetOnly` re-rendered.)
- *"The setter is stable; only the state changes — don't bundle them."* (Why splitting works.)
- *"Primitives don't need `useMemo`; objects do — so prefer primitives."*
- *"Break it, SEE it, then fix it. The `console.log` is truth, the highlight boxes lie."*
- *"Consumer stuck on the default value = I forgot the Provider."*

---

## Task 5 — Compose providers without a pyramid

**Concept:** As providers pile up (theme, query cache, app-state…), naive root nesting becomes a
"pyramid of doom." Fix: extract **one** `'use client'` `Providers` component that takes `children` and
nests all providers inside it, then mount it **once in `layout`** (not `page`) so it's app-wide. No
third-party library — composing providers is just a component. Reaching for a "combine providers"
helper before you have enough providers is **premature abstraction** (same sin as premature
optimization).

**Mistakes:**
- `function Provider(children: ReactNode)` — took `children` as a **positional parameter**. A React
  component receives **one `props` object**; `children` is a **property** of it. Must destructure:
  `({ children }: { children: ReactNode })`. (The error was the cryptic *"... not assignable to
  `ReactPortal` … missing type, props, key"* — that's TS trying to match my `{children}` object
  against `ReactNode`'s portal shape because I'd typed the *whole props* as `ReactNode`.)
- Named it `Provider` (singular) — reads like a single context provider; `Providers`/`AppProviders`
  signals "stack of providers."

**How to remember:** *"A component gets ONE props object; `children` lives inside it."* And:
*"Moving providers to `layout` is a real win (all routes get them); extracting the nesting into a
component is organizational. Provider **order** only matters when one provider consumes another."*

---

## Task 6 — Toolbar state with `useReducer`

**Concept:** One reducer manages the toolbar's four related fields (search / sort / status / tags).
The reducer is **pure** `(state, action) => newState`, building a new state immutably
(`{ ...state, field }`). Actions are object literals describing events; `dispatch` sends them; React
runs the reducer. (See the `useReducer` cheat-sheet card for the full vocabulary.)

**The distinctions that cost me the most time:**
- **STATE ≠ ACTIONS.** State holds the *current values*; actions describe *events*. I first stored
  the **action objects** as state (`search: ActionSearch`) — wrong. State fields are **value types**
  (`search: string`, `sort: ActionSort["sortBy"]` via indexed-access — DRY, derives from the action).
- **"all" is a FILTER value, not an article status.** I "fixed" a missing-`"all"` error by adding
  `"all"` to `ArticleStatus` — which then lets a real `Article` be `"all"` (nonsense). Keep the
  domain type clean (3 real states); type the **filter** fields `ArticleStatus | "all"`. **Different
  needs → different types** (same lesson as state-vs-action).
- **Types don't go on values inside an object literal.** I wrote `status: "all": SomeType` trying to
  annotate a value. There's no such syntax — the type lives on the **variable/field/interface**, and
  whether `"all"` is allowed is decided *there*, not at the usage site. (Value-space vs type-space,
  again.)
- **Initial state must be COMPLETE.** A TS object literal must satisfy *every required* field — I
  passed `{ search: }` and got "missing sort, status, tags."

**How to remember:**
- *"action = a described event (`type` picks the case, payload carries data); `dispatch` = the mail
  slot; reducer = the one pure function; state = current values."*
- *"State stores values, not the actions that produced them."*
- *"An article's status is what it IS; a filter's status is what I'm SHOWING — `'all'` belongs only
  to the filter."*
- *"A type never goes on a value inside `{ }` — it goes on the variable/field the object flows into."*

---

## Task 7 — Server state, hand-rolled (decision: no data library)

**Decision:** Dropped TanStack Query — **hand-rolling** server state to learn what a query lib does
internally. Traded "know the industry tool" for "understand the machine." (Updated `reading-queue-project.md`
to match: Tasks 5/7/8/13/15/16 now hand-rolled.)

**Concept — server state ≠ client state:** the difference isn't *mutability* (toolbar state changes
constantly too). It's **ownership / source of truth.** `theme`/`toolbar` are *born and live in the
browser* — the browser **is** the truth. The article list **lives on a server**; what I hold is a
**cached copy** — *async to fetch, can fail, can go stale*, none of which `useState` models. (A desk
note I authored vs. a shared Google Doc someone else can edit.)

**Things that clicked:**
- **Validation ≠ acceptance.** Zod makes a payload *well-formed*; it doesn't make the server *agree*.
  The server owns fields I don't (`id`, `createdAt`, dedup rules) → my optimistic copy can drift even
  with perfect validation. *Well-formed ≠ final truth.*
- **Two mutation strategies:** refetch after a change (always correct, costs a round-trip) vs. patch
  the local cache (instant, risks drift). Same copy-vs-truth tension, at write time.
- **Metadata fetch is a different operation.** "Fetch the saved list" (on mount → `Article[]`) vs.
  "look up a pasted URL's title/image" (on a user action, an *unsaved candidate* → a preview).
  Different trigger/input/output → **different hook**, and it belongs to **Task 14**, not here.

**Mistakes (this task's pattern: I keep reaching past the simple thing):**
- **Re-made the Task-5 bug:** `ArticleCard(id, url, title, status)` — four **positional params**. A
  component gets **one props object** → destructure. Error: *"Target signature provides too few
  arguments. Expected 4, got 1"* (React calls components with **1** arg).
- **Inverted the error gate:** `{!error && <ErrorMessage/>}` showed the error UI when there was **no**
  error. Want `{error && …}` (or self-gate inside the component, `return null` when none).
- **`<Error>`** = the global JS class, not my component. Never shadow built-ins → named it `ErrorMessage`.
- **Tried to render non-renderables:** `<h1>{loading}</h1>` (boolean → blank), `{error}` (object →
  crash). Render a **string**; `return null` for nothing. (See *What React will render* card.)
- **Hook misuse:** called `useFetchArticles` **inside `useEffect`**; copied its return into a **second
  `useState`** and called `setArticles` **in the render body** → infinite loop. The hook owns the
  state — call at top level, read the return.
- **Map returned nothing:** `(a) => { <Card/>; }` (block body, no `return`) → `undefined[]`. Use
  `(a) => ( <Card/> )`. Every mapped child needs a **`key`** (`key={article.id}`).
- **Forgot `fetch` doesn't throw on `500`** → planned an error state that would never fire without
  `if (!response.ok) throw`.
- **`https://localhost`** (dev is **http**) + hardcoded host → just `/api/articles`.

**How to remember:**
- *"Server state = a cached COPY of someone else's truth; client state = my own desk note."*
- *"Components take ONE props object — always."* (The bug that keeps coming back.)
- *"React shows strings & numbers; objects throw, booleans vanish; `return null` for nothing."*
- *"`fetch` resolves on 500 — check `response.ok` or the error never fires."*
- *"The hook owns its state — call it at the top, use the return; don't re-store it."*
- *"Loading/error live where the async work is — one fetch, one loading, not per-card."*

---

## Smells → reach-for-this (the "when do I use X" table I keep asking about)

> The meta-skill: **learn the *pain* each tool relieves, not its API.** Start with the simplest thing
> (`useState`, plain props, compute-in-render) and let the pain *pull* you to the heavier tool. If I
> can't state the problem a tool solves in one sentence, I don't need it yet. Feel the wrong way once
> (Task 4 literally made me) — felt pain beats memorized rules.

| Smell (the pain I'm feeling) | Reach for | Why |
|---|---|---|
| Threading the same prop through 3+ layers that don't use it | **Context** | Broadcast to the subtree; kills prop drilling |
| Several state values that **change together** / atomic multi-field updates / next state depends on prev | **`useReducer`** | One pure place for all transitions; atomic; testable |
| A new object/array/function identity **every render** causing wasted re-renders downstream | **pass a primitive / stable value, or `useMemo`/`useCallback`, or split context** | Stabilize identity so `===` checks pass |
| A **dispatch-only** consumer re-rendering when unrelated state changes | **split state & dispatch into two contexts** | Isolate the thing that changes from the thing that doesn't |
| Need to sync React state to a **non-React** system (DOM, subscription, timer) | **`useEffect`** | After-render side effect; the legit use of effects |
| A value can be **computed from** props/state | **just compute it in render** (NOT `useEffect` + state) | Derived data isn't state; storing it invites drift |
| One independent primitive (a boolean, a string) | **`useState`** | Don't over-reduce; simplest tool that works |
| "Can this value be X?" depends on *whose* value it is (article vs filter) | **separate types** | Different needs → different types; don't pollute the domain type |
| Data that lives on a **server** (async, can fail, can go stale) | **a fetching hook / cache** (not `useState`/context as its *home*) | It's a *cached copy* of someone else's truth, not owned client state |
| The same `useState`+`useEffect`/fetch logic repeated across components | **a custom hook (`useX`)** | Package it once; components call it and read the return |

---

## My pre-task checklist (run this before starting any new task)

1. Re-read the task's **"Prove you understand"** questions *first* — they tell me what to pay
   attention to while building.
2. Skim this doc's relevant section + the cross-cutting principles.
3. When something "doesn't work": **is it my code, or a stale cache / unparseable file?** Rule those
   out before re-theorizing.
4. When tempted to add `useMemo`/`React.memo`: **have I actually measured the problem yet?** If not,
   I'm cargo-culting.
5. Identity check: am I creating a new object/array/function every render and handing it somewhere
   that cares about `===`?
6. Before asking for the answer: write down **what I tried and why it failed.** Usually the act of
   writing it reveals the next move.
