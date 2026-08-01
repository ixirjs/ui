import { port } from '$svelte-atoms/core/components/portal/port';
import { ZLayer } from '$svelte-atoms/core/components/portal/zlayer.svelte';

// Curried teleport attachment: re-parent `node` into `target` on attach, remove on
// cleanup. Thin wrapper over the canonical `port` primitive (see portal/port.ts).
export function portal(target: HTMLElement = document.body) {
	return (node: HTMLElement) => port(node, target);
}

/**
 * Register the attached element as a named ZLayer z-anchor for its lifetime,
 * so overlays can order themselves relative to it (e.g. a popover sitting `{ below }` a
 * sticky header). `value` is the anchor's z — pass a number, a getter (for a z that changes
 * as the element pins/unpins), or omit it to read the element's computed `z-index` on attach.
 *
 * ```svelte
 * <header class="sticky top-0 z-10" {@attach zAnchor('dialog-header')}>…</header>
 * <!-- elsewhere, inside the same Portal -->
 * <Popover.Content order={{ below: 'dialog-header' }} />
 * ```
 */
export function zAnchor(name: string, value?: number | (() => number)) {
	return (node: HTMLElement) => {
		const getter =
			typeof value === 'function'
				? value
				: (() => {
						const fixed = value ?? (parseInt(getComputedStyle(node).zIndex, 10) || 0);
						return () => fixed;
					})();
		return ZLayer.anchor(name, getter);
	};
}

export { port };
