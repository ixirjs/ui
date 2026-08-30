# The DataGrid row stops being a Bond (2026-08-23)

Closes item 1 of `perf-vs-shadcn-2026-08.md` §13's "still open, ranked by what it would actually
buy" — _"a row / a node that is not a Bond root, the only lever left that changes an order of
magnitude"_. That entry estimated the row's Bond at ~11–12 µs of ~16 **from the cost model**, and
named the change a public-surface redesign nobody had sanctioned.

## 0. Summary

- Measured first, with a new decomposition bench (`bun run bench:row`). The estimate was **low**:
  the Bond and its element were **~19 µs of ~28, about 70%** of a three-cell row, stable across
  five runs. Three cells cost ~2.6 µs each; hand-written markup costs 0.4 µs.
- `DataGrid.Row` now builds a Bond **only when the consumer passes `factory`**, whose entire
  purpose is to construct one. By default it registers a `DataGridRowRecord` with the grid.
- **`bench:ssr` datagrid: 25.47 → ~14.4 µs/row, and the output fingerprint is UNCHANGED**
  (`sha=24b47c3f9fb4`, 782 B/unit). `data-bond`/`data-kind` are DEV-only, so production markup is
  byte-identical. `bench:row`'s `full` arm reads ~15.6–16.7 µs against ~27–30 before.
- Hydration anchors per row are **unchanged at 20**. The first draft dispatched two snippets and
  cost 21; both shapes are Kernel handles, so one `Kernel.render(bondRoot ?? recordEl)` serves both.

## 1. Why the Bond was removable

The row Bond held no state. Selection has always lived on the grid — `DataGridRowBondBase.isSelected`
was `this.#parent.isSelected(this.id)`, and `select()`/`unselect()` delegated straight back. What the
Bond actually carried was **identity**, and identity is what a `Collection` entry already is.

That is the same division `@tanstack/table-core` makes, and it is why shadcn-svelte's `table-row.svelte`
can be a bare `<tr>` with one CSS hook: `rowSelection` is a `Record<string, boolean>` on the table.
bits-ui ships no table at all; where it does multi-select, `SelectItemState` is a class per item whose
`includesItem` is an `Array.includes` called three times per item.

**What we keep that shadcn does not:** its selected row carries only `data-state="selected"`, a
styling hook — there is no `aria-selected` anywhere in its table. Ours is reproduced literally on the
record row, along with `role="row"`, the present-only `data-selected` hook, `data-header`, and an
`id` byte-identical to the one the Atom produced.

## 2. The shape

`IDataGridRowApi` (`row/record.svelte.ts`) is the interface both shapes implement — `id`,
`isSelected`, `isHeader`, `datagrid`, `props`, `select()`, `unselect()`. `{ row }` is typed as that
interface rather than as `DataGridRowBond`, so `row.select()` and `row.isSelected` compile and behave
identically on either path.

`DataGridRowRecord` owns **no signals**. Every reactive read is a getter over the grid, so selection
stays live without the row holding state.

Two things the redesign had to route around:

- **`DataGrid.Checkbox` read `DataGridRowBond.get()`.** It now reads the row through
  `getDatagridRowContext()` — the interface, published by both paths — for state and actions, and
  keeps a separate `DataGridRowBond.get()` purely for `<Checkbox bond={…}>`, so a function-form preset
  entry is still invoked as `entry({ bond })` with the value it always had. Passing the grid's bond
  instead would silently change what such an entry resolves.
- **Capabilities project onto Atoms, and a record has none.** `role="row"` (from `rowColumnCellLink`),
  `aria-selected` + `data-selected` (from `selectionCapability`'s `item` role) and `data-header` are
  emitted literally, in the same true/absent shape the capabilities produced. A header row carries
  neither selection attribute, exactly as before — it never took the `item` role.

## 3. What it costs

The record path loses the DEV-only `data-bond`/`data-kind` debug attributes on rows, and one
attribute order shifts (`role` now precedes `data-header`). Sanctioned deliberately; the family-ssr
snapshot was re-recorded and the diff verified to contain nothing else. Production output is
unchanged, which is why no `bench:ssr` fingerprint moved.

`factory` still works and still constructs a real Bond, so nothing shipped was removed.

## 4. What is left

`bench:row` still reports the row at ~5 µs over a bare prototype row. That residual is preset
resolution, `$preset` composition and restProps — shared machinery, not row-specific, and the right
place to attack it is the element seam rather than this family.

**The same lever applies to tree**, where `tree-node-cost-2026-08.md` §3c reached this conclusion
independently and stopped for the same public-surface reason. A tree node is a nested `Tree.Root`,
so the equivalent change is larger: `ITreeNode`, `getBond` and the `{ tree }` argument are all
public, and nesting is expressed through context rather than through a collection. Not attempted.
