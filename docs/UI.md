# UI.md — the UI layer and keeping it responsive

Read this before editing `src/ui/**`, `src/App.tsx`, or `src/engine/dpsWorker.ts`.

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
   stale-response discard, `isPending`, terminate on unmount. **Never** call
   `runEngine` in a render-path `useMemo` outside that one baseline pass.
2. **Debounce every worker post** with `WORKER_DEBOUNCE_MS` from
   `src/ui/hooks/workerDebounce.ts`. Each `postMessage` structured-clones the
   full `Inputs` (gear inventory included) on the main thread, so
   `setTimeout(0)` is not a debounce.
3. **Mount worker hooks where the results are consumed** — e.g. inside
   `src/ui/features/overview/OverviewTab.tsx`, not `AppInner` in `App.tsx` — so
   tabs that don't show the data don't pay for the sweep.
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
src/ui/
  components/   generic, domain-agnostic widgets
  hooks/        worker-backed hooks + the shared debounce constant
  utils/        pure UI helpers shared across features
  layout/       app-shell chrome (header metrics, global warnings)
  features/
    <tab>/      one folder per top-level tab (overview, gear, rotation, …)
```

A panel used by exactly one tab lives in that tab's feature folder; promote it
to `components/`, `hooks/` or `utils/` only when a second feature needs it.
Cross-feature imports are allowed but stay rare.

## Testing

Worker compute functions get direct-call parity tests — **never spin up a real
`Worker` in vitest**. See TESTING.md § "Worker tests".

## Related conventions

- Gear-word deltas are applied directly to **white** stats — see CLAUDE.md
  § "White vs Yellow rates" before touching anything rate-shaped in the UI.
- A buff the user can edit must be visible in the Skill Editor; see BUFFS.md
  for what belongs in a def versus the stat layer.
