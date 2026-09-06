# One popup implementation, family-named contracts

**Production successor and regression harness:** see [replacement/README.md](./replacement/README.md) for the
eight-family implementation and its parity gates.

This directory retains the earlier four-profile **test-only** experiment. It is not a production migration and is excluded from
the published package by the existing `test/**` exclusion. The earlier `../disclosure/` experiment
remains as a regression reference; its trigger behavior is reused here.

## Authoring

```ts
import { PopupBond } from './bond.svelte';
import { PopupAtom } from './atom.svelte';
import type { PopoverBond, SelectBond, ComboboxBond, SelectItemAtom } from './types';

const popover: PopoverBond = PopupBond.create('popover', liveProps);
const select: SelectBond = PopupBond.create('select', liveProps);
const combobox: ComboboxBond = PopupBond.create('combobox', liveProps);

const trigger = PopupAtom.trigger(select);
const content = PopupAtom.content(select);
const item: SelectItemAtom = select.item('pear');
const element = PopupAtom.item(item);
// The Svelte part spreads element.attrs on its literal tag.
```

The annotations are optional: the profile infers its Bond contract, and `select.item()` infers
`SelectItemAtom`. There are **no family-specific runtime classes, factory casts or generated
subclasses**. Each root owns one distinct instance of the same `PopupBond` class.

`types.ts` contains family-named `XBond` and `XAtom` interfaces. `contracts.type-test.ts` demonstrates
inference and rejection of unsupported functionality. `isDropdownMenuBond`, `isSelectBond` and
`isComboboxBond` provide discovery when receiving a common interface from this factory. Profile
identity is immutable; unsupported capability getters throw if an untyped caller bypasses typing.

## Canonical implementations

| File                                                | Owns                                                                                                                            |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `bond.svelte.ts`                                    | The sole PopupBond implementation: model composition, authoritative commits, query synchronization, activation and close policy |
| `atom.svelte.ts`                                    | Shared trigger/content/query/item rendering roles; returns Kernel elements directly, with no new rendering wrapper              |
| `item.ts`                                           | One CollectionItemAtom implementation: identity, predicates, parent-delegated commands and registration cleanup                 |
| `types.ts`                                          | Family contracts only: Popover/DropdownMenu/Select/Combobox Bonds, part Atoms and item Atoms                                    |
| `popup-root.test.svelte`                            | Live-prop wiring and profile choice; no family-specific behavior implementation                                                 |
| `popup-parts.test.svelte`, `popup-item.test.svelte` | The same part components for all profiles                                                                                       |

## Profile composition

| Profile         | Disclosure / position calculation | Navigation / typeahead | Selection | Query input |
| --------------- | --------------------------------- | ---------------------- | --------- | ----------- |
| `popover`       | Yes                               | No                     | No        | No          |
| `dropdown-menu` | Yes                               | Yes                    | No        | No          |
| `select`        | Yes                               | Yes                    | Yes       | No          |
| `combobox`      | Yes                               | Yes                    | Yes       | Yes         |

The constructor instantiates only the needed behavior models. No runtime capability registry,
installation ordering protocol or separate family setup function is introduced. Models are the
existing `createDisclosure`, `createRovingFocus`, `createTypeahead`, `createSelection` and
`createInput`; position calculation uses the installed Floating UI implementation.

## Ownership and orchestration

- Props are live, **reactive** getters/setters owned by the root, not copied state. The selection
  model's indexed reads rely on that contract.
- `options` is the full authoritative data source. Its unique values and labels exist independently
  of mounted item handles. Query filtering is not supplied by this prototype.
- The parent owns navigation, selected values and query state. Items derive their predicates and
  delegate operations; there is no ItemBond and no mirrored selection/highlight state.
- Activation commits selection, synchronizes single-mode Combobox query to the selected **value**,
  notifies the consumer, reports activation, then closes according to policy. A rejected selection
  does not close the popup. Direct selection-model writes use the same commit path.
- Multiple selection toggles membership and stays open by default; `closeOnSelect` overrides this.
- Keyboard navigation skips disabled options. Typeahead searches full data, including unmounted
  options. Editable query text is not consumed by menu typeahead.
- `aria-activedescendant` is emitted only for a mounted active item. This does not implement the
  scrolling needed to bring an unmounted active option into a viewport.
- `PopupAtom.item` owns item teardown through one stable attachment. `bond.dispose()` releases
  typeahead timers and any remaining handles; the root calls it on destruction. Disposing an old
  handle twice cannot remove a newer registration.

## Verification

```sh
bunx vitest run src/lib/test/prototypes/popup src/lib/test/prototypes/disclosure
bun run check
bunx eslint src/lib/test/prototypes/popup/
```

Tests cover common runtime identity, typed functionality discovery, disabled and duplicate guards,
selection/query/callback ordering, rejected writes, exception-context isolation, offscreen data,
item remount/teardown, typeahead cleanup, browser keyboard/pointer behavior, SSR relationships and
real floating-position calculations. A deterministic 400-item check verifies that registration and
per-item reads do not repeatedly evaluate the owner-wide option source. This is **not** a measured
mount-growth, memory or throughput claim.

## Scope limits before production migration

This proves the authoring shape, not full equivalence with shipped overlay families. It does not
implement portals, modal/focus restoration, nested overlay arbitration, outside dismissal, hover
or context-menu triggers, continuous positioning, motion, freeform Combobox entries, repeated
trigger/content slots, or the complete public prop/preset/factory contracts. The position interface
returns a calculation; a future mounted policy must own style application and stale-result cleanup.
The fixture stays in normal flow deliberately. All shipped classes, exports and baselines remain
unchanged. A real long-list consumer must use `createVirtual`, not the fixture's mount-test seam.
