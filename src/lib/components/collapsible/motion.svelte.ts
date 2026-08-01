import { untrack } from 'svelte';
import { animate, type Easing } from '@ixirjs/ui/shared';
import { CollapsibleBond } from '.';
import { DURATION } from '@ixirjs/ui/shared';
import { stopMotion } from '$ixirjs/ui/components/element/motion-host';

export type AnimateCollapsibleBodyParams = {
	duration?: number;
	delay?: number;
	ease?: Easing | Easing[];
};

export function animateCollapsibleBody(params: AnimateCollapsibleBodyParams = {}) {
	const bond = CollapsibleBond.get();
	return (node: HTMLElement) => {
		const { duration = DURATION.fast / 1000, delay = 0, ease } = params;

		const isOpen = bond?.isOpen ?? false;

		// Returning the controller lets whichever host drives this phase cancel a superseded run.
		// Phases here share one duration, so an interrupted run always settles before its successor
		// and cannot overwrite it — what this prevents is stacking a filled WAAPI animation on the
		// element for every toggle.
		return animate(
			node,
			{
				opacity: +isOpen,
				height: isOpen ? 'auto' : 0
			},
			{ duration, delay, ...(ease ? { ease } : {}) }
		);
	};
}

/**
 * Attachment form of the body motion, for parts whose only motion phases are `initial` + `animate`.
 *
 * `HtmlAtom` routes any part with a non-empty motion axis through the full `HtmlElement` adapter
 * (see `useNativeRenderer`), which costs an extra component instance per rendered part — including
 * on the server, where no motion phase can run at all. An attachment reaches the element as a
 * symbol key in the ordinary props spread, so the part stays on the native renderer in both
 * environments.
 *
 * Behavior mirrors `HtmlElement` for the animate-only case: `initial` runs once at mount, untracked
 * so it establishes no dependency, then the animate phase runs inside the attachment's own effect
 * and re-runs whenever the disclosure state it reads changes.
 */
export function attachCollapsibleBodyMotion(params: AnimateCollapsibleBodyParams = {}) {
	const initial = animateCollapsibleBody({ ...params, duration: 0 });
	const update = animateCollapsibleBody(params);
	let hasInitialized = false;

	return (node: HTMLElement) => {
		if (!hasInitialized) {
			hasInitialized = true;
			untrack(() => initial(node));
		}
		const cleanup = update(node);
		return () => stopMotion(cleanup, node);
	};
}
