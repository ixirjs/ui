---
name: bondatom-preset-getter
description: BondAtom.preset / Bond.preset getters and the remaining namespace-vs-preset divergences in svelte-atoms
metadata:
  node_type: memory
  type: reference
  originSessionId: 000be049-bfe5-4171-b778-430da249e8f6
---

`Bond` and `BondAtom` (src/lib/shared/bond.svelte.ts) expose two _distinct_
identities — see CONTEXT.md §preset:

- `Bond.namespace` — DOM identity (`data-bond`, `kind`, ids). Hyphenated
  (`accordion-item`, `dropdown-menu`). Defaults to `name`.
- `Bond.preset` — dotted preset **base path**. Defaults to `namespace`. Nested
  child bonds override it (e.g. `accordion-item` bond → `'accordion.item'`,
  `step` → `'stepper.step'`, datagrid row/column → `'datagrid.row'`/`.column`).
- `BondAtom.preset` — the atom's default key: **root atom → `bond.preset`**
  (bare base, no `.root`); any other atom → `` `${bond.preset}.${name}` ``
  (hyphens inside a name preserved, e.g. `alert.close-button`).

Components consume it as the default, caller overrides:
`preset: preset ?? atom.preset` (or `atom?.preset` when the bond is optional).
**Do not restate the literal key in the `.svelte`.** Migrated families: accordion,
dialog, drawer, collapsible, tree, sidebar, toast, tabs, field, datagrid
(root/row/column), stepper (root + step/\*), plus popover/select/scrollable.

Note: `HtmlAtomProps.preset` is typed `PresetKey | undefined` so that
`preset ?? atom?.preset` (optional atom ⇒ possibly-undefined) type-checks under
`exactOptionalPropertyTypes`. The pipeline treats `undefined` as "no preset".

**Remaining genuine divergences (atom.preset ≠ literal — pre-existing bugs / kept
literals):**

- `combobox-control`: accessor `control()` but atom key is `input` →
  `combobox.input`, not the literal `combobox.control`. (open decision)
- `menu-content`: MenuBond inherits popover namespace → `popover.content`, not
  `menu.content`; MenuBond should override `namespace`/`preset` to `menu`. (open)
- `scrollable` `*-track`/`*-thumb`, `stack` `*-item`: axis-/value-specific atom
  keys (`trackX`, `item-<value>`) vs generic literals — keep literals.
- `dropdown/*` is a deprecated alias of `select` (namespace `select`) → keep literals.
- `context-menu`/`tooltip` borrow dropdown-menu/popover bonds with an intentional
  re-namespaced literal — keep literals.
- **No-atom / plain-object bonds — out of scope entirely:** `card`, `calendar`
  (their `root()`/slots return plain attr objects, not `BondAtom`), `input`
  (manual attachment-key pattern), and purely presentational components
  (`badge`, `icon`, `divider`, `kbd`, `image`, `label`, `link`, `avatar`, `list`).
- Collection-item atoms (`SelectItemAtom`, dropdown/menu item) use instance keys
  like `item-${value}`, so read the shared preset from the bond's canonical
  `item()` atom, not the instance.

Used by [[atom-preset-in-script]].
