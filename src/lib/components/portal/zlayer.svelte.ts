import { createContext } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';

const [getLayer, setLayer] = createContext<ZLayer>();

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

// A z-index override: either an absolute number or a function that receives the computed
// natural layer value and returns the final CSS z-index to apply.
export type ZIndexInput = number | ((layerValue: number) => number);

// name → base, seeded from the built-ins; extended via ZLayer.register.
const registry = new SvelteMap<string, number>(Object.entries(LAYER_BASE));

// name → live z-value getter, published by an element for others to order `below`/`above`.
const anchors = new SvelteMap<string, () => number>();

// Order a layer just `below`/`above` a named anchor.
export type LayerRelation = { below?: string; above?: string };

// Context-propagated z-index, resolving to `base + parent + offset` — capturing the parent layer
// lets an overlay opened inside another stack above it automatically.
export class ZLayer {
	#base: number;
	#offset: () => number;
	#parent: ZLayer | undefined;
	#relation: LayerRelation | undefined;

	constructor(
		base: LayerInput,
		offset: () => number = () => 0,
		parent: ZLayer | undefined | null = ZLayer.tryGet(),
		relation?: LayerRelation
	) {
		this.#base = typeof base === 'string' ? ZLayer.resolve(base) : base;
		this.#offset = offset;
		this.#parent = parent ?? undefined;
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
			const anchor = ZLayer.readAnchor(rel.below);
			if (anchor !== undefined) return anchor - 1;
		}
		if (rel.above !== undefined) {
			const anchor = ZLayer.readAnchor(rel.above);
			if (anchor !== undefined) return anchor + 1;
		}
		return undefined;
	}

	// Publish to context so nested overlays stack above this one.
	share() {
		return setLayer(this);
	}

	// Register (or override) a named layer base.
	static register(name: string, base: number): number {
		registry.set(name, base);
		return base;
	}

	// Register a reactive z-anchor; returns an unregister thunk.
	static anchor(name: string, value: () => number): () => void {
		anchors.set(name, value);
		return () => {
			if (anchors.get(name) === value) anchors.delete(name);
		};
	}

	// Read a registered anchor's current z-value, or undefined.
	static readAnchor(name: string): number | undefined {
		return anchors.get(name)?.();
	}

	// Resolve a layer name to its base; throws if unknown.
	static resolve(name: string): number {
		const base = registry.get(name);
		if (base === undefined) {
			throw new Error(
				`[ZLayer] Unknown layer "${name}". Register it first with ZLayer.register("${name}", <z-index>).`
			);
		}
		return base;
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
