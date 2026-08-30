import type { Snippet } from 'svelte';
import { untrack } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';
import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
import type { PortalBond } from '$ixirjs/ui/components/portal/instance/bond.svelte';
import type { Factory } from '$ixirjs/ui/types';
import { LAYER_BASE, type LayerInput } from '$ixirjs/ui/components/portal/layering/z-layer.svelte';
import type { OverlayLike } from '$ixirjs/ui/components/overlay/model.svelte';

export type PortalsStateProps = {
	id: string;
};

export type PortalsProps = {
	id: string;
	factory?: Factory<PortalsBond>;
	children?: Snippet<[{ portals: PortalsBond }]>;
};

type OverlayScope = PortalBond | undefined;

type OverlayStackEntry = {
	refs: number;
	bands: Map<LayerInput, Map<OverlayScope, number>>;
};

// `ZLayer` reads the band scope under this same key (`@ixirjs/context/portals`).
export const PortalsContext = Kernel.context<PortalsBond>('portals');

// The per-app-root registry: portals by id, named elevation bands, and the open-overlay stack
// that decides which overlay Escape and outside-press act on.
export class PortalsBond {
	readonly name = 'portals';
	readonly props: PortalsStateProps;
	#portals = new SvelteMap<string, PortalBond>();
	#bands = new SvelteMap<string, number>(Object.entries(LAYER_BASE));
	#overlayStack = new SvelteMap<OverlayLike, OverlayStackEntry>();
	#topOverlay: OverlayLike | undefined;

	constructor(props: PortalsStateProps) {
		this.props = props;
	}

	static create(props: PortalsStateProps): PortalsBond {
		return new PortalsBond(props);
	}

	static get(): PortalsBond | undefined {
		return PortalsContext.get();
	}

	get id() {
		return this.props.id;
	}

	getPortal(id: string): PortalBond | undefined {
		return this.#portals.get(id);
	}

	band(input: LayerInput): number {
		if (typeof input === 'number') return input;
		const base = this.#bands.get(input);
		if (base === undefined) {
			throw new Error(`[PortalsBond] Unknown layer band "${input}".`);
		}
		return base;
	}

	registerBand(name: string, base: number): number {
		this.#bands.set(name, base);
		return base;
	}

	registerPortal(id: string, portal: PortalBond): () => void {
		this.#portals.set(id, portal);
		return () => {
			if (this.#portals.get(id) === portal) this.#portals.delete(id);
		};
	}

	// Enroll an open overlay. Without a band it is escape-only and promoted to the top; with a
	// band it also ranks within that band per target portal, for elevation. Re-enrolling an
	// escape-only overlay moves it back to the top.
	enrollOverlay(
		overlay: OverlayLike,
		band?: LayerInput | undefined,
		scope?: OverlayScope
	): () => void {
		return untrack(() => {
			const current = this.#overlayStack.get(overlay);
			const entry = cloneOverlayEntry(current);
			entry.refs += 1;
			if (band !== undefined) incrementBandScope(entry.bands, band, scope);

			const shouldPromote = !current || (band === undefined && current.bands.size === 0);
			if (shouldPromote && current) this.#overlayStack.delete(overlay);
			this.#overlayStack.set(overlay, entry);
			if (shouldPromote) this.#topOverlay = overlay;

			let active = true;
			return () => {
				if (!active) return;
				active = false;
				untrack(() => this.#removeOverlay(overlay, band, scope));
			};
		});
	}

	isTopOverlay(overlay: OverlayLike): boolean {
		return !this.#overlayStack.has(overlay) || this.#topOverlay === overlay;
	}

	rankOf(overlay: OverlayLike, band: LayerInput, scope?: OverlayScope): number {
		let rank = 0;
		for (const [entry, stackEntry] of this.#overlayStack) {
			if (!hasBandScope(stackEntry.bands, band, scope)) continue;
			rank += 1;
			if (entry === overlay) return rank;
		}
		return 0;
	}

	resetOverlayStackForTest(): void {
		this.#overlayStack.clear();
		this.#topOverlay = undefined;
	}

	#removeOverlay(overlay: OverlayLike, band?: LayerInput | undefined, scope?: OverlayScope): void {
		const current = this.#overlayStack.get(overlay);
		if (!current) return;

		const entry = cloneOverlayEntry(current);
		entry.refs -= 1;
		if (band !== undefined) decrementBandScope(entry.bands, band, scope);

		if (entry.refs > 0) {
			this.#overlayStack.set(overlay, entry);
			return;
		}

		this.#overlayStack.delete(overlay);
		if (this.#topOverlay === overlay) this.#topOverlay = this.#lastOverlay();
	}

	#lastOverlay(): OverlayLike | undefined {
		let last: OverlayLike | undefined;
		for (const overlay of this.#overlayStack.keys()) last = overlay;
		return last;
	}
}

function cloneOverlayEntry(entry: OverlayStackEntry | undefined): OverlayStackEntry {
	return {
		refs: entry?.refs ?? 0,
		bands: new Map(Array.from(entry?.bands ?? [], ([band, scopes]) => [band, new Map(scopes)]))
	};
}

function incrementBandScope(
	bands: Map<LayerInput, Map<OverlayScope, number>>,
	band: LayerInput,
	scope: OverlayScope
): void {
	const scopes = bands.get(band) ?? new Map<OverlayScope, number>();
	scopes.set(scope, (scopes.get(scope) ?? 0) + 1);
	bands.set(band, scopes);
}

function decrementBandScope(
	bands: Map<LayerInput, Map<OverlayScope, number>>,
	band: LayerInput,
	scope: OverlayScope
): void {
	const scopes = bands.get(band);
	if (!scopes) return;
	const refs = (scopes.get(scope) ?? 1) - 1;
	if (refs > 0) scopes.set(scope, refs);
	else scopes.delete(scope);
	if (scopes.size === 0) bands.delete(band);
}

function hasBandScope(
	bands: ReadonlyMap<LayerInput, ReadonlyMap<OverlayScope, number>>,
	band: LayerInput,
	scope: OverlayScope
): boolean {
	return (bands.get(band)?.get(scope) ?? 0) > 0;
}
