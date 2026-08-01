import { createContext, getContext } from 'svelte';
import { bondContextKey } from '$ixirjs/ui/shared/bond';

const [getLayer, setLayer] = createContext<ZLayer>();
const PORTALS_CONTEXT_KEY = bondContextKey('portals');
const PORTAL_CONTEXT_KEY = bondContextKey('portal');

// Built-in layer bases: positioned floats < modal surfaces < ambient feedback.
export const LAYER_BASE = {
	base: 0,
	positioned: 10,
	modal: 20,
	ambient: 30
} as const;

export type LayerName = keyof typeof LAYER_BASE;

// A raw z-index, a built-in name, or a registered custom name (`string & {}` keeps autocomplete).
export type LayerInput = number | LayerName | (string & {});

// A z-index override: either an offset number or a function that receives the computed
// natural layer value and returns the final CSS z-index to apply.
export type ZIndexInput = number | ((layerValue: number) => number);

/**
 * Normalize a public `z-index` input into the offset consumed by `ZLayer`.
 *
 * Number inputs are offsets from the natural layer. Function inputs receive the natural
 * layer value and return the final CSS z-index; the returned offset is `final - natural`.
 */
export function resolveZIndexOffset(input: ZIndexInput | undefined, naturalLayer: number): number {
	if (typeof input === 'function') return input(naturalLayer) - naturalLayer;
	return typeof input === 'number' && Number.isFinite(input) ? input : 0;
}

// Order a layer just `below`/`above` a named anchor.
export type LayerRelation = { below?: string; above?: string };

type BandScope = {
	band(input: LayerInput): number;
	registerBand(name: string, base: number): number;
};

type AnchorScope = {
	anchor(name: string, value: () => number): () => void;
	readAnchor(name: string): number | undefined;
};

function contextValue<T>(key: string): T | undefined {
	try {
		return getContext<T>(key);
	} catch {
		return undefined;
	}
}

function resolveBuiltIn(name: string): number {
	const base = LAYER_BASE[name as LayerName];
	if (base === undefined) {
		throw new Error(
			`[ZLayer] Unknown layer "${name}". Register it first with ZLayer.register("${name}", <z-index>) inside <Portals>.`
		);
	}
	return base;
}

// Context-propagated z-index, resolving to `base + parent + offset` — capturing the parent layer
// lets an overlay opened inside another stack above it automatically. Band and anchor lookup are
// delegated to the current Portals/Portal bonds so legacy ZLayer consumers do not reintroduce
// process-global coordination while they await PortalSurface migration.
export class ZLayer {
	#base: number;
	#offset: () => number;
	#parent: ZLayer | undefined;
	#relation: LayerRelation | undefined;
	#bands: BandScope | undefined;
	#anchors: AnchorScope | undefined;

	constructor(
		base: LayerInput,
		offset: () => number = () => 0,
		parent: ZLayer | undefined | null = ZLayer.tryGet(),
		relation?: LayerRelation
	) {
		this.#parent = parent ?? undefined;
		this.#bands =
			contextValue<BandScope>(PORTALS_CONTEXT_KEY) ??
			(this.#parent ? this.#parent.#bands : undefined);
		this.#anchors =
			contextValue<AnchorScope>(PORTAL_CONTEXT_KEY) ??
			(this.#parent ? this.#parent.#anchors : undefined);
		this.#base = typeof base === 'string' ? this.#resolveBand(base) : base;
		this.#offset = offset;
		this.#relation = relation;
	}

	// Pinned relative to a registered anchor if set, else additive over the parent chain.
	get value(): number {
		const relative = this.#relativeValue();
		if (relative !== undefined) return relative + this.#offset();
		return this.#base + (this.#parent?.value ?? 0) + this.#offset();
	}

	// `anchor ∓ 1` for `below`/`above`; undefined when no relation or its anchor isn't registered.
	#relativeValue(): number | undefined {
		const rel = this.#relation;
		if (!rel) return undefined;

		if (rel.below !== undefined) {
			const anchor = this.#anchors?.readAnchor(rel.below);
			if (anchor !== undefined) return anchor - 1;
		}
		if (rel.above !== undefined) {
			const anchor = this.#anchors?.readAnchor(rel.above);
			if (anchor !== undefined) return anchor + 1;
		}
		return undefined;
	}

	#resolveBand(name: string): number {
		return this.#bands?.band(name) ?? resolveBuiltIn(name);
	}

	// Publish to context so nested overlays stack above this one.
	share() {
		return setLayer(this);
	}

	// Register (or override) a named layer base in the current Portals root.
	static register(name: string, base: number): number {
		const bands = contextValue<BandScope>(PORTALS_CONTEXT_KEY);
		if (!bands) {
			throw new Error(`[ZLayer] Cannot register layer "${name}" without an active <Portals> root.`);
		}
		return bands.registerBand(name, base);
	}

	// Register a reactive z-anchor on the current portal; returns an unregister thunk.
	static anchor(name: string, value: () => number): () => void {
		const anchors = contextValue<AnchorScope>(PORTAL_CONTEXT_KEY);
		if (!anchors) {
			throw new Error(`[ZLayer] Cannot register anchor "${name}" without an active portal.`);
		}
		return anchors.anchor(name, value);
	}

	// Read an anchor from the current portal, or undefined.
	static readAnchor(name: string): number | undefined {
		return contextValue<AnchorScope>(PORTAL_CONTEXT_KEY)?.readAnchor(name);
	}

	// Resolve a layer name through the current Portals root, falling back to built-ins.
	static resolve(name: string): number {
		return contextValue<BandScope>(PORTALS_CONTEXT_KEY)?.band(name) ?? resolveBuiltIn(name);
	}

	// Non-throwing read of the enclosing layer — undefined when none is in context.
	static tryGet(): ZLayer | undefined {
		try {
			return getLayer();
		} catch {
			return undefined;
		}
	}
}
