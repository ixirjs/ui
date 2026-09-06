# Canonical Bond / part prototype

The revised family-named Bond/Atom authoring experiment is in [`../popup/`](../popup/README.md).
This smaller disclosure prototype remains its regression reference and shared trigger helper.

An isolated experiment, not a new public API. Everything here is excluded from the published
package by its existing `test/**` exclusion. No production family, model, Kernel, preset or baseline
is changed.

## Start here

- `bond.ts`: one plain `DisclosureBond` class composes the existing disclosure model. It owns
  command-scoped event/reason propagation, not a capability registry or a second state store.
  `controlledDisclosure` provides equality-gated write-then-notify behavior and reports the public
  owner supplied by the adapter.
- `parts.ts`: trigger and region roles depend on narrow behavior interfaces. They return live
  attribute readers with stable handlers, not components or a second rendering system.
- `disclosure-root.test.svelte`: both ownership examples use the same class. Standalone mode backs
  it with `open`; grouped mode delegates to the real `AccordionBond`. The optional port `toggle`
  preserves Accordion's distinction between toggling and explicitly closing an item.
- `disclosure-parts.test.svelte`: context consumption and direct `Kernel.element` integration.
  Native buttons rely on browser keyboard activation; non-native buttons implement Enter/Space.
- `reference.test.svelte`: shipped Collapsible components, used for differential checks.
- `ssr-html.ts`: frozen real server bytes, verified by the server suite and hydrated by Chromium.

The family adapter supplies identity, backing state and policy. The part supplies markup, preset
and relationships. Shared behavior is implemented once. No class generation, inheritance chain,
feature flags or activation/disposal protocol is introduced.

## Run

```sh
bunx vitest run src/lib/test/prototypes/disclosure
bun run check
bunx eslint src/lib/test/prototypes/disclosure/
```

The checks cover standalone and delegated command traces, parent policy changes/rejection,
write-before-notify, no-op/throw/reentrant metadata isolation, SSR semantics, in-place hydration,
live ARIA, real keyboard and pointer activation, event cancellation, factory substitution,
instance isolation and remounts. Existing production contract tests remain unchanged.

## Deliberate limits

- One trigger/region pair per owner. Repeated slots must adopt and verify `Kernel.claimId` cleanup
  before this can replace families that support repeated parts. Separate standalone roots already
  receive separate `$props.id()` seeds.
- The test-only grouped item uses the stable value `item`; it is not a new collection implementation
  or a claim of collection growth parity.
- Imperative commands follow Collapsible's semantics; disabled is an interaction guard. Overlay
  opening guards, focus/dismissal effects, floating positioning and timers are not implemented.
- No motion or polymorphic/custom-renderer replacement is proposed. These examples are native
  literal elements, still using the existing preset resolver.
- Existing concrete family classes, snippet shapes, context keys and factories remain published.
  This prototype does not prove external subclass compatibility or authorize retiring adapters.
- Passing functional/SSR/anchor checks does not establish allocation, mount-time or scaling parity.
  Measure equivalent complete family implementations before a production migration.

Integration finding: passing an explicit `onclick: undefined` into Kernel overrides its own click
handler. The fixtures omit absent handlers rather than changing shipped merge semantics.
