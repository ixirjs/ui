import type { Snippet } from 'svelte';
import type { HtmlAtomProps, Base } from '$ixirjs/ui/components/atom';
import type { Factory, StateChangeCallback } from '$ixirjs/ui/types';
import type { PresetLike } from '$ixirjs/ui/preset';
import type { BondPresetLayers } from '$ixirjs/ui/shared/bond';
import type { TreeBond } from './bond.svelte';

// Extension points: merge custom props into tree parts by augmenting these interfaces.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TreeRootExtendProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TreeHeaderExtendProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TreeBodyExtendProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TreeIndicatorExtendProps {}

/** Per-instance presentation layers for a Tree root and its bonded parts. */
export interface TreePresets extends BondPresetLayers {
	root?: PresetLike;
	header?: PresetLike;
	body?: PresetLike;
	indicator?: PresetLike;
}

export type TreeRootProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> = HtmlAtomProps<E, B> &
	TreeRootExtendProps & {
		class?: string;
		open?: boolean;
		value?: string;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		data?: any;
		disabled?: boolean;
		factory?: Factory<TreeBond>;
		/** Per-instance presentation overrides for the Tree Bond. */
		presets?: TreePresets | undefined;
		onopenchange?: StateChangeCallback<boolean, TreeBond> | undefined;
		children?: Snippet<[{ tree: TreeBond }]>;
	};

export type TreeHeaderProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> = HtmlAtomProps<E, B> &
	TreeHeaderExtendProps & {
		class?: string;
		open?: boolean;
		disabled?: boolean;
		children?: Snippet<[{ tree: TreeBond }]>;
	};

export type TreeBodyProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> = HtmlAtomProps<E, B> &
	TreeBodyExtendProps & {
		open?: boolean;
		disabled?: boolean;
		children?: Snippet<[{ tree?: TreeBond }]>;
	};

export type TreeIndicatorProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> = HtmlAtomProps<E, B> &
	TreeIndicatorExtendProps & {
		open?: boolean;
		disabled?: boolean;
		children?: Snippet<[{ tree?: TreeBond }]>;
	};
