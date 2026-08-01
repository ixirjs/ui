import type { ButtonProps } from '$ixirjs/ui';
import type { HtmlElementProps } from '$ixirjs/ui/components/element';

/**
 * DOM attributes and event handlers reach component props through `ElementProps`, which extends
 * Svelte's `HTMLAttributes`. Before that, nothing in the chain extended Svelte's attribute types:
 * every handler parameter was implicitly `any`, and each component hand-declared the few attributes
 * it cared about. The index signature hid it, which is why nothing failed.
 *
 * These pin the two halves that regression would silently undo — the handler is typed, and its
 * `currentTarget` is the element the tag implies rather than a bare `Element`.
 */
const typedHandler = {
	onclick: (event) => {
		const target: HTMLButtonElement = event.currentTarget;
		const x: number = event.clientX;
		void [target, x];
	}
} satisfies ButtonProps;

// `currentTarget` follows the tag parameter, so a div's handler does not see button members.
const perTagTarget = {
	onpointerdown: (event) => {
		const target: HTMLDivElement = event.currentTarget;
		void target;
	}
} satisfies HtmlElementProps<'div'>;

const wrongTarget = {
	onclick: (event) => {
		// @ts-expect-error a button's currentTarget is not an HTMLAnchorElement
		const target: HTMLAnchorElement = event.currentTarget;
		void target;
	}
} satisfies ButtonProps;

/**
 * The index signature stays, and it is load-bearing: preset-driven props are deliberately never
 * declared by the library, so they reach the element through it until a consumer augments.
 */
const presetDrivenProp = { variant: 'primary', size: 'sm' } satisfies ButtonProps;

void [typedHandler, perTagTarget, wrongTarget, presetDrivenProp];
