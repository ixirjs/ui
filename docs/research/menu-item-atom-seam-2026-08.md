# The menu-item regression, and the packet-vs-seam rule — 2026-08

`menu` was the only SSR fixture that had regressed against the 2026-08-15 baseline, and the only one
the kernel unification made _worse_. It is now the second-best-improved layer.

|                       | µs / item     | vs baseline     |
| --------------------- | ------------- | --------------- |
| baseline (2026-08-15) | 9.09          | —               |
| after `e6f8cf36`      | 10.35 – 10.87 | **+14 to +20%** |
| after this change     | 7.29 – 7.65   | **−16 to −20%** |

`sha=62edaf171bf6` throughout: byte-identical output at every step.

## Finding it

Four `bench:ssr` runs put menu at +15, +14, +14, +15% while every other layer swung −8 to −34%, so
it was signal, not the ~11% thermal drift this machine shows between runs.

Two hypotheses died first, both worth recording so they are not re-run:

- **Not uncommitted work.** A worktree at the committed `b7f36e10` measured menu at +20%, i.e. worse
  than the working tree's +15%. The regression arrived with `e6f8cf36 refactor(kernel)`.
- **Not the lazy registry's linear scans.** `NodeRegistry.registerLazy`/`nodeByPart` replaced Map
  lookups with scans over `#order`, which reads as O(N²) for a bond holding N item registrations.
  Measured across 100 → 1600 items: 6.47, 6.03, 6.32, 6.71, 6.57 µs/item. Flat. The added cost was
  flat per item.

Note in passing: `1f1a3be1` does not build — `tree-root.svelte` imports
`$ixirjs/ui/kernel/index.svelte`, and `src/lib/components/atom/kernel/` does not
exist until the next commit. That breaks `git bisect` across this range.

## The fix

`DropdownMenu.Item` renders its own element through `Kernel.element`, but was still building an Atom
**packet** first:

```svelte
const itemAttrs = $derived(mergeAtomProps(atom, preset, restProps, menu.presetLayer('item')));
const el = Kernel.element(Kernel.static, () => ({ as, class: …, ...itemAttrs, onclick: handleClick }));
```

`mergeAtomProps` allocates up to three objects, and holding it in a `$derived` costs a signal — per
item — to produce what `buildKernelElement` already does internally via
`mergeAtomPresentationProps`. Handing the Atom to the seam instead removes the packet, the spread and
the signal:

```svelte
const el = Kernel.element(Kernel.static, () => ({
	as, class: …, atom, ...restProps,
	preset: preset ?? atom.preset,
	presetLayer: menu.presetLayer('item') ?? restProps.presetLayer,
	onclick: handleClick
}));
```

`preset` restates `mergeAtomProps`'s `preset ?? atom.preset` fallback explicitly, because the seam's
own fallback is `seam.preset` and `Kernel.static` carries none. Passing `atom:` does not make the
bond visible to preset resolution — `atom` and `bond` are separate axes and `bond` stays unset, which
is what preserves function-form preset entries called as `entry({ bond })`.

The win is CPU, not allocation: menu's scavenge count is unchanged at 52–53 per 1k units.

## The behaviour change that isn't one

Through the seam, `onclick` **composes** with the Atom's handler rather than replacing it.
`composeHandlers` runs the consumer's handler first and skips the Atom's when the default was
prevented; `handleClick` prevents it before calling `atom.close(ev)` itself. So the Atom's close
never fires twice, and observable behaviour is identical — confirmed by A/B: the pre-change and
post-change components pass and fail the same fixtures identically.

## Testing it — and why the obvious assertion is worthless

`dropdown-menu-item-click.svelte.spec.ts` counts `stageOpenChange({ reason: 'item-select' })`, not
`onopenchange`. That is deliberate:

- **`onopenchange` is blind to a double-fire.** The second `close()` lands on an already-closed menu
  and changes nothing, so the count reads 1 whether the handler fired once or twice. Verified by
  mutation: dropping the item's `preventDefault` — which _does_ double-fire — left an "exactly once"
  assertion on `onopenchange` still passing. The `stageOpenChange` version fails under the same
  mutation, which is what makes it a test.
- **The fixture must suppress outside-press.** The item is hoisted out of `Content` (inside it, it
  portals, and resolving that needs a portal host). `Content` is the dismissible surface, so a click
  on a hoisted item reads as an outside press — which fires on `pointerdown`, _before_ the click
  handler under test, closing the menu first and masking everything.
  `outsidePressListener({ listen: false })` re-registers that slot with its listener suppressed.

## The reusable rule

A part that renders its **own element** hands the Atom to the seam (`atom:` in the Kernel config).
The `mergeAtomProps` packet is for handing props to **another component** — `Input.Control`,
`PortalHost`, `Stack.Root` — which has no seam to pass the Atom through. `AGENTS.md` already said the
packet "allocates a merged object and a signal that Kernel's direct seam avoids"; this measures it at
~29% of a menu item.

Remaining callers of `mergeAtomProps`, by whether the shape multiplies per page:

- `calendar-day.svelte` — 28–42 per calendar, the best remaining candidate, but **its precedence is
  inverted**: `...dayProps` is spread LAST, so the Atom's attrs and `onclick` override the
  component's own. Routing it through the seam flips that. Needs its own fixture and a bench layer
  (there is no calendar layer in `bench:ssr`), so it was left alone rather than guessed at.
- `calendar-week-day` (7 per calendar), `scrollable-thumb`/`-track`, `popover-trigger`/`-tail`/
  `-content` — one or a handful per page; not worth the churn.
- `dialog-root`, `drawer-root` — roots handing props to another component. These must keep the packet.
