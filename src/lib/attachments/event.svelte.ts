// Attachment: bind a typed DOM event listener for the lifetime of the node.
export function on<E extends Event = Event, T extends EventTarget = Element>(
	type: keyof HTMLElementEventMap,
	handler: (ev: E & { currentTarget: EventTarget & T }) => void,
	options?: boolean | AddEventListenerOptions | undefined
) {
	const listener: EventListenerOrEventListenerObject = (ev: Event) =>
		handler?.(ev as E & { currentTarget: EventTarget & T });

	return (node: T) => {
		node.addEventListener(type, listener, options);

		return () => node.removeEventListener(type, listener, options);
	};
}

// Attachment: run `onclick`, then — unless it called preventDefault() — run `action`.
// Single source of truth for click handlers that drive a bond action (toggle/open/close/…).
export function clickAction(action: (ev: MouseEvent) => void, onclick?: (ev: MouseEvent) => void) {
	return on<MouseEvent, HTMLElement>('click', (ev) => {
		onclick?.(ev);

		if (ev.defaultPrevented) {
			return;
		}

		action(ev);
	});
}
