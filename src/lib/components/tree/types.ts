import type { Snippet } from 'svelte';
import type { RenderProps, Base, HtmlElementTagName, PlainPartProps } from '$ixirjs/ui/authoring';
import type { Factory, StateChangeCallback } from '$ixirjs/ui/types';
import type { PresetLike } from '$ixirjs/ui/preset';
import type { BondPresetLayers } from '$ixirjs/ui/authoring';
import type { TreeBond } from './bond.svelte';

// Extension points: merge custom props into tree parts by augmenting these interfaces.
export interface TreeRootExtendProps {}

export interface TreeHeaderExtendProps {}

export interface TreeBodyExtendProps {}

export interface TreeIndicatorExtendProps {}

/** Per-instance presentation layers for a Tree root and its bonded parts. */
export interface TreePresets extends BondPresetLayers {
	root?: PresetLike;
	header?: PresetLike;
	body?: PresetLike;
	indicator?: PresetLike;
}

// This part IS its `<div>` — no `as`/`base`/motion; see `PlainPartProps`.
export type TreeRootProps = PlainPartProps<'div', Snippet<[{ tree: TreeBond }]>> &
	TreeRootExtendProps & {
		/** Additional classes, merged after the preset so they win. */
		class?: string;
		/**
		 * Controls whether the tree is expanded (bindable)
		 * @default false
		 */
		open?: boolean;
		/** Current value of the control. */
		value?: string;
		/** Arbitrary payload carried on the Bond, returned by lookups and snippet props. */
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		data?: any;
		/**
		 * Whether the tree is disabled
		 * @default false
		 */
		disabled?: boolean;
		/** Replaces the Bond constructor, so a family can be extended or fused. */
		factory?: Factory<TreeBond>;
		/** Per-instance presentation overrides for the Tree Bond. */
		presets?: TreePresets | undefined;
		/** Called after a real open-state transition commits. */
		onopenchange?: StateChangeCallback<boolean, TreeBond> | undefined;
		/** Content of this part. */
		children?: Snippet<[{ tree: TreeBond }]>;
	};

// This part IS its `<div>` — no `as`/`base`/motion; see `PlainPartProps`.
export type TreeHeaderProps = PlainPartProps<'div', Snippet<[{ tree: TreeBond }]>> &
	TreeHeaderExtendProps & {
		/** Additional classes, merged after the preset so they win. */
		class?: string;
		/** Mirrors the owning tree node's open state, for parts that style themselves from it. */
		open?: boolean;
		/** Disables the control: it stops responding and is removed from the tab order. */
		disabled?: boolean;
		/** Pointer down event handler. */
		onpointerdown?: ((event: PointerEvent) => void) | undefined;
		/** Content of this part. */
		children?: Snippet<[{ tree: TreeBond }]>;
	};

// This part IS its `<div>` — no `as`/`base`/motion; see `PlainPartProps`.
export type TreeBodyProps = PlainPartProps<'div', Snippet<[{ tree?: TreeBond }]>> &
	TreeBodyExtendProps & {
		/** Mirrors the owning tree node's open state, for parts that style themselves from it. */
		open?: boolean;
		/** Disables the control: it stops responding and is removed from the tab order. */
		disabled?: boolean;
		/** Content of this part. */
		children?: Snippet<[{ tree?: TreeBond }]>;
	};

export type TreeIndicatorProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> = RenderProps<E, B> &
	TreeIndicatorExtendProps & {
		/** Mirrors the owning tree node's open state, for parts that style themselves from it. */
		open?: boolean;
		/** Disables the control: it stops responding and is removed from the tab order. */
		disabled?: boolean;
		/** Content of this part. */
		children?: Snippet<[{ tree?: TreeBond }]>;
	};
