# Research — Symbols for DX in a TypeScript + Svelte 5 component library

- Date: 2026-06-13
- Method: deep-research harness (5 angles → 20 sources → 88 claims → 25 adversarially verified, 24 confirmed / 1 refuted) + full codebase inventory
- Scope: both audiences (consumers + maintainers), all four seams (context keys, well-known symbols, branding/hidden metadata, extension seams)
- Reconciled against: [ADR 0005 — Symbol protocol layer](../adr/0005-symbol-protocol-layer.md) (proposed 2026-06-12), [ADR 0004](../adr/0004-convergence-one-mechanism-per-job.md)

## TL;DR

**The library already uses Symbols well, and ADR 0005 already covers the high-value protocol-layer moves.** External research confirms ADR 0005's five decisions and both deferrals are correct and well-reasoned against primary sources (TC39 / MDN / TS repo / Svelte docs). There is **one thing ADR 0005 predates** and should record: Svelte **5.40's official `createContext()`** (merged Oct 2025, PR #16948; docs Nov 2025). It does _not_ overturn D5, but the D5 rationale should now explicitly account for it. Beyond that, the only new work is a small **verification spike** on three questions the research could not settle (reactivity-proxy tracking of symbol keys, tree-shaking of Symbols, devtools visibility).

---

## Part 1 — What you already do (codebase inventory)

Five load-bearing Symbol roles, each exploiting a different property of the primitive:

| Role                                      | Where                                                                                                                           | Property used                                                              |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Collision-proof side-channel props        | `createLifecycleKey()` — [lifecycle.svelte.ts:56](../../src/lib/components/atom/lifecycle.svelte.ts#L56)                        | Unforgeable, invisible to `Object.keys`/`JSON.stringify`, copied by spread |
| Nominal brand in a structural type system | `VARIANT_DEF_TAG` — [variant.ts:23](../../src/lib/utils/variant.ts#L23)                                                         | Unforgeable runtime "is-a" check                                           |
| Sentinel outside the value domain         | `NOT_CACHEABLE` — [utils/classes.ts](../../src/lib/components/atom/utils/classes.ts)                                            | Disjoint from every legit value incl. `undefined`                          |
| Cross-module-copy identity                | `Symbol.for('@svelte-atoms/lifecycle:minted-count')` — [lifecycle.svelte.ts](../../src/lib/components/atom/lifecycle.svelte.ts) | Survives HMR + npm-dedup forks                                             |
| Registry-free metadata recovery           | `lifecycleType()` reads `key.description`                                                                                       | No retained map; minted keys stay GC-able                                  |

Plus the constraints the code already respects, all confirmed by the research:

- **SSR drops symbol props** (Svelte server `rest_props` copies string keys only) → symbol-keyed features are client-only by construction.
- **`Object.getOwnPropertySymbols` costs ~46ns and allocates even when empty** → hot paths route through `getCachedOwnSymbols` ([utils/cache.ts](../../src/lib/components/atom/utils/cache.ts)) and the minted-count fast path.
- **`structuredClone` throws on symbols** → anything crossing a worker/`postMessage` boundary must strip symbol-keyed entries first.

**Not used at all:** the protocol layer (`Symbol.iterator`, `Symbol.toStringTag`, `Symbol.hasInstance`, `Symbol.dispose`) and `unique symbol` type branding. That is exactly the gap ADR 0005 targets.

---

## Part 2 — Research findings, mapped to your decisions

Each finding below is **3-0 verified** (3 independent adversarial verifiers, none refuted) unless noted.

### Seam 1 — Context / registry keys

**Finding A.** Svelte 5 context keys can be _any_ value, Symbols included; every `Symbol()` is guaranteed unique, giving collision-free keys hidden from typical enumeration.
_Sources: [Svelte context docs](https://svelte.dev/docs/svelte/context), [MDN Symbol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol)._

**Finding B (NEW vs ADR 0005).** As of **Svelte 5.40** the official `createContext()` is the _preferred_ approach: it mints the key internally and returns a typed `[getFoo, setFoo]` pair generic over the value type, so consumers never author/pass a key nor cast `getContext`'s return.
`export const [getCounter, setCounter] = createContext<Counter>();`
_Sources: [Svelte context docs](https://svelte.dev/docs/svelte/context), [PR #16948](https://github.com/sveltejs/svelte/pull/16948), [svelte-contextify](https://github.com/hugos68/svelte-contextify)._
⚠️ **Refuted sub-claim (0-3):** that the key being a Symbol is a _documented contract_. It is an opaque implementation detail — **do not build on it.**

**Finding C.** `Symbol.for(key)` uses a runtime-wide registry (same symbol for a given string across files/realms); registered symbols are _not_ unique, _not_ GC-able, and barred from `WeakMap`/`WeakSet`/`WeakRef`. Suit deliberately-shared global keys; **must** be namespace-prefixed.
_Sources: [MDN Symbol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol), [MDN Symbol.for](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/for)._

> **Verdict on D5 ("`CONTEXT_KEY` stays a string"): still correct — but update the rationale.**
> D5 weighs string-vs-`Symbol.for`. The research adds a _third_ option D5 doesn't mention — `createContext()` — and the analysis actually _strengthens_ D5 for the bond-context system:
>
> - `createContext()` mints a **fresh `Symbol()` per module evaluation**, which **forks across npm-deduped duplicate package copies** — the exact hazard your `MINTED_COUNT` uses `Symbol.for` to avoid, and the exact cross-copy sharing D5 wants (string equality). So `createContext()` is _wrong_ for the bond context for the same reason `Symbol.for` is _right_ for the minted counter.
> - `defineBond`/`fuse` build, compare, and propagate `CONTEXT_KEYS` as plain-string arrays and mint fresh keys on rebrand; a `[get,set]` pair doesn't fit that machinery, and strings keep specs serializable/devtools-friendly (ADR 0004 "spec as source of truth").
>
> **Action:** add one paragraph to D5 recording that `createContext()` was considered and rejected for the bond context (forks across duplicate copies; doesn't fit `CONTEXT_KEYS` propagation), while noting it _is_ the idiomatic choice for **simple, single-instance, non-bond contexts** that don't cross the dedup boundary — e.g. `DOC_MODE_KEY` ([doc-mode.svelte.ts:3](../../src/docs/context/doc-mode.svelte.ts#L3), already a bare `Symbol`) and the preset context ([preset.svelte.ts:8](../../src/lib/context/preset.svelte.ts#L8)). Those are the only two candidates and migrating them is optional polish, not a correctness fix.

### Seam 2 — Well-known symbols

**Finding D.** The language reads well-known symbols as protocols: `Symbol.iterator` (`for...of`, spread, destructuring), `Symbol.asyncIterator` (`for await...of`), `Symbol.dispose` (`using`), `Symbol.toPrimitive` (coercion), `Symbol.hasInstance` (`instanceof`). A `[Symbol.iterator]()` method (called with no args) makes an object iterable.
_Sources: [MDN Symbol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol), [MDN Symbol.iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/iterator)._

> **Verdict on D3 (`Symbol.iterator` on `Collection`): green-light.** Directly supported. The protocol exposes the enroll order your choreography stagger already relies on. Ship as specced — bonds stay non-iterable (a bond isn't a sequence; composed bonds own several collections).

> **Verdict on D1 (`Symbol.toStringTag` on `Bond`): green-light, highest leverage-per-risk.** One getter, library-wide debugging win (`[object AccordionBond]` instead of `[object Object]`), zero API surface.

> **Verdict on D4 (`Symbol.hasInstance` on `Bond`): green-light, with the spec coverage ADR 0005 already lists.** `Symbol.for`-backed brand is the right call — a _private_ brand would fork across copies and defeat the purpose. Research confirms `Symbol.for` semantics. Keep the listed spec cases (two-copy simulation, subclass checks, `Object.create(null)`).

**Finding E.** Explicit Resource Management (TC39 **Stage 3**, shipped **TS 5.2+** and V8/Node) adds `Symbol.dispose`/`Symbol.asyncDispose` + `using`/`await using`: block-scoped, calls `[Symbol.dispose]()` on scope exit via try/finally desugaring, exception-safe. Adds `DisposableStack`/`AsyncDisposableStack`/`SuppressedError`.
_Sources: [TC39 proposal](https://github.com/tc39/proposal-explicit-resource-management), [V8](https://v8.dev/features/explicit-resource-management), [TS #52955](https://github.com/microsoft/TypeScript/issues/52955)._

**Finding F.** The DX benefit of `using` is leak prevention: disposal is guaranteed even on exceptions/early-return — directly applicable to bonds, subscriptions, observers, temporary DOM handles.

> **Verdict on the `Symbol.dispose` _deferral_: correct.** ADR 0005 defers this to avoid a second cleanup protocol mid-way through the ADR 0004 convergence ("return a function" everywhere). Research _reinforces_ the deferral: `using` needs TS 5.2+, a recent runtime/polyfill, and `tsconfig` target/lib support — real consumer-toolchain risk for a library. Revisit when seams have converged **and** `using` is table stakes, exactly as written.

### Seam 3 — Branding & hidden metadata

**Finding G.** The `unique T` type operator ([TS PR #33038](https://github.com/microsoft/TypeScript/pull/33038), e.g. `type NormalizedPath = unique string`) was **closed/never merged**. Nominal branding today must use the manual `{ readonly [BrandSym]: ... }` intersection idiom.

> **Verdict on D2 (`unique symbol` brands for lifecycle keys): green-light, and it's the _only_ available technique.** ADR 0005's `phaseBrand`/`bondBrand` intersection is exactly the manual idiom that survived; `unique T` is not coming. Type-level only, zero runtime cost, callers holding bare `symbol` still type-check (brand is a subtype). This is the symbol-side of ADR 0004's "make identity typed."

**Finding H.** `JSON.stringify` **completely ignores** Symbol-keyed properties — _even when the replacer explicitly lists the key_. Also excluded from `for...in` / `Object.keys`. **But** discoverable via `Object.getOwnPropertySymbols` / `Reflect.ownKeys` → weak encapsulation, never a security boundary.
_Sources: [MDN JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify), [MDN Symbol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol)._

> Confirms the existing `createLifecycleKey` side-channel posture and the constraints section. No change needed; note the "weak, not true, privacy" caveat is already implicit in your `getCachedOwnSymbols` scans.

### Seam 4 — Extension / plugin seams

The general principle (unique Symbols → collision-free capability/plugin keys) holds, but **no authoritative production example survived verification** — see open questions. Today your capabilities key by **string `slot`** ([bond.svelte.ts:46](../../src/lib/shared/bond.svelte.ts#L46)) with last-wins-per-slot lookup ([bond.svelte.ts:267](../../src/lib/shared/bond.svelte.ts#L267)). That mirrors D5's reasoning (strings stay serializable/debuggable; the namespace prefix handles accidental collision) and is consistent — **no change recommended** unless third-party capability registration becomes a real, shipping use-case.

---

## Part 3 — Open questions (research could not settle these — verify before relying on them)

These three sub-questions returned **no confirmed evidence** and matter for your specific stack:

1. **Reactivity-proxy tracking of symbol keys.** Does Svelte 5's `$state`/`$derived` proxy track _symbol-keyed_ fields? This bears on D4's `readonly [BOND_BRAND] = true` living on a reactive `Bond`, and on symbol-keyed metadata on reactive objects generally. → _Verify with a tiny `$state` + symbol-key spike before shipping D4._
2. **Tree-shaking of Symbols.** Can unused capability/marker Symbols (`Symbol()` vs `Symbol.for`) be dropped by the bundler, and do `Symbol` _descriptions_ survive minification (you rely on `key.description` in `lifecycleType()`)? → _Check a production build; if descriptions are stripped, `lifecycleType()` breaks._ **This is the highest-risk unknown** — it touches existing shipping code, not just proposals.
3. **Devtools visibility of symbol-keyed context.** How do symbol-keyed context entries / symbol-keyed metadata show up in browser + Svelte devtools? Affects the debugging-DX argument behind D1 and D5. → _Eyeball in the inspector._

## Recommendation

1. **Ship D1 + D2 now** — pure additions, zero behavioural risk, confirmed as the correct/only techniques.
2. **Verify open-question #2 (minification of `Symbol.description`) immediately** — it's the one place the research surfaced risk to _existing_ code.
3. **Ship D3, then D4** — D4 after the reactivity-proxy spike (#1) and with the listed spec coverage.
4. **Amend D5** with the `createContext()` paragraph (Finding B) so it stops being re-litigated now that an official utility exists.
5. **Keep the `Symbol.dispose` deferral** until ADR 0004 convergence lands and `using` is toolchain-table-stakes.

## Sources (primary, unanimous verification)

Svelte: [context docs](https://svelte.dev/docs/svelte/context), [PR #16948](https://github.com/sveltejs/svelte/pull/16948) ·
TC39/V8: [explicit-resource-management](https://github.com/tc39/proposal-explicit-resource-management), [V8 feature](https://v8.dev/features/explicit-resource-management) ·
TypeScript: [#52955](https://github.com/microsoft/TypeScript/issues/52955), [PR #33038](https://github.com/microsoft/TypeScript/pull/33038) ·
MDN: [Symbol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol), [Symbol.for](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/for), [Symbol.iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/iterator), [JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
