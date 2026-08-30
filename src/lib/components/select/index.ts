export * as Select from './atoms';

export { SelectBond, SelectBondBase, SelectContext, type SelectStateProps } from './bond.svelte';

export * from './item';

export { filterSelectData } from './runes.svelte';
export * from './types';

export type {
	AnimatePopoverContentParams as AnimateSelectContentParams,
	animatePopoverContent as animateSelectContent
} from '$ixirjs/ui/components/popover/motion.svelte';

export { select } from './attachments.svelte';

// The same parts, named directly. `<Select.Root>` is a member expression, so the compiler treats it as a
// DYNAMIC component and wraps its output in a fragment boundary — measured at ~2.2 µs and ~1.5
// hydration anchors per part (card mount −20%, hydrate −27%, retained heap −21% on the direct call
// site; `bench:vs-shadcn`, 2026-08-27). The namespace stays the ergonomic default; reach for these
// where one part renders many times — a long list, a grid cell, a table row.
export { default as SelectRoot } from './select-root.svelte';
export { default as SelectItem } from './item/select-item.svelte';
export { default as SelectTrigger } from './select-trigger.svelte';
export { default as SelectPlaceholder } from './select-placeholder.svelte';
export { default as SelectQuery } from './select-query.svelte';
export { default as SelectSelections } from './select-selections.svelte';

// SelectSelection not re-exported here: the family already publishes that name as a TYPE. Import the
// component file directly where a hot path needs it.
