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

### Tracing a state → render flow (the grep recipe)

When I want to answer *"when I do X, what re-renders and why?"* — trace it in this order, grepping my own
code. Worked example: **click a tag → the article list updates.**

- **① Who OWNS the state?** Grep `useReducer` / `useState`. State lives in the component that calls the
  hook — *that* is what re-renders (not the component that calls `dispatch`).
  → `ToolbarProvider.tsx` `const [state, dispatch] = useReducer(toolbarReducer, …)`.
- **② Who can CHANGE it?** Grep `dispatch(` / the setter. Each hit is a *trigger* (fires the loop; doesn't
  re-render itself).
  → `TagFilter`'s `toggle` → `dispatch({type:"tags", tag})`.
- **③ Does the reducer return a NEW object?** The re-render only commits because `Object.is(next, prev)`
  is false. `return { ...state, tags: nextTags }` = fresh identity → render. (Mutate + return same object
  = React bails, no render.) **The identity change is the trigger, not "adding to the array."**
- **④ Where is it PUBLISHED?** Find `<Context.Provider value={state}>`.
  → `ToolbarProvider.tsx` `<ToolbarStateContext.Provider value={state}>` — new state = new context value.
- **⑤ Who CONSUMES it?** Grep `useContext(ThatContext)`. Every consumer *component* re-renders. (A **hook**
  like `useArticles` doesn't re-render — the *component that calls it* does.) Dispatch-only consumers
  (`useContext(ToolbarDispatchContext)`) sit still — `dispatch` is stable.
  → `TagFilter` (reads `state.tags`), `Toolbar` (`<pre>` reads `state`), the list (via `useArticles`).
- **⑥ Where's the DERIVED work?** The consumer that recomputes from the new state.
  → `useArticles` re-runs `.filter().filter().filter().sort()` → new visible list.

**How to intuit it for a component I haven't written yet — a component X re-renders ONLY if:**
1. **X owns the changed state** (`useState`/`useReducer` lives in X), **or**
2. **X reads a context** whose value identity changed (`useContext`), **or**
3. **X's props changed** (by identity), **or**
4. **X's parent re-rendered** and X isn't shielded (`memo`, or passed as stable `children`).

If none hold, **X is an independent state island and sits still.** That's why a *toolbar* dispatch never
touches `ThemeProvider` — different state, and renders flow **down, never up** (a child re-rendering can't
re-render its parent). So to predict impact: *find what state the action changes (①–③), then ask which
components own or subscribe to that specific state (⑤). Everything else is independent.*

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

## Task 8 — Extract a custom hook (`useArticles`) + derived filter/sort/search

**Concept:** Wrap the filter/sort/search into a **consumer hook** `useArticles()` so components get a
clean interface and `page.tsx` stays dumb. The filtered/sorted list is **derived state** — *computed
in the render body every render* from `(articles + toolbarState)`, **never** stored in `useState`.
To make the toolbar's reducer reachable by both the buttons and the filter logic, I lifted the Task-6
`useReducer` out of `Toolbar` into a **`ToolbarProvider`** exposing it via **two split contexts**
(the Task-4 pattern): `ToolbarDispatchContext` (buttons need only `dispatch`, which is stable → they
shouldn't re-render on filter changes) + `ToolbarStateContext` (the filter logic + `<pre>` debug read
state). The hook returns the **same `UseArticlesReturn` shape** as the raw context, so it's a
**drop-in replacement** for `useContext(ArticleContext)` — consumers can't tell filtering happened.

**The distinctions that cost me time:**
- **Fetcher vs consumer are TWO hooks, not one.** `useFetchArticles` **populates** `ArticleContext`
  (called once in the provider); `useArticles` **reads** it. I tried to bolt the context-read onto the
  fetcher → circular (the thing that fills the context was trying to read it). Keep producer and
  consumer separate.
- **A reducer's `dispatch` is `Dispatch<ArticleAction>`** — the action union directly. **NOT**
  `Dispatch<SetStateAction<ArticleAction>>` (that's the *`useState` setter* shape: "value or updater
  fn"). A reducer takes an action, full stop — no updater form. Copying the `ThemeDispatch` shape was
  the bug.
- **`.filter` takes a PREDICATE (returns `boolean` — keep/drop); `.sort` takes a COMPARATOR (returns a
  signed `number` — order).** Different jobs. Don't think "predicate" for sort.
  - Comparator sign rule: **negative → a first, positive → b first, 0 → leave as-is.** Strings:
    `a.title.localeCompare(b.title)` (handles casing/order, returns the sign for me). Numbers: `a - b`.
  - **`.sort()` with no comparator is broken for objects** — it stringifies each to `"[object Object]"`
    and sorts those. Always pass a comparator.
  - **`.sort()` mutates in place** — safe here only because `.filter()` already returned a *fresh*
    array. Sorting the raw context `articles` directly would mutate shared state.
- **Derived, not stored.** Filtering *is* derived state (I first mislabeled it "not derived" while
  describing it perfectly). Compute it inline; don't `useState`+`useEffect` it. A `useEffect` that
  `setFiltered(...)` runs *after* the render commits → the screen paints one render **stale** (shows
  the old list for a beat) + wastes a second render. Compute-in-render can't go stale.
- **Don't memoize yet.** `useMemo` here would cache the filtered array between renders, but the list is
  trivial (few hardcoded articles) → premature. It earns its place in **Task 11**, *after measuring*,
  when the list is large or a `memo`'d child needs a stable array reference.

**Mistakes (the "reach past the simple thing" pattern, again):**
- **`createContext<ToolbarState>("")`** — gave a `string` default where a `ToolbarState` *object* is
  required. Default must be a real object; pull the initial state into **one shared const** used for
  both the context default *and* `useReducer`'s initial arg (don't hand-copy it twice).
- **`toolbarState === "all"`** — compared the **whole state object** to a string (always false). Reach
  into the field: `toolbarState.status`. (Same class of error: `switch (toolbarState)` with
  `case toolbarState.sort` — switching on the whole object, `case`ing on a variable. Switch inspects
  **one value**; `case`s are **literals** (`"title"`, `"status"`).)
- **Typed the array as the box:** `const filtered: UseArticlesReturn = articles.filter(...)`. `.filter`
  returns `Article[]`; `UseArticlesReturn` is `{articles, isLoading, error}`. The array is the *list*;
  the hook returns a *box holding the list*. Put the return type on the **function signature**.
- **`return { filteredArticles, ... }`** → *"filteredArticles does not exist in type
  UseArticlesReturn."* Object shorthand `{ x }` = `{ x: x }` — the **key** is the variable name. The
  contract wants key `articles`. Spell it out: **`{ articles: filteredArticles }`** — an object literal
  maps *any key to any value*; shorthand is just sugar when they match.
- **`let articles` + `articles = filteredArticles`** to force shorthand — made `articles` mean "raw
  list" then "filtered list" in the same function (one name, two concepts). The explicit key map needs
  no `let` and no reassignment. Prefer it.
- **Inverted search guard:** `search != "" || title === search` → keeps everything when typing, filters
  to empty-titles when blank. Mirror the status guard: **`search === ""`** ("empty → keep all"). And
  exact `===` won't substring-match — use **`title.toLowerCase().includes(search.toLowerCase())`**
  (lowercase **both** sides).
- **Ternary branched on the wrong thing:** condition was a `localeCompare` result, both arms identical.
  The condition must test the **sort mode** (`toolbarState.sort`); each branch is that field's compare.
  Three modes > two ternary arms → used a `switch` with `default: 0` so `"date"` is a real no-op (no
  `createdAt` field exists yet, so date can't sort).

**Rules of hooks — what actually breaks (nailed at the gate):** React tracks hooks by **call order**,
matching the nth call to the nth stored slot each render. Violate rule 1 (call inside a
condition/loop/effect) and the order **shifts** → state bleeds from one `useState` into another,
effects run stale, and React throws *"Rendered more/fewer hooks than during the previous render."*
It is **not** a "flicker." Rule 2 (call only from React functions): a plain function isn't in the
render tree, so there's **no component instance for React to attach the state to** → runtime error.

**How to remember:**
- *"Producer fills the context, consumer reads it — two hooks, never merge them."*
- *"Reducer dispatch = `Dispatch<Action>`; `SetStateAction` is the useState-setter shape."*
- *"`.filter` wants a predicate (boolean); `.sort` wants a comparator (signed number). No bare
  `.sort()` on objects."*
- *"Filtered list is DERIVED — compute in render, no useState. Stored derived data paints stale."*
- *"`{ x }` makes the key `x`; to hit a different key, write `{ key: value }` in full."*
- *"`switch` inspects ONE value; `case`s are LITERALS. Reach into `.field`, don't compare the whole
  object."*
- *"Hooks break by call-order → wrong slot / hook-count error, not a flicker."*

---

## Task 9 — Keep search smooth under load (`useDeferredValue` + `memo`)

**Concept:** With ~2,000 articles, typing in the search box janks (~150–200ms per keystroke,
even worse under 4× CPU throttle). `useDeferredValue` returns a **lagging copy** of a value: on
each keystroke React does **two** render passes — an **urgent** pass that returns the *old*
deferred value (commits fast → the input stays responsive) and a **low-priority, interruptible**
pass that returns the *new* value (discarded and restarted if a newer keystroke arrives). It
doesn't remove the lag — it **relocates** it off the input (unacceptable to lag) onto the results
list (acceptable to lag).

**The two-move rule (this is the whole lesson):** `useDeferredValue` alone did **nothing** — it
actually felt *worse* (two renders instead of one). Deferring is only half. The urgent pass only
becomes cheap if the expensive downstream tree can **skip re-rendering** when the deferred value
hasn't changed yet. So the pairing is always:
1. **Defer the input value** (`const deferredSearch = useDeferredValue(toolbarState.search)`) and
   feed the deferred copy into *only* the expensive consumer (the search predicate).
2. **Memoize the expensive downstream component** (`export default memo(ArticleCard)`) so on the
   urgent pass — where `deferredSearch` is stale and the card props are identical — all ~2,000
   cards hit `memo`'s shallow prop check and **bail out**. Result: urgent commit cratered
   **~200ms → ~56ms**, input keeps up with my fingers.
   The React docs never show `useDeferredValue` without `memo` — for exactly this reason.

**The distinctions that cost me time:**
- **Defer the INPUT (primitive string), not the OUTPUT (computed list).** My first instinct was
  `useDeferredValue(articles.filter(...).sort(...))`. Two problems: (a) it bundles the **status
  filter and sort** into the deferral too, so changing a dropdown would also lag — but only
  *search* should lag; (b) `.filter()` returns a **brand-new array every render**, and
  `useDeferredValue` leans on identity (`Object.is`) to know when the lag "caught up" — a fresh
  reference each time is never identity-equal, so it can't cleanly settle. Defer the smallest,
  **stable primitive** the expensive work depends on. Status/sort keep reading live `toolbarState`.
- **The input NEVER reads the deferred value.** `value={state.search}` stays on live state. Point
  the input at `deferredSearch` and the *input itself* inherits the lag — the exact thing I'm fixing.
- **The expensive thing is the RENDER, not the `.filter()`.** Filtering 2,000 objects is
  sub-millisecond. The 200ms is React reconciling ~2,000 `ArticleCard`s. So the fix targets the
  *rendering* of the list, not the filtering.
- **Why `memo` actually bails here:** `ArticleCard`'s props (`url`, `title`, `status`) are all
  **primitive strings** → shallow-compare by value → equal → skip. (Foreshadow Task 11: the day I
  pass a card `onClick={() => …}` — a **new function every render** — `memo` breaks and needs
  `useCallback`. `memo` only bails if *all* props are stable.)

**The controlled input (first one in the project):** a controlled input has two wires forming a
loop — `value` is **driven by state** (`state.search`), `onChange` **dispatches** the new value
back. React is the single source of truth; the DOM input is just a mirror.

**Mistakes:**
- **Second source of truth:** added a local `const [input, setInput] = useState("")` to back the
  input, mirroring it into `state.search` by hand. The reducer state *already* owns the search text
  → two sources of truth, manually synced (the same derived-vs-stored smell from Task 7/8). Fix:
  **no local `useState`** — `value={state.search}`, `onChange` dispatches `e.target.value` straight
  through.
- **"One behind" stale read:** `onChange={e => { setInput(e.target.value); handleSearch(input); }}`
  — passed `input` (this render's captured value, *before* `setInput` takes effect) instead of
  `e.target.value`. `setInput` schedules a re-render; it doesn't mutate the `const` in place. Typing
  "rrr" dispatched "rr". **The fresh value is in the event** (`e.target.value`), not in state yet.
- **Deferred the whole computed array** (see above) — wrong target; defer the primitive.
- **Broke the export switching to `memo`:** changed `export function ArticleCard` →
  `export default memo(ArticleCard)` — a **named → default** export flip. Any `import { ArticleCard }`
  then resolves to `undefined` → *"Element type is invalid… got: undefined."* Match the import side
  (default import, or keep it named via `export const ArticleCard = memo(function …)`).

**The trade-off I accepted (the "Done when"):** the results list shows **momentarily stale** data
(results for the previous query) for however long the expensive render takes, in exchange for an
input that never lags. Separately, `memo` isn't free — every card runs a shallow prop compare each
render + React holds the memoized output in memory; cheap here and **justified because I measured**,
but Task 11 is where I learn memoizing blindly can cost more than it saves.

**`useDeferredValue` vs debounce vs `useTransition` (gate answers):**
- **vs 300ms debounce:** debounce is a **fixed timer** — "wait 300ms of silence, then run" — a
  blunt clock that eats dead wait on fast machines and **throws away intermediate results** (never
  see "reac", only "react" after a pause). The naive version delays the *state update itself*, so
  the **input** lags too. `useDeferredValue` is **work-paced + interruptible**: no fixed delay, lag
  = however long the render takes, self-tunes to the hardware, keeps the input responsive *by
  construction* (it defers a downstream copy, never the source). Debounce answers *when* to run
  (a guess); `useDeferredValue` answers *at what priority*. Debounce is for **I/O I want to throttle**
  (fewer API calls) — this app fetches **once** then filters in memory, so there's no API to throttle.
- **vs `useTransition`:** same urgent/deferred split, different handle. `useTransition` **wraps the
  state update** (`startTransition(() => setX(…))`) — reach for it when **I own the `setState`/`dispatch`
  call** and want an `isPending` flag (e.g. a spinner while the status dropdown re-sorts 2,000 items;
  `startTransition` is interruptible too, so it handles spam-clicks). `useDeferredValue` **wraps a
  value** — reach for it when I *don't* own the update (a prop / hook return / someone else's state).
  For *search* specifically I want `useDeferredValue` even though I own the dispatch, because wrapping
  the search dispatch in a transition would make the **input value** low-priority = laggy input.

**How to remember:**
- *"`useDeferredValue` doesn't kill lag — it RELOCATES it off the input onto the list."*
- *"Defer + memo are PARTNERS: defer the value, memo the expensive tree so the urgent pass bails.
  Defer alone did nothing (felt worse)."*
- *"Defer the INPUT (stable primitive), not the OUTPUT (fresh array every render)."*
- *"The input reads LIVE state; the expensive filter reads the DEFERRED copy. They stop sharing one value."*
- *"Controlled input = value from state, onChange dispatches — no second `useState`. The fresh value
  is in `e.target.value`, not in state yet."*
- *"debounce = fixed timer (throttle I/O); `useDeferredValue` = work-paced priority (keep input snappy);
  `useTransition` = same, but when I own the setState."*

---

## Task 10 — Compound component for the tag filter (`<TagFilter><TagFilter.Option/></TagFilter>`)

**Concept:** A **compound component** is a parent + sub-components that share state *implicitly* so the
consumer never wires it up. `<TagFilter>` creates a **context**, reads the real state, and republishes a
tiny interface; `<TagFilter.Option>` reads that context. The consumer writes plain JSX and the state just
*flows* to wherever the Options land — no props threaded through, no config object.

**The three moves that make it a compound component:**
1. **Context is the sharing mechanism** — `createContext`, `TagFilter` wraps `children` in
   `<Context.Provider value={…}>`, `Option` calls `useContext`. (NOT `React.Children.map`/`cloneElement`
   — that's the trap: fragile, breaks the moment an Option isn't a direct child.)
2. **Static-property attachment** — `TagFilter.Option = Option`. A function *is* an object, so you hang
   the sub-component off it as a property. This is the plain-JS move that makes `<TagFilter.Option>`
   resolve. TS allows this directly on a **function declaration** (would need `Object.assign`/explicit
   type for an arrow-`const`).
3. **One export carries the whole family** — `Option` needs **no `export`**. Consumers reach it as
   `TagFilter.Option`, a property on the already-exported `TagFilter`. `export` only controls *import by
   name across files*; the sub-component rides along on the parent object. Exporting it too is dead
   surface that invites bypassing the compound API.

**`TagFilter` is a translator/hub** sitting between two worlds: *below* it, dumb Options that only want
`{ selectedTags, toggle }`; *beside* it, the complicated toolbar reducer (`state.tags` + `dispatch`,
action types). Its whole job: **read the complicated world, republish a simple interface.** Every
provider-style compound component does exactly this.

**Publish a clean interface, not raw materials (Option A vs B):** the context value carries
`{ selectedTags, toggle }` — a **`toggle(tag)` function that wraps `dispatch` inside `TagFilter`** — NOT
`{ selectedTags, dispatch }`. Why B: with raw `dispatch`, every `Option` would have to know the action
type (`{ type: "tags", tag }`) — coupling it to the reducer. With `toggle`, `Option` never knows
`dispatch` or `"tags"` exist. That *hiding* is the acceptance bar: **a teammate composes it without
reading the internals.**

**Controlled vs uncontrolled (gate answer):** a *single* well-written compound component can be **both** —
it branches on whether a `value` prop was passed, exactly like native `<input>` (`value` → parent owns it,
controlled; `defaultValue`/nothing → component owns it via internal `useState`, uncontrolled). **This
instance is controlled**, because `useArticles` reads the selected tags off `toolbarState` — so the
selection *has* to live in the toolbar reducer, not a private `useState`. "It can't be both" was wrong;
"this one is controlled" is right. Keep those two claims separate.

**Context default = `null` + throw guard.** The default is used in exactly one case: a consumer with **no
matching Provider above it**. For a sub-component that's *meaningless* without its parent (an `Option`
outside `TagFilter` has no `selectedTags`, no `toggle`), default to `null` and, in the consumer,
`if (ctx === null) throw new Error("… must be used inside <TagFilter>")`. Two payoffs: (a) misuse fails
**loudly** instead of silently no-op'ing; (b) after the throw, TS **narrows** the type from
`Value | null` → `Value`, so `.selectedTags`/`.toggle` read cleanly. **Heuristic:** *can a consumer do
something correct with no provider? Yes → real default (e.g. theme `"light"`). No → `null` + throw.*

**Domain type: `Tag` (union), not `Tags` (object).**
- A tag is *one value from a fixed set* → a **union type alias**: `type Tag = "tech" | "finance" | …`.
  Then an article that has several = `tags: Tag[]`, and `article.tags` is `["tech","finance"]` — plain
  strings, no nesting.
- **Mistake:** wrote `interface Tags { tags: "tech" | … }` — an object wrapper around the union. That made
  `article.tags` an object and forced `article.tags.tags`. Root cause: reached for **`interface`, which can
  *only* describe an object shape** — so it *forced* the wrapper. **A union needs `type`, never
  `interface`.** (interface = object shape; type alias = any type, incl. unions.)

**Reducer owns the toggle (plan B).** Toggling selection is a **state transition**, so it lives in the
reducer, not the component. Action carries the **single clicked `tag`** (the reducer already has
`state.tags` — it only lacks *which* tag was clicked). The `tags` case: `state.tags.includes(tag)` →
remove via `state.tags.filter(t => t !== tag)`, else add via `[...state.tags, tag]` — **immutable**,
return `{ ...state, tags: next }`. (Wrap the case in `{ }` — a bare `const` under `case` throws "lexical
declaration in case block" and leaks scope to sibling cases.)

**Mistakes (beyond the `Tag` type):**
- **Duplicated the reducer's toggle logic into `Option`.** Wrote `const isSelected = includes ? filter :
  push`. But `isSelected` is a **boolean** — just `selectedTags.includes(tag)`. The filter/add belongs in
  the reducer (single source of truth); the Option only *asks* "am I in?" and calls `toggle(tag)` to
  request the change. (`.push` would also mutate — double wrong.)
- **Export/import mismatch chain:** dropped `export` off `TagFilter` (it *is* imported elsewhere, so it
  still needs one) **and** imported it default (`import TagFilter`) when it's a named export. Named export
  ↔ named import (`import { TagFilter }`) must agree on *both* sides.
- **"children is missing" TS error:** `<Option tag="tech"></Option>` with nothing between the tags.
  `children` is a **prop whose value is the content between the tags** — empty tags = no `children`. Fix:
  `<Option tag="tech">Tech</Option>`. (This is the `tag`=identity / `children`=label split I designed for
  consumer control.)

**How to read a TS assignability error** (the reusable skill): template is
`Property 'X' is missing in type <WHAT-YOU-GAVE> but required in type <WHAT'S-EXPECTED>.` — the first type
literal is **what you passed** (TS infers it from your JSX props), the second is **the contract**. Diff
them; the named property is in the contract but not your input. Same for "Type A is not assignable to
type B" → **A is yours, B is the target.**

**How to remember:**
- *"Compound component = context to share + `Parent.Child = Child` to attach. Consumer writes JSX, state
  flows via context. Never `Children.map`/`cloneElement`."*
- *"Publish a `toggle`, not `dispatch` — hide the reducer so Options don't know the action type."*
- *"Context default `null` + throw = loud failure AND type-narrowing. Real default only if it works with
  no provider."*
- *"A tag is a value → `type` union. `interface` = object shape only; it forces a junk wrapper."*
- *"`children` is the stuff between the tags. Required `children` + empty tags = 'children is missing'."*
- *"TS error: first type = what I gave, second = what's wanted. Diff them."*

---

## Task 11 — Memoize, but only after you measure (`React.memo` + `useCallback`, the cost of memoization)

**The twist:** `ArticleCard` was *already* `memo`'d (Task 9), so the classic "list re-renders too much"
bug didn't pre-exist — I had to **introduce** it to have something to measure. That's realistic: the
regression is what happens the moment you add an interaction to a list item.

**The experiment (measure → break → fix → re-measure):**
1. **Baseline:** Profiler on "type one letter in search" → **~60ms**, cards stay dark (memo bailing on
   stable primitive props). *No problem to fix yet.*
2. **Introduce the feature:** added a status-toggle `<button>` to `ArticleCard` + an `onToggleStatus`
   prop, passed **inline** from the parent's `.map`: `onToggleStatus={() => handleToggle(article.id)}`.
3. **Measure the regression:** same interaction → **188ms**, *all* cards flashing. Profiler "why did this
   render?" said **"props changed: onToggleStatus."** A silent 3× slowdown, no error, only findable with
   the tool.
4. **Fix + re-measure:** back to **~60ms**, cards dark again.

**Root cause (say it precisely):** not the id — the **inline arrow created a new function *identity*
every render.** `memo` compares props by identity (`Object.is`); a fresh function literal is never `===`
the old one → the compare fails → all ~2,000 cards re-render. (Baking a different id per closure just made
2,000 *distinct* new functions; even one shared inline handler would've been recreated each render.)

**The fix is two moves, not one:**
1. **Reshape so there's ONE handler, not 2,000 closures.** Move the id *out* of the parent's closure and
   let the **card supply its own id**: parent defines a single `(id) => …`, passes the function itself
   (`onToggleStatus={handleToggle}`), and the card calls `onToggleStatus(id)` from its own button (the
   card needs `id` as a prop). The card's *internal* `() => onToggleStatus(id)` is fine — it's not an
   incoming prop being compared, so it doesn't defeat memo.
2. **Stabilize that one handler with `useCallback`.** `const handleToggle = useCallback((id) => …, [])`.
   The **dependency array is mandatory** — `useCallback(fn)` with *no* second arg returns a new function
   every render (does nothing). The array lists everything from component scope the body **reads** (props,
   state, vars) — *not* its own parameters, *not* globals. This body reads nothing external → `[]`.

**Mistakes hit:**
- **`useCallback(fn)` with no deps array** — silently a no-op; memo stayed broken until `[]` was added.
- **`onClick={onToggleStatus}`** (passing the handler directly) — React calls it with the **click event**,
  so `id` received a `SyntheticEvent`, not the article id. Needed `onClick={() => onToggleStatus(id)}`.
- **`props: ArticleCardProps | any`** — silenced the "prop doesn't exist" TS error by widening to `any`
  (kills all type-checking). The right fix is to *add* the prop to the type. (`| any` = a smell, never a fix.)

**The discipline (the real deliverable):**
- **Profiler recipe:** enable *"Record why each component rendered"* + *"Highlight updates when components
  render"* → reproduce the slow interaction → read *why* the hot components rendered → fix *that specific
  reference* → **re-measure to confirm.** Never guess; the tool names the cause.
- **Measure first.** Step 1 might tell me there's *nothing to fix* (it did — memo already held). Believing
  the Profiler over my instinct **is** the lesson.
- **These optimizations come in pairs:** `useCallback` is useless without a `memo`'d consumer, exactly like
  `useDeferredValue` was useless without `memo` (Task 9). If I add `useCallback` and there's no memo'd child
  or deps array on the other end, I'm cargo-culting.

---

## Task 12 — Drag to reorder (`@dnd-kit/react`) — key semantics, order as client state, seed + project

**Concept:** Reordering forces a clean split I'd been able to ignore: the server owns the *set* of
articles (read-only), the client owns the **order**. The order is its own tiny piece of client state, it
gets **seeded** from the server data once, and the list renders by **projecting** server content through
that order. dnd-kit supplies the drag physics; I supply the keys, the order state, and the reorder logic.

**Key semantics (the graded gate):**
- **Never index-as-key on a reorderable list.** With index keys, React sees keys `0,1,2` still exist after
  a move, so it **keeps each instance in its slot and hands it new data** — state (a `useRef`, an
  uncontrolled input, a checkbox) **stays glued to the *position*, not the item.** The classic corruption.
- **Stable UUID keys → React moves the instance.** On `[A,B,C] → [C,A,B]`, React sees key-C still exists
  and **relocates that component instance** to the front; its state travels *with the item*. **Keys tell
  React "identity, not position."**
- The `key` goes on the **outermost element the `.map` returns.** When I wrapped `ArticleCard` in
  `<Sortable>`, the key had to move to `<Sortable>` — a key on the inner child does nothing for list
  reconciliation. (`key` is special; React consumes it — `Sortable` never sees it as a prop.)

**Tool choice = scope argument, not popularity.** "dnd-kit is industry-standard / I've used it" is a
*social* reason, not an engineering one (the contract rejects it). The justification that holds: dnd-kit
**delegates the part that isn't the lesson** (pointer math, collision detection, keyboard a11y) and
**keeps the part that is** (I still write the keys, own the ordered array, and compute the new order in
`onDragEnd`). If it reordered my state *for* me, it'd rob the lesson — but it hands me a drag-end event and
lets me own the state. That's a safe delegation.

**Order model — `string[]` of ids, client-owned. NOT article objects.**
- `type Order = string[]`. The **position in the array IS the order.** It stores *only identities*, because
  that's all "the order" contains — everything else (title, url, status) is server content that already
  lives in the fetch result.
- Storing whole `Article` objects would be **derived-vs-stored** (bucket #2): a second copy of server data
  that goes **stale** the moment the server changes, plus duplication. `string[]` of ids sidesteps both.
- **Order lives on the *collection*, not the article.** An article doesn't know its position; the list
  does. (When the error said "Property 'order' is missing," the fix was *the initial state's shape*, NOT
  adding an `order` field to `Article` — that would put per-item position back on each object.)

**State ≠ Action (the mental model I kept fighting):**
- **State is the stored data; its shape is fixed.** `ArticleState = { order: Order }` — and it stays that
  shape *no matter how many actions I add.* After create/delete/reorder all run, `state.order` is *always*
  a `string[]`.
- **Action is a transient message with a `type`; the *union* is what grows.** `ArticleAction = ArticleOrder
  | ArticleCreate | …`. I kept trying to type `state.order` as an *action* (`ArticleOrder`) and to add a
  `create:`/`delete:` *field* per action. Both wrong.
- **The receipt that settled it — my own `ToolbarState`:** every field is *data* (`search: string`,
  `sort: "date"|…`), and the actions live in a *separate union* (`ToolbarAction`). Toolbar does NOT do
  `{ search: ActionSearch }`. Four actions, one fixed state shape. Same here.
- Not every action needs its own state field: create/delete/reorder **all mutate the one `order` array**
  (append id / remove id / rearrange). "Create" is a *verb* (an action), not a *noun* (a stored value).

**`assertUnreachable` exhaustiveness needs a real union (2+ members).** A union-of-one (`type A = X`) isn't
a union — it's just `X` — so the `default` branch **doesn't narrow to `never`**, and `assertUnreachable(x:
never)` errors ("`X` not assignable to `never`"). Verified by isolating it (two-member union → clean;
one-member → errors). So the guard is *premature* against one action; it starts working the instant the
union genuinely has ≥2 members (e.g. once `seed` joins `order`). The exhaustiveness pattern is a tool *for
unions*.

**Context defaults + merging contexts:**
- **The default value's TYPE is forced by the context type; write the smallest valid literal of `T`.**
  `createContext<ArticleState>` needs an `ArticleState` = `{ order }`, so the empty default is `{ order:
  [] }` — NOT `[]` (that's an array, not the object). (`T = string → ""`, `T = {count:number} →
  {count:0}`.) The *content* (empty-`T` vs `null`+throw) is a separate judgment.
- **Merged read-context type via `interface X extends A, B {}`.** Chose to merge server data + order into
  one "read" context. Compose the value type by having an interface **extend both** `UseArticlesReturn` and
  `ArticleState` (empty body) — the clean, senior move for two object interfaces (`&` intersection also
  works; reach for it when the parts aren't plain interfaces). **Don't** jam the merged shape onto
  `UseArticlesReturn` — that's the *fetch hook's* honest contract (it returns no `order`), and widening it
  broke the hook.
- **Merge vs split contexts:** combine things that change together, separate things that change
  independently. Kept `dispatch` in its own context (it's referentially **stable**, so dispatch-only
  consumers never re-render on state change — the Task 11 split-for-stability move).
- **When I delete/merge a context, every *consumer* must follow.** Deleting the dead-looking
  `ArticleContext` broke `useArticles`, which was still reading it — `tsc` caught it across files (the
  value of a whole-project type-check). Redirect consumers to the new source.

**Convert external types at the boundary (anti-corruption).** dnd-kit's ids are `UniqueIdentifier =
string | number`; my domain is `string`. Do **not** widen `Order`/`ArticleState`/the action to
`string | number` to appease the library — that infects the whole domain to handle numeric ids that never
occur. Instead **coerce once at the seam** (`String(source.id)`) in the `onDragEnd` handler. Keep the core
clean; reconcile foreign types where the two worlds touch.

**Reducer owns the reorder transition (consistent with the tags toggle).** Action carries the **minimal
delta** — `{ type:"order"; sourceId; targetId }` — not a pre-computed array. The reducer does the move:
copy `order`, `indexOf` both ids, `splice` the source out and `splice` it back in at the target index
(this matches `arrayMove` semantics). **Guard `-1`** (id not found → `indexOf` returns `-1`, and
`splice(-1,1)` deletes the *last* element — silent corruption): if either index is `-1`, `return state`.
Wrap the `case` body in `{ }` (lexical-declaration rule).

**dnd-kit `@dnd-kit/react` wiring (v0.5 — different from legacy):**
- `onDragEnd` is a **prop on `DragDropProvider`**, not a legacy top-level callback. (Or use the
  `useDragDropMonitor({ onDragEnd })` hook from inside the provider.)
- The event carries `event.operation.source` and `event.operation.target` (each an entity with `.id`),
  plus `event.canceled`. **Both `source` and `target` can be `null`** — guard them *before* reading `.id`.
- The handler can't be `dispatch` directly (it'd receive a `DragEndEvent`, not an `ArticleAction`); it
  reads the ids off the event and *builds* the action. Guards: `canceled || !source || !target ||
  source.id === target.id` → `return`.
- **One `DragDropProvider` wraps the whole list.** I first put it *inside* the `.map` → a separate,
  isolated drag context per item (nothing could reorder). It must wrap all the `<Sortable>`s so they share
  one context (same "the hook needs its provider above it" lesson).
- **Whole-card grab (CSS):** the draggable element needs `select-none` (so pressing text doesn't start a
  selection) + `touch-none` + `cursor-grab`; and interactive children steal the gesture — set
  `draggable={false}` on the `<a>` so its native link-drag doesn't hijack the pointer.

**Seed client state from async server state — once.** `order` starts `[]`; nothing fills it until the
fetch resolves. A `useEffect([articles])` dispatches a **`seed`** action with `articles.map(a => a.id)` —
**guarded by `articles.length > 0 && state.order.length === 0`** so it runs exactly once and a refetch
never clobbers a user's drag. (`articles &&` is not "loaded" — `[]` is truthy; check `.length`.) The seed
value is the **ids**, not the articles (the "order = ids" wall, one more time).

**Project — render *through* the order, don't map raw articles.** The list must map over **`order`** (the
driver / sequence), using `articles.find(a => a.id === id)` as the **lookup table**, then
`.filter(a => a !== undefined)` to drop the seam cases (id whose article was filtered out or deleted). I
first mapped `articles` by mistake → `id` was an `Article`, so `a.id === id` errored ("string and Article
have no overlap") — the tell that I had the driver wrong. This makes **drag order win over the toolbar
sort** (accepted). Two permanent seams: id in `order` with no matching article (drop it); server article
not yet in `order` (won't render until seeded/appended).

**Perf reality (deferred, not solved):** ~2,000 `<Sortable>`s each register a draggable+droppable, and
drag-start **measures every one** → a multi-second delay before a grab activates. No sensor tweak fixes
measuring 2,000 nodes. Real fix is **virtualization/pagination** (render only what's on screen) — a later
task; capped the rendered count for now and flagged it as a known limitation.

**How to remember:**
- *"Stable id key = React moves the instance (identity). Index key = state glued to the slot (position).
  Key goes on the outermost mapped element."*
- *"Order = `string[]` of ids, owned by the collection. Storing article objects = stale duplicate."*
- *"State shape is fixed data; the action *union* is what grows. Toolbar proves it: fields are data,
  actions are a separate union."*
- *"`assertUnreachable`/`never` only narrows on a real (2+) union; a union-of-one errors."*
- *"Merge context types with `interface X extends A, B {}`. Delete a context → every consumer must follow."*
- *"Coerce foreign types at the boundary (`String(id)`); never widen the domain to fit the library."*
- *"Seed client state from server data **once** (guard `order.length === 0`); render by **projecting**
  server content through the order (order drives, articles look up)."*

---

## The four "performance" hooks I keep mixing up (`useMemo` / `useCallback` / `useDeferredValue` / `useTransition`)

**Two families.** Don't lump them — they solve different pains:
- **Reference-stability** (`useMemo`, `useCallback`): stop an identity from changing every render, so a
  downstream **identity-checker** (a `memo`'d child's props, or a deps array) can bail/settle.
- **Priority/concurrency** (`useDeferredValue`, `useTransition`): keep the UI responsive by letting an
  **expensive render happen at low priority** while the urgent interaction (typing/clicking) stays snappy.

**The universal rule for ALL four:** they only pay off when paired with `React.memo` on the expensive tree
(or, for the stability pair, a deps array), **and only after you measured.** Added blindly, they're pure
overhead (deps compare + memory) — often a net loss.

| Hook | What it stabilizes / does | Reach for it when… | Needs partner | Tiny example |
|---|---|---|---|---|
| **`useMemo`** | Caches a **value** (object/array/expensive compute) → stable identity/result | An unstable object/array (or costly calc) feeds a `memo`'d child's props **or** a deps array | `memo` child / deps array | `const cfg = useMemo(() => ({a, b}), [a, b])` → `<MemoChild cfg={cfg} />` |
| **`useCallback`** | Caches a **function's identity** across renders | A **handler** you pass to a `memo`'d child (or into a deps array) is recreated each render and defeats it | a `memo`'d child / deps array | `const onPick = useCallback((id) => …, [])` → `<MemoRow onPick={onPick} />` |
| **`useDeferredValue`** | Returns a **lagging copy** of a value; urgent render uses the *old* one | A fast input feels laggy because an expensive tree renders in the same pass, and I **hold a value** (don't own the setState) | `memo` the expensive tree | `const dq = useDeferredValue(query)` → feed `dq` to the memo'd list only |
| **`useTransition`** | Marks a **state update** low-priority + interruptible; gives `isPending` | An expensive update **I trigger** (setState/dispatch) blocks the UI and I want a pending flag | (memo helps) | `const [isPending, start] = useTransition(); start(() => setTab(next))` |

**The two distinctions that actually separate them:**
- **`useMemo` vs `useCallback`:** *value* vs *function*. Literally `useCallback(fn, d) === useMemo(() => fn, d)`.
- **`useDeferredValue` vs `useTransition`:** I wrap a **value** vs I wrap the **update**. Use `useDeferredValue`
  when I only have the value / don't own the setState (a prop, a hook return). Use `useTransition` when I
  **own the setState/dispatch** and want `isPending`. (For search I chose `useDeferredValue` even though I
  own the dispatch, because wrapping the search dispatch in a transition would make the **input value**
  low-priority = laggy input.)

**When NOT to reach for any of them:** no `memo`'d consumer and no deps array checking the identity → the
memo hook does nothing but cost. `useCallback` on a prop to a **non-memo'd** child = the child re-renders
anyway = wasted. Cheap calc + `useMemo` = paying deps-compare to save nothing. **Measure, then memoize the
proven hotspot, then stop.**

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
| A fast-updating input (typing) feels laggy because an **expensive render** (big list) is trapped in the same blocking render | **`useDeferredValue`(the input value) + `memo` the expensive tree** | Relocates lag off the input onto the results; memo lets the urgent pass bail. **Both, or neither works** |
| I **own the `setState`/dispatch** and want a heavy update to not block + an `isPending` spinner | **`useTransition`** | Wraps the *update*; marks it low-priority, interruptible, gives pending state |
| I want to **throttle I/O** (fewer API calls while typing) | **debounce** (fixed timer) | Different problem from render lag — delays *firing the request*, not rendering |
| A parent + related children that must **share state**, and I want the **consumer to control layout** | **compound component** (context + `Parent.Child = Child`) | Implicit state sharing via context; JSX reads like the UI tree; inverts layout control to the consumer |
| A **sub-component is meaningless without its parent** (used outside its provider) | **context default `null` + `throw` in the consumer** | Loud failure over silent no-op; the throw also narrows `Value \| null` → `Value` for TS |
| A value is **one option from a fixed set** | **`type` union alias** (NOT `interface`) | `interface` can only be an object shape → forces a junk wrapper; unions need `type` |
| A **reorderable list** where item state/identity must survive moves | **stable unique key** (uuid), **never index** | Index keys glue state to the *slot*; stable keys make React *move* the instance with the item |
| Need to **initialize client state from async server data** (a custom order, a draft) | **effect that seeds *once*, guarded** (`state.length === 0`) | Server data arrives late; seed on arrival, and the guard stops a refetch from clobbering user edits |
| Client owns an **order/arrangement over server data** | **project: client sequence drives, server data is the lookup** (`order.map(id => data.find(...))`) | Keep the two separate; join at render. Storing merged copies = stale duplication |
| A **library's type is leaking** into my domain (`UniqueIdentifier`, etc.) | **coerce once at the boundary** (`String(id)`), keep the core clean | Anti-corruption: don't widen the whole domain to fit a foreign type that has cases I never hit |
| Two object interfaces I need as **one combined type** | **`interface X extends A, B {}`** (or `A & B`) | `extends` for plain object shapes (cleaner errors); `&` when parts aren't interfaces |

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
