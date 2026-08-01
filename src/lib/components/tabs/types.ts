import type { Snippet } from 'svelte';
import type { HtmlAtomProps, Base, SnippetProps } from '$ixirjs/ui/components/atom';
import type { Factory, StateChangeCallback } from '$ixirjs/ui/types';
import type { PresetLike } from '$ixirjs/ui/preset';
import type { BondPresetLayers } from '$ixirjs/ui/shared/bond';
import type { TabsBond } from './bond.svelte';
import type { TabBond } from './tab/bond.svelte';

// Snippet props
export interface TabsSnippetProps extends SnippetProps {
	tabs: TabsBond;
}

export type TabsChildren = Snippet<[TabsSnippetProps]>;

/** Per-instance presentation layers for the parent Tabs Bond. */
export interface TabsPresets extends BondPresetLayers {
	root?: PresetLike;
	header?: PresetLike;
	body?: PresetLike;
	content?: PresetLike;
}

export interface TabSnippetProps extends SnippetProps {
	tab: TabBond<unknown> | undefined;
}

export type TabChildren = Snippet<[TabSnippetProps]>;

/** Per-instance presentation layers for an individual Tab Bond. */
export interface TabPresets extends BondPresetLayers {
	header?: PresetLike;
	body?: PresetLike;
	description?: PresetLike;
}

export interface TabRootProps {
	value: string;
	disabled?: boolean;
	data?: unknown;
	factory?: Factory<TabBond>;
	/** Per-instance presentation overrides for the Tab Bond. */
	presets?: TabPresets | undefined;
	children?: Snippet<[{ tab: TabBond }]>;
}

export interface TabsRootProps<
	D extends string = string,
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, TabsChildren> {
	value?: D;
	factory?: Factory<TabsBond>;
	/** Per-instance presentation overrides for the parent Tabs Bond. */
	presets?: TabsPresets | undefined;
	// Semantic selection callback; native `onchange` remains a DOM event callback.
	onvaluechange?: StateChangeCallback<D | undefined, TabsBond> | undefined;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TabHeaderProps<
	E extends keyof HTMLElementTagNameMap = 'button',
	B extends Base = Base
> extends HtmlAtomProps<E, B, TabChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TabBodyProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, TabChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TabDescriptionProps<
	E extends keyof HTMLElementTagNameMap = 'p',
	B extends Base = Base
> extends HtmlAtomProps<E, B, TabChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TabsHeaderProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, TabsChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TabsBodyProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, TabsChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TabsContentProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, TabsChildren> {}
