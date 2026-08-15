export * as DropdownMenu from './atoms';
export * from './types';
export {
	PopoverBond,
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
	DropdownMenuBond,
	DropdownMenuBondBase,
	DropdownMenuContentAtom,
	DropdownMenuTriggerAtom,
	DropdownMenuItemAtom,
	type DropdownMenuBondProps
} from './bond.svelte';
