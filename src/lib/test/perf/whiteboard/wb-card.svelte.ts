/**
 * WHITEBOARD card, on the redesigned `Kernel` (`kernel/kernel.svelte.ts`).
 *
 * Same promises as `Card`: swappable preset, `aria-labelledby` to a Title only when one rendered,
 * clickable role/tabindex, a `{ card }` argument, SSR-deterministic ids. One state class, one
 * context, literal elements spreading `Kernel.element(...).attrs`.
 */
import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';

export const CardContext = Kernel.context<WbCard>('wb-card');

export class WbCard {
	readonly id: string;
	/** Set by a Title at its init; the root's `aria-labelledby` follows it. One `$state`, per card. */
	titleId = $state<string | undefined>();
	#disabled: () => boolean;
	#clickable: () => boolean;

	constructor(id: string, disabled: () => boolean, clickable: () => boolean) {
		this.id = id;
		this.#disabled = disabled;
		this.#clickable = clickable;
	}
	get isDisabled() {
		return this.#disabled();
	}
	get isClickable() {
		return this.#clickable();
	}
}
