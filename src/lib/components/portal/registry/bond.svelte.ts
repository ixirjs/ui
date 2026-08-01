import { untrack, type Snippet } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';
import type { PortalBond } from '$ixirjs/ui/components/portal/instance/bond.svelte';
import type { Factory } from '$ixirjs/ui/types';
import { LAYER_BASE, type LayerInput } from '$ixirjs/ui/components/portal/layering/z-layer.svelte';
import type { OverlayView } from '$ixirjs/ui/components/overlay/types';
import { Bond, type BondStateProps } from '$ixirjs/ui/shared/bond';
import { defineBond, type BondOf } from '$ixirjs/ui/shared';

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type PortalsStateProps = BondStateProps & {
	id: string;
};

export type PortalsProps = {
	id: string;
	factory?: Factory<PortalsBond>;
	children?: Snippet<[{ portals: PortalsBond }]>;
};

// The single portal registry for a tree — every portal registers here, all consumers resolve from it.

// -----------------------------------------------------------------------------
// Bond implementation
// -----------------------------------------------------------------------------

type OverlayScope = PortalBond | undefined;

type OverlayStackEntry = {
	refs: number;
	bands: Map<LayerInput, Map<OverlayScope, number>>;
};

class PortalsBondBase extends Bond<PortalsStateProps> {
	#portals = new SvelteMap<string, PortalBond>();
	#bands = new SvelteMap<string, number>(Object.entries(LAYER_BASE));
	#overlayStack = new SvelteMap<OverlayView, OverlayStackEntry>();
	#topOverlay: OverlayView | undefined;

	constructor(props: PortalsStateProps, name = 'portals') {
		super(props, name);
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

	// Lifecycle pair: unregister only deletes if this portal still owns the id.
	registerPortal(id: string, portal: PortalBond): () => void {
		this.#portals.set(id, portal);
		return () => {
			if (this.#portals.get(id) === portal) this.#portals.delete(id);
		};
	}

	enrollOverlay(
		bond: OverlayView,
		band?: LayerInput | undefined,
		scope?: OverlayScope
	): () => void {
		return untrack(() => {
			const current = this.#overlayStack.get(bond);
			const entry = cloneOverlayEntry(current);
			entry.refs += 1;
			if (band !== undefined) incrementBandScope(entry.bands, band, scope);

			// Escape policy and PortalSurface metadata may enroll the same open owner. Adding
			// surface metadata must not promote it; plain escape-only re-enrollment keeps its
			// legacy defensive promotion behavior.
			const shouldPromote = !current || (band === undefined && current.bands.size === 0);
			if (shouldPromote && current) this.#overlayStack.delete(bond);
			this.#overlayStack.set(bond, entry);
			if (shouldPromote) this.#topOverlay = bond;

			let active = true;
			return () => {
				if (!active) return;
				active = false;
				untrack(() => this.removeOverlay(bond, band, scope));
			};
		});
	}

	isTopOverlay(bond: OverlayView): boolean {
		return !this.#overlayStack.has(bond) || this.#topOverlay === bond;
	}

	rankOf(bond: OverlayView, band: LayerInput, scope?: OverlayScope): number {
		let rank = 0;
		for (const [entry, stackEntry] of this.#overlayStack) {
			if (!hasBandScope(stackEntry.bands, band, scope)) continue;
			rank += 1;
			if (entry === bond) return rank;
		}
		return 0;
	}

	resetOverlayStackForTest(): void {
		this.#overlayStack.clear();
		this.#topOverlay = undefined;
	}

	private removeOverlay(
		bond: OverlayView,
		band?: LayerInput | undefined,
		scope?: OverlayScope
	): void {
		const current = this.#overlayStack.get(bond);
		if (!current) return;

		const entry = cloneOverlayEntry(current);
		entry.refs -= 1;
		if (band !== undefined) decrementBandScope(entry.bands, band, scope);

		if (entry.refs > 0) {
			this.#overlayStack.set(bond, entry);
			return;
		}

		this.#overlayStack.delete(bond);
		if (this.#topOverlay === bond) this.#topOverlay = this.#lastOverlay();
	}

	#lastOverlay(): OverlayView | undefined {
		let last: OverlayView | undefined;
		for (const bond of this.#overlayStack.keys()) last = bond;
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

// Context-only registry bond (no atoms); the portal map lives on PortalsBondBase.

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

export const PortalsBond = defineBond({
	name: 'portals',
	base: PortalsBondBase,
	atoms: {}
});

export type PortalsBond = BondOf<typeof PortalsBond>;
