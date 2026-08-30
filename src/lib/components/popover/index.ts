export * as Popover from './atoms';
export { clickoutPopover, popover } from './attachments.svelte';
export {
	PopoverBond,
	PopoverBondBase,
	PopoverContext,
	type PopoverBondProps,
	type PopoverParams,
	type PopoverStateProps,
	type TriggerParams
} from './bond.svelte';
export * from './motion.svelte';
export * from './types';
export * from './strategy-types';
export * as PopoverStrategies from './strategies';

// The same parts, named directly. `<Popover.Root>` is a member expression, so the compiler treats it as a
// DYNAMIC component and wraps its output in a fragment boundary — measured at ~2.2 µs and ~1.5
// hydration anchors per part (card mount −20%, hydrate −27%, retained heap −21% on the direct call
// site; `bench:vs-shadcn`, 2026-08-27). The namespace stays the ergonomic default; reach for these
// where one part renders many times — a long list, a grid cell, a table row.
export { default as PopoverRoot } from './popover-root.svelte';
export { default as PopoverTrigger } from './popover-trigger.svelte';
export { default as PopoverContent } from './popover-content.svelte';
export { default as PopoverIndicator } from './popover-indicator.svelte';
export { default as PopoverTail } from './popover-tail.svelte';
