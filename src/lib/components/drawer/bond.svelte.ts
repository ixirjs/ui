/**
 * Drawer's shared object — a plain state class on the redesigned `Kernel`.
 *
 * Same surface the family always had (`{ drawer }`, `getBond`, `factory`, `DrawerBond.create`,
 * `props.side`), none of the runtime: the modal behaviour is `useModal(bond)` at the root and the
 * policies in `overlay/behavior.svelte.ts`, written literally into each part's attrs.
 */
import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
import {
	OverlayBond,
	type OverlayLike,
	type OverlayProps
} from '$ixirjs/ui/components/overlay/model.svelte';
import type { DrawerPresets } from './types';

export type DrawerBondProps<T extends Record<string, unknown> = Record<string, unknown>> =
	OverlayProps & {
		disabled?: boolean | undefined;
		side?: 'left' | 'right' | 'top' | 'bottom';
		extend?: T;
		presets?: DrawerPresets | undefined;
	};

export const DrawerContext = Kernel.context<DrawerBond>('drawer');

// Controlled slide-out modal (no trigger — use PopoverDialog for that).
export class DrawerBond extends OverlayBond<DrawerBondProps> {
	constructor(props: DrawerBondProps, name = 'drawer') {
		super(props, name);
	}
	// The `OverlayLike` arm exists only to satisfy TS's static-side check against
	// `OverlayBond.create(outer?)`; callers pass props.
	static override create(props: DrawerBondProps | OverlayLike = {}): DrawerBond {
		return new DrawerBond(props as DrawerBondProps);
	}
	static get(): DrawerBond | undefined {
		return DrawerContext.get();
	}
	static getOrThrow(message?: string): DrawerBond {
		return DrawerContext.getOrThrow(message);
	}
}
