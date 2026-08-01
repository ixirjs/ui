import type { Component } from 'svelte';
import type { PopoverBond } from './bond.svelte';

// Props passed to all popover strategy components.
export type PopoverStrategyProps = {
	bond: PopoverBond;
	// May be undefined during mount.
	trigger?: HTMLElement;
	// May be undefined during mount.
	content?: HTMLElement;
	open: boolean;
};

// A Svelte component that positions/renders popover content; must clean up on unmount.
export type PopoverStrategy = Component<PopoverStrategyProps>;
