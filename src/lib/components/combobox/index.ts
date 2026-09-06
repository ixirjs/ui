export * as Combobox from './atoms';

// Family state interface and context; runtime construction belongs to PopupBond.
export * from './bond.svelte';

export * from './types';

export type {
	AnimatePopoverContentParams as AnimateComboboxContentParams,
	animatePopoverContent as animateComboboxContent
} from '$ixirjs/ui/components/popover/motion.svelte';

// The same parts, named directly. `<Combobox.Root>` is a member expression, so the compiler treats it as a
// DYNAMIC component and wraps its output in a fragment boundary — measured at ~2.2 µs and ~1.5
// hydration anchors per part (card mount −20%, hydrate −27%, retained heap −21% on the direct call
// site; `bench:vs-shadcn`, 2026-08-27). The namespace stays the ergonomic default; reach for these
// where one part renders many times — a long list, a grid cell, a table row.
export { default as ComboboxRoot } from './combobox-root.svelte';
export { default as ComboboxTrigger } from './combobox-trigger.svelte';
export { default as ComboboxItem } from './combobox-item.svelte';
export { default as ComboboxControl } from './combobox-control.svelte';
export { default as ComboboxSelections } from './combobox-selections.svelte';
