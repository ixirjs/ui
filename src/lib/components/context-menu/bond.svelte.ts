import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
import type { DropdownMenuBondProps } from '$ixirjs/ui/components/dropdown-menu/bond.svelte';
import type { ContextMenuBond } from '$ixirjs/ui/components/overlay/popup/types';
export type { ContextMenuBond } from '$ixirjs/ui/components/overlay/popup/types';

export type ContextMenuBondProps = DropdownMenuBondProps;

export const ContextMenuContext = Kernel.context<ContextMenuBond>('bond/context-menu');
export type ContextMenuBondBase<Props extends ContextMenuBondProps = ContextMenuBondProps> = Omit<
	ContextMenuBond,
	'props'
> & { readonly props: Props };
