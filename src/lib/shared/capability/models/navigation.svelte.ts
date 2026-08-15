import {
	capabilityKey,
	defineRoleProjection,
	type Capability
} from '$ixirjs/ui/shared/capability/capability';
import { ROVING, type RovingFocus } from './roving.svelte';

// Private slot key (process-unique Symbol, not exported from the public barrel): navigation is a
// behavior-only policy that nobody retrieves by key, so it stays unforgeable — no consumer can name
// the slot to replace it. The private seam.
export const NAVIGATION = capabilityKey<RovingFocus>('navigation');

// Options for `navigationCapability`'s keydown projection.
export interface NavigationProjectionOptions {
	// Arrow axis: 'vertical' → Up/Down, 'horizontal' → Left/Right, 'both' → all four. Default 'vertical'.
	orientation?: 'vertical' | 'horizontal' | 'both';
	// Roles that receive the navigation keydown. Default ['container'].
	roles?: readonly string[];
	// Bind Home/End to first/last. Default true — APG specifies Home/End for every composite widget
	// this capability drives (listbox, menu, tree, tabs), so opting *out* is the rare case.
	homeEnd?: boolean;
	// preventDefault on a handled key (stops the page from scrolling). Default false.
	preventScroll?: boolean;
	// Called with the new active id after a key moved the highlight. This is the keyboard-only
	// seam: widgets whose items carry real DOM focus (tabs, accordion headers) focus here, and
	// pointer-driven `goto` deliberately does not fire it.
	onMove?: (id: string | null) => void;
}

// Keyboard navigation as a projectable Capability (slot 'navigation') over a RovingFocus surface.
// Projects an onkeydown that drives next/previous/first/last onto the configured roles, replacing
// the per-component arrow handlers that each hand-rolled the same roving moves.
export function navigationCapability(
	roving: RovingFocus,
	options: NavigationProjectionOptions = {}
): Capability<RovingFocus> {
	const orientation = options.orientation ?? 'vertical';
	const roles = options.roles ?? ['container'];
	const homeEnd = options.homeEnd ?? true;
	const preventScroll = options.preventScroll ?? false;
	const vertical = orientation === 'vertical' || orientation === 'both';
	const horizontal = orientation === 'horizontal' || orientation === 'both';

	const onkeydown = (ev: KeyboardEvent): void => {
		if (ev.defaultPrevented) return;
		let handled = true;
		let moved: string | null = null;
		// Home/End always preventDefault: jumping the page to top/bottom while the highlight moves is
		// never what the user meant. Arrows stay governed by `preventScroll` — a closed trigger also
		// receives them, and swallowing page scroll there would be a surprise.
		if (vertical && ev.key === 'ArrowDown') moved = roving.next();
		else if (vertical && ev.key === 'ArrowUp') moved = roving.previous();
		else if (horizontal && ev.key === 'ArrowRight') moved = roving.next();
		else if (horizontal && ev.key === 'ArrowLeft') moved = roving.previous();
		else if (homeEnd && ev.key === 'Home') moved = roving.first();
		else if (homeEnd && ev.key === 'End') moved = roving.last();
		else handled = false;
		if (!handled) return;
		if (preventScroll || ev.key === 'Home' || ev.key === 'End') ev.preventDefault();
		options.onMove?.(moved);
	};

	// Roles are configured at runtime (options.roles), which is what `defineRoleProjection` exists
	// for — the same projection on each configured role, rather than a statically named role map.
	return defineRoleProjection<RovingFocus>({
		slot: NAVIGATION,
		roles,
		surface: roving,
		requires: [ROVING],
		docs: 'Keyboard navigation policy that drives a roving focus surface.',
		handlers: () => ({
			onkeydown: ((ev: Event) => onkeydown(ev as KeyboardEvent)) as (ev: Event) => void
		})
	});
}
