export { DropdownMenu } from '$ixirjs/ui/components/dropdown-menu';
export type * from '$ixirjs/ui/components/dropdown-menu/types';
export type { DropdownMenuItemProps } from '$ixirjs/ui/components/dropdown-menu/item/types';

// The parts by name, beside the namespace. `<DropdownMenu.Root>` is a member expression — a DYNAMIC
// component with a fragment boundary per part: a table row of four parts measured mount −37%,
// hydrate −28% and 5 hydration anchors fewer on the direct call site (`bench:vs-shadcn`,
// 2026-08-27). Use these where one part renders many times.
export {
	DropdownMenuRoot,
	DropdownMenuTrigger,
	DropdownMenuContent
} from '$ixirjs/ui/components/dropdown-menu';
// The item is the multiplied part here, and the internal barrel cannot name it — `DropdownMenuItem`
// is taken there by the item's TYPE. The published barrel has no such clash.
export { default as DropdownMenuItem } from '$ixirjs/ui/components/dropdown-menu/item/dropdown-menu-item.svelte';

export type { DropdownMenuBond } from '$ixirjs/ui/components/overlay/popup/types';
