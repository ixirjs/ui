import { capabilityKey, type Behavior, type Capability } from '../bond.svelte';
import { ROVING, type RovingFocus } from './roving-focus.svelte';

// Private slot key (process-unique Symbol, not exported from the public barrel): navigation is a
// behavior-only policy that nobody retrieves by key, so it stays unforgeable — no consumer can name
// the slot to replace it. The private seam (#2). ADR 0005 D6.
export const NAVIGATION = capabilityKey('navigation');

// Options for `navigationCapability`'s keydown projection.
export interface NavigationProjectionOptions {
	// Arrow axis: 'vertical' → Up/Down, 'horizontal' → Left/Right, 'both' → all four. Default 'vertical'.
	orientation?: 'vertical' | 'horizontal' | 'both';
	// Roles that receive the navigation keydown. Default ['container'].
	roles?: readonly string[];
	// Bind Home/End to first/last. Default false (opt-in).
	homeEnd?: boolean;
	// preventDefault on a handled key (stops the page from scrolling). Default false.
	preventScroll?: boolean;
}

// Keyboard navigation as a projectable Capability (slot 'navigation') over a RovingFocus surface.
// Projects an onkeydown that drives next/previous/first/last onto the configured roles, replacing
// the per-component arrow handlers that each hand-rolled the same roving moves. (#2)
export function navigationCapability(
	roving: RovingFocus,
	options: NavigationProjectionOptions = {}
): Capability<RovingFocus> {
	const orientation = options.orientation ?? 'vertical';
	const roles = options.roles ?? ['container'];
	const homeEnd = options.homeEnd ?? false;
	const preventScroll = options.preventScroll ?? false;
	const vertical = orientation === 'vertical' || orientation === 'both';
	const horizontal = orientation === 'horizontal' || orientation === 'both';

	const onkeydown = (ev: KeyboardEvent): void => {
		if (ev.defaultPrevented) return;
		let handled = true;
		if (vertical && ev.key === 'ArrowDown') roving.next();
		else if (vertical && ev.key === 'ArrowUp') roving.previous();
		else if (horizontal && ev.key === 'ArrowRight') roving.next();
		else if (horizontal && ev.key === 'ArrowLeft') roving.previous();
		else if (homeEnd && ev.key === 'Home') roving.first();
		else if (homeEnd && ev.key === 'End') roving.last();
		else handled = false;
		if (handled && preventScroll) ev.preventDefault();
	};

	return {
		slot: NAVIGATION,
		surface: roving,
		requires: [ROVING],
		behavior(role): Behavior | undefined {
			if (!roles.includes(role)) return undefined;
			return {
				handlers: () => ({ onkeydown: ((ev: Event) => onkeydown(ev as KeyboardEvent)) as (ev: Event) => void })
			};
		}
	};
}
