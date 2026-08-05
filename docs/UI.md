# UI.md — the UI layer and keeping it responsive

Read this before editing `src/ui/**`, `src/app/App.tsx`, or `src/engine/dpsWorker.ts`.

A `runEngine` pass is a full 60 fps timeline simulation — expensive. The UI must
stay responsive while the user types, so heavy engine work stays off the main
thread.

## The five rules

1. **At most ONE synchronous `runEngine` per input change** — the baseline pass
   in `App.tsx`'s `result` memo, which feeds the DPS header instantly.
   Everything that runs the engine more than once per change (ranking sweeps,
   per-piece deltas, armor/bow/arsenal tile variants, retunement / word-max
   analyses) goes through the shared web worker `src/engine/dpsWorker.ts`: add a
   request kind + compute function there, and drive it from a hook modeled on
   `src/ui/hooks/useDpsDeltas.ts` — own worker instance, monotonic `reqId`,
   stale-response discard, `isPending`, terminate on unmount, and an
   empty / no-selection result **derived at the hook's return** from a
   module-level constant, never written back by a `setState` inside the effect
   (`react-hooks/set-state-in-effect` is error-level). **Never** call
   `runEngine` in a render-path `useMemo` outside that one baseline pass.
2. **Debounce every worker post** with `WORKER_DEBOUNCE_MS` from
   `src/ui/hooks/workerDebounce.ts`. Each `postMessage` structured-clones the
   full `Inputs` (gear inventory included) on the main thread, so
   `setTimeout(0)` is not a debounce.
3. **Mount worker hooks where the results are consumed** — e.g. inside
   `src/ui/features/overview/overview-tab/OverviewTab.tsx`, not `AppInner` in
   `App.tsx` — so tabs that don't show the data don't pay for the sweep.
4. **While a recompute is in flight, show last-known values** with a subtle
   opacity dim. Never unmount or flash the UI.
5. **Don't `JSON.stringify` large state** (drafts, inventory) per render.
   Memoize on the value that actually changed — `isDirty` in `App.tsx` is the
   precedent.

## Existing worker hooks

`useDpsDeltas` · `useItemRanking` · `useRetunementAnalysis` ·
`useReattunementAnalysis` · `useWordMaxAnalysis` · `useSetTileDps`, all under
`src/ui/hooks/`. Follow the nearest one rather than inventing a new shape.

## Folder layout

```
src/
  styles/         global layer: base.scss, primitives.scss, _mixins.scss,
                  _breakpoints.scss — imported once from main.tsx
  app/            App.tsx + App.module.scss (the root shell)
  ui/
    components/   generic, domain-agnostic widgets
    hooks/        worker-backed hooks + the shared debounce constant
    utils/        pure UI helpers shared across features
    layout/       app-shell chrome (header metrics, global warnings)
    features/
      <tab>/      one folder per top-level tab (overview, gear, rotation, …)
        shared/   styles used by exactly two sibling components in that tab
```

Every component lives in its own kebab-case folder next to the `.tsx` file it
belongs to (`gear/gear-piece-form/GearPieceForm.tsx` +
`GearPieceForm.module.scss`). A panel used by exactly one tab lives in that
tab's feature folder; promote it to `components/`, `hooks/` or `utils/` only
when a second feature needs it. Cross-feature imports are allowed but stay
rare. No barrel `index.ts` files and no path aliases — import the file
directly.

## Styling

Every component that carries its own CSS gets a same-named `*.module.scss`
next to it, imported as:

```ts
import styles from "./<Component>.module.scss";
```

**The binding is always `styles`** — never `s` or any other abbreviation, even
though single-letter imports are the common idiom for CSS modules elsewhere.
CLAUDE.md § "Comments and names" governs: an identifier says what it holds, and
that outranks brevity conventions from outside this repo. If a component already
uses `styles` for something else, rename *that* binding to something more
specific rather than shortening this one.

Class names inside a module are **camelCase** and drop the component name
prefix — the module import already scopes them (`gear-tile-stat-label` →
`styles.statLabel`). Modifier classes used by a single component
(`.isSelected`, `.active`, `.isOff`) are local too, composed in the JSX with a
template string or `+`.

Stylesheets are code: they get no comments a reader could recover from the
selector and its declarations. Most modules here have none.

A closed, documented list of cross-cutting primitives stays global —
`src/styles/primitives.scss` (`panel`, `row`, `btn` + modifiers, `toolbar`,
`hint`, `spacer`, `section-label`, the ranking/skill tables, `warnings`,
`empty-tab`, `muted`) — plus four marker-only sign modifiers with no rules of
their own: `is-positive`, `is-negative`, `is-zero`, `is-pending`, produced by
each component's local `signClass`/`deltaSignClass` helper. A module targets
one of these compound with a local class via `:global(...)`, e.g.
`.stat:global(.is-positive) { color: var(--color-positive) }`. Adding anything
else to `primitives.scss` requires updating this list.

Shared palette tokens (`--color-accent`, `--color-text-muted`, …) and the
element baseline live in `src/styles/base.scss`; breakpoints go through the
`below()` mixin in `src/styles/_breakpoints.scss` rather than hardcoded
`@media` queries. Repeated form-control declarations use the `field-input` /
`field-focus` mixins in `src/styles/_mixins.scss`.

Bare element selectors (`input`, `select`, `h2`, `button`) inside a module are
not hashed and keep working through ancestor scoping — this is what lets
`NumberInputs` (a class-less `<input>`) stay styled by whichever module
renders it; never add a class to `NumberInputs` itself.

## Testing

Worker compute functions get direct-call parity tests — **never spin up a real
`Worker` in vitest**. See TESTING.md § "Worker tests".

## Related conventions

- Gear-word deltas are applied directly to **white** stats — see CLAUDE.md
  § "White vs Yellow rates" before touching anything rate-shaped in the UI.
- A buff the user can edit must be visible in the Skill Editor; see BUFFS.md
  for what belongs in a def versus the stat layer.
