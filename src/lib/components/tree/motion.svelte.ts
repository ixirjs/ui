import { untrack } from 'svelte';
import { animate, DURATION, type Easing } from '$ixirjs/ui/shared';
import { TreeBond } from './bond.svelte';
import { stopMotion } from '$ixirjs/ui/components/element/motion-host';

export type AnimateTreeBodyParams = {
	duration?: number;
	delay?: number;
	ease?: Easing | Easing[];
};

function animateTreeBody(params: AnimateTreeBodyParams = {}) {
	const bond = TreeBond.get();
	return (node: HTMLElement) => {
		const { delay = 0, duration = DURATION.normal / 1000, ease = 'circOut' } = params;
		const isOpen = bond?.isOpen ?? false;

		// Returning the controller lets the host cancel a superseded run instead of leaving another
		// filled WAAPI animation attached to the node on every toggle.
		return animate(
			node,
			{
				height: +isOpen ? 'auto' : 0,
				opacity: +isOpen,
				pointerEvents: isOpen ? '' : 'none'
			},
			{ duration, delay, ease }
		);
	};
}

/**
 * Attachment form of the body motion. A symbol-keyed attachment handles this animate-only path
 * without a HtmlElement motion driver.
 *
 * Behavior runs `initial` once at mount, untracked so it
 * registers no dependency, then the animate phase inside the attachment's own effect, re-running
 * whenever the disclosure state it reads changes.
 */
export function attachTreeBodyMotion(params: AnimateTreeBodyParams = {}) {
	const initial = animateTreeBody({ ...params, duration: 0 });
	const update = animateTreeBody(params);
	let hasInitialized = false;

	return (node: HTMLElement) => {
		if (!hasInitialized) {
			hasInitialized = true;
			untrack(() => initial(node));
		}
		const controller = update(node);
		return () => stopMotion(controller, node);
	};
}
