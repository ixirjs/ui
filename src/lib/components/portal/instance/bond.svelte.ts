import { DEV } from 'esm-env';
import { untrack } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';
import {
	Atom,
	Bond,
	defineAtom,
	type BondElements,
	type BondStateProps
} from '$ixirjs/ui/shared/bond';
import { defineBond, type BondOf } from '$ixirjs/ui/shared';
import { PortalsBond } from '$ixirjs/ui/components/portal/registry';
import {
	LAYER_BASE,
	resolveZIndexOffset,
	type LayerInput,
	type LayerRelation,
	type ZIndexInput
} from '$ixirjs/ui/components/portal/layering/z-layer.svelte';

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type PortalBondProps = BondStateProps & {
	id: string;
};

export type PortalStateProps = PortalBondProps;

export type PortalElements = BondElements & {
	root?: HTMLElement;
	inner?: HTMLElement;
};

export type PortalElevationEntry = {
	band: LayerInput;
	relation?: LayerRelation | undefined;
	rank?: number | undefined;
	'z-index'?: ZIndexInput | undefined;
};

// -----------------------------------------------------------------------------
// Bond implementation
// -----------------------------------------------------------------------------

export class PortalBondBase<Props extends PortalBondProps = PortalBondProps> extends Bond<Props> {
	#anchors = new SvelteMap<string, () => number>();
	#portals: PortalsBond | undefined;

	constructor(props: Props) {
		super(props, 'portal');
		try {
			this.#portals = PortalsBond.get();
		} catch {
			this.#portals = undefined;
		}
	}

	// The teleport sink and floating-ui boundary are the same element.
	get boundaryElement(): HTMLElement | undefined {
		return this.sinkElement;
	}

	get sinkElement(): HTMLElement | undefined {
		return this.nodeByPart('inner')?.element as HTMLElement | undefined;
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

// -----------------------------------------------------------------------------
// Internal types
// -----------------------------------------------------------------------------

type PortalBondView = PortalBondBase<PortalBondProps>;

// -----------------------------------------------------------------------------
// Atom definitions
// -----------------------------------------------------------------------------

export class PortalRootAtom extends Atom<PortalBondView, HTMLElement> {
	constructor(bond: PortalBondView) {
		super(bond, 'root');
	}

	override get attrs() {
		return {
			...super.attrs,
			id: this.requireBond().id
		};
	}
}

export const PortalInnerAtom = defineAtom<PortalBondView, HTMLElement>('inner');
export type PortalInnerAtom = InstanceType<typeof PortalInnerAtom>;

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

export const PortalBond = defineBond({
	name: 'portal',
	base: PortalBondBase,
	atoms: { root: PortalRootAtom, inner: PortalInnerAtom }
});

export type PortalBond = BondOf<typeof PortalBond>;
