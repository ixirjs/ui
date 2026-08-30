/**
 * Sidebar's shared object — a plain state class on the redesigned `Kernel`: an overlay with no
 * modal behaviour of its own, whose `overlay` mode hands the surface to `PortalSurface`.
 */
import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
import {
	OverlayBond,
	type OverlayLike,
	type OverlayProps
} from '$ixirjs/ui/components/overlay/model.svelte';

export type SidebarBondProps<T extends Record<string, unknown> = Record<string, unknown>> =
	OverlayProps & {
		reversed?: boolean | undefined;
		extend?: T;
	};

export const SidebarContext = Kernel.context<SidebarBond>('sidebar');

export class SidebarBond extends OverlayBond<SidebarBondProps> {
	constructor(props: SidebarBondProps, name = 'sidebar') {
		super(props, name);
	}
	// The `OverlayLike` arm exists only to satisfy TS's static-side check against
	// `OverlayBond.create(outer?)`; callers pass props.
	static override create(props: SidebarBondProps | OverlayLike = {}): SidebarBond {
		return new SidebarBond(props as SidebarBondProps);
	}
	static get(): SidebarBond | undefined {
		return SidebarContext.get();
	}
	static getOrThrow(message?: string): SidebarBond {
		return SidebarContext.getOrThrow(message);
	}
}
