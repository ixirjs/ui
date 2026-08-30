import { DEV } from 'esm-env';
import { untrack } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';
import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
import {
	PortalsContext,
	type PortalsBond
} from '$ixirjs/ui/components/portal/registry/bond.svelte';
import {
	LAYER_BASE,
	resolveZIndexOffset,
	type LayerInput,
	type LayerRelation,
	type ZIndexInput
} from '$ixirjs/ui/components/portal/layering/z-layer.svelte';

export type PortalBondProps = {
	id: string;
};

export type PortalStateProps = PortalBondProps;

export type PortalElevationEntry = {
	band: LayerInput;
	relation?: LayerRelation | undefined;
	rank?: number | undefined;
	'z-index'?: ZIndexInput | undefined;
};

// `ZLayer` reads the anchor scope under this same key (`@ixirjs/context/portal`).
export const PortalContext = Kernel.context<PortalBond>('portal');

// One portal: a teleport sink (its Inner, once mounted), local layer anchors, and elevation
// resolution against the registry's bands.
export class PortalBond {
	readonly name = 'portal';
	readonly props: PortalBondProps;
	/** The Inner element — teleport sink and floating-ui boundary — written by Inner on mount. */
	sink = $state<HTMLElement>();
	#anchors = new SvelteMap<string, () => number>();
	#portals: PortalsBond | undefined;

	constructor(
		props: PortalBondProps,
		portals: PortalsBond | undefined = PortalsContext.getOptional()
	) {
		this.props = props;
		this.#portals = portals;
	}

	static create(props: PortalBondProps): PortalBond {
		return new PortalBond(props);
	}

	static get(): PortalBond | undefined {
		return PortalContext.get();
	}

	/** Publishes this portal as the ambient one for its subtree. */
	share(): this {
		PortalContext.share(this);
		return this;
	}

	get id(): string {
		return this.props.id;
	}

	get boundaryElement(): HTMLElement | undefined {
		return this.sinkElement;
	}

	get sinkElement(): HTMLElement | undefined {
		return this.sink;
	}

	anchor(name: string, value: () => number): () => void {
		return untrack(() => {
			if (DEV && this.#anchors.has(name)) {
				console.warn(
					`[ixirjs] Portal "${this.props.id}" already has a layer anchor named "${name}".`
				);
			}
			this.#anchors.set(name, value);
			return () => {
				if (this.#anchors.get(name) === value) this.#anchors.delete(name);
			};
		});
	}

	readAnchor(name: string): number | undefined {
		return this.#anchors.get(name)?.();
	}

	elevation(entry: PortalElevationEntry): number {
		const natural =
			this.#anchorRelative(entry.relation) ?? this.#band(entry.band) + (entry.rank ?? 0);
		return natural + resolveZIndexOffset(entry['z-index'], natural);
	}

	#anchorRelative(relation: LayerRelation | undefined): number | undefined {
		if (!relation) return undefined;
		if (relation.below !== undefined) {
			const anchor = this.readAnchor(relation.below);
			if (anchor !== undefined) return anchor - 1;
		}
		if (relation.above !== undefined) {
			const anchor = this.readAnchor(relation.above);
			if (anchor !== undefined) return anchor + 1;
		}
		return undefined;
	}

	#band(input: LayerInput): number {
		if (this.#portals) return this.#portals.band(input);
		if (typeof input === 'number') return input;
		const base = LAYER_BASE[input as keyof typeof LAYER_BASE];
		if (base === undefined) {
			throw new Error(`[PortalBond] Unknown layer band "${input}".`);
		}
		return base;
	}
}
