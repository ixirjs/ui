import {
	PortalsContext,
	type PortalsBond
} from '$ixirjs/ui/components/portal/registry/bond.svelte';
import type { OverlayLike } from './model.svelte';

// Fallback stack for tests and callers outside a <Portals> context. Production roots capture the
// PortalsBond during component setup, so overlay ordering stays scoped per app root.
const fallbackStack: OverlayLike[] = [];
const overlayPortals = new WeakMap<OverlayLike, PortalsBond>();

// Enroll `overlay` as the topmost open overlay; returns an unenroll thunk for
// `return enrollOverlay(overlay)` from an $effect. Re-enrolling moves it back to the top.
export function enrollOverlay(overlay: OverlayLike, portals?: PortalsBond): () => void {
	if (portals) {
		overlayPortals.set(overlay, portals);
		const unenroll = portals.enrollOverlay(overlay);
		return () => {
			unenroll();
			if (overlayPortals.get(overlay) === portals) overlayPortals.delete(overlay);
		};
	}
	remove(fallbackStack, overlay);
	fallbackStack.push(overlay);
	return () => remove(fallbackStack, overlay);
}

// May `overlay` act on Escape? True when it is the top of the stack OR not enrolled at all
// (opted-out overlays and unit-test overlays still act; only a higher enrolled one suppresses).
export function isTopOverlay(overlay: OverlayLike): boolean {
	const portals = overlayPortals.get(overlay);
	if (portals) return portals.isTopOverlay(overlay);
	const i = fallbackStack.indexOf(overlay);
	if (i === -1) return true;
	return i === fallbackStack.length - 1;
}

// Test seam for the module-global stack.
export function resetEscapeStackForTest(): void {
	fallbackStack.splice(0);
}

function remove(stack: OverlayLike[], overlay: OverlayLike): void {
	const i = stack.indexOf(overlay);
	if (i !== -1) stack.splice(i, 1);
}

// Enroll on closed→open, unenroll on open→close or unmount. Call once at the root's init.
export function useEscapeStack(overlay: OverlayLike | undefined): void {
	if (!overlay) return;
	const portals = PortalsContext.get();
	$effect(() => {
		if (!overlay.isOpen) return;
		return enrollOverlay(overlay, portals);
	});
}
