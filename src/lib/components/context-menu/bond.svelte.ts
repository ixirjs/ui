/**
 * ContextMenu's shared object on the redesigned `Kernel` — a plain state class over DropdownMenu.
 *
 * Two things separate it from its parent: the trigger opens from the native `contextmenu` gesture
 * only (`triggerToggles` is false, which is what `manualTrigger` used to express), and the floating
 * anchor is a virtual element built from the pointer position rather than the trigger's own box.
 */
import type { VirtualElement } from '@floating-ui/dom';
import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
import {
	DropdownMenuBondBase,
	type DropdownMenuBondProps
} from '$ixirjs/ui/components/dropdown-menu/bond.svelte';
import type { OverlayLike } from '$ixirjs/ui/components/overlay/model.svelte';

export type ContextMenuBondProps = DropdownMenuBondProps;

export const ContextMenuContext = Kernel.context<ContextMenuBondBase>('bond/context-menu');

export class ContextMenuBondBase<
	Props extends ContextMenuBondProps = ContextMenuBondProps
> extends DropdownMenuBondBase<Props> {
	/** The pointer-anchored reference the trigger writes on right-click. */
	virtualElement = $state<VirtualElement | undefined>(undefined);

	constructor(props: Props) {
		super(props, 'context-menu');
	}

	/** ARIA only: a context menu never opens from a plain click or Enter/Space on its trigger. */
	override get triggerToggles(): boolean {
		return false;
	}

	override get reference(): Element | VirtualElement | null {
		return this.virtualElement ?? super.reference;
	}
}

export class ContextMenuBond extends ContextMenuBondBase {
	static override create(props: ContextMenuBondProps): ContextMenuBond;
	static override create(outer?: OverlayLike): ContextMenuBond;
	static override create(props?: ContextMenuBondProps | OverlayLike): ContextMenuBond {
		return new ContextMenuBond(props as ContextMenuBondProps);
	}
}
