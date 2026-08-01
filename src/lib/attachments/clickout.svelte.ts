import { on } from 'svelte/events';

export type ClickoutOptions = AddEventListenerOptions & {
	type?: 'click' | 'pointerdown' | 'mousedown';
};

// options.type selects the event type ('click' | 'pointerdown' | 'mousedown', default 'click').
export function clickout<T extends Element>(
	onclick?: (ev: PointerEvent, node?: T) => void,
	options?: ClickoutOptions
) {
	return (node: T) => {
		const type = options?.type ?? 'click';

		const handler = (ev: Event) => {
			const target = ev.target as T;

			if (!node.contains(target)) {
				onclick?.(ev as PointerEvent, node);
			}
		};

		const cleanup = on(window, type, handler, options);

		return () => {
			cleanup();
		};
	};
}
