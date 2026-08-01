import type { Snippet } from 'svelte';
import type { HtmlAtomProps, Base } from '$svelte-atoms/core/components/atom';
import type { Factory } from '$svelte-atoms/core/types';
import type { TreeBond } from './bond.svelte';

export type TreeRootProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> = HtmlAtomProps<E, B> & {
	class?: string;
	open?: boolean;
	value?: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data?: any;
	disabled?: boolean;
	factory?: Factory<TreeBond>;
	children?: Snippet<[{ tree: TreeBond }]>;
};

export type TreeHeaderProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> = HtmlAtomProps<E, B> & {
	class?: string;
	open?: boolean;
	disabled?: boolean;
	children?: Snippet<[{ tree: TreeBond }]>;
};

export type TreeBodyProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> = HtmlAtomProps<E, B> & {
	open?: boolean;
	disabled?: boolean;
	children?: Snippet<[{ tree?: TreeBond }]>;
};

export type TreeIndicatorProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> = HtmlAtomProps<E, B> & {
	open?: boolean;
	disabled?: boolean;
	children?: Snippet<[{ tree?: TreeBond }]>;
};
