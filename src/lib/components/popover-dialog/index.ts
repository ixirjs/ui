// PopoverDialog — the Popover/Dialog fusion: Popover's trigger opens Dialog's modal content.
// One Bond (`PopoverDialogBond`, consistent with DialogBond/DrawerBond) shared under both halves'
// context keys, so each half's own parts render unchanged under it.
export * as PopoverDialog from './atoms';
export { type PopoverDialogBond, type PopoverDialogBondProps } from './bond.svelte';
export * from './types';

// The same parts, named directly. `<PopoverDialog.Root>` is a member expression, so the compiler treats it as a
// DYNAMIC component and wraps its output in a fragment boundary — measured at ~2.2 µs and ~1.5
// hydration anchors per part (card mount −20%, hydrate −27%, retained heap −21% on the direct call
// site; `bench:vs-shadcn`, 2026-08-27). The namespace stays the ergonomic default; reach for these
// where one part renders many times — a long list, a grid cell, a table row.
export { default as PopoverDialogRoot } from './popover-dialog-root.svelte';
export { default as PopoverDialogDialog } from './popover-dialog-dialog.svelte';
