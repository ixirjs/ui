export * as DropdownMenu from './atoms';
export * from './types';
export {
	type PopoverBond,
	type PopoverParams,
	type PopoverStateProps,
	type TriggerParams
} from '$ixirjs/ui/components/popover';

export type {
	AnimatePopoverContentParams as AnimateDropdownMenuContentParams,
	animatePopoverContent as animateDropdownMenuContent
} from '$ixirjs/ui/components/popover/motion.svelte';

export * from './item';
export { dropdownMenu } from './attachments.svelte';
export {
	type DropdownMenuBond,
	type DropdownMenuBondBase,
	DropdownMenuContext,
	menuKeydown,
	menuSource,
	useMenuRoot,
	type DropdownMenuBondProps,
	type DropdownMenuItem,
	type MenuItemSource
} from './bond.svelte';

// The same parts, named directly. `<DropdownMenu.Root>` is a member expression, so the compiler treats it as a
// DYNAMIC component and wraps its output in a fragment boundary — measured at ~2.2 µs and ~1.5
// hydration anchors per part (card mount −20%, hydrate −27%, retained heap −21% on the direct call
// site; `bench:vs-shadcn`, 2026-08-27). The namespace stays the ergonomic default; reach for these
// where one part renders many times — a long list, a grid cell, a table row.
export { default as DropdownMenuRoot } from './dropdown-menu-root.svelte';
export { default as DropdownMenuTrigger } from './dropdown-menu-trigger.svelte';
export { default as DropdownMenuContent } from './dropdown-menu-content.svelte';
