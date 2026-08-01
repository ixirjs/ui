import type { Component } from 'svelte';
import type { PopoverBond } from './bond.svelte';

// Props passed to all popover strategy components.
export type PopoverStrategyProps = {
	// The popover bond instance.
	bond: PopoverBond;
	// Reference to trigger element (may be undefined during mount).
	trigger?: HTMLElement;
	// Reference to content element (may be undefined during mount).
	content?: HTMLElement;
	// Whether the popover is currently open.
	open: boolean;
};

// A Svelte component that controls how popover content is positioned and rendered.
// Receives bond, trigger/content elements, and open state; must clean up on unmount.
export type PopoverStrategy = Component<PopoverStrategyProps>;
