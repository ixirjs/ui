import type { Snippet } from 'svelte';
import type {
	RenderProps,
	Base,
	SnippetProps,
	HtmlElementTagName
} from '$ixirjs/ui/components/atom';
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
	/** Current value of the control. */
	value: string;
	/** Disables the control: it stops responding and is removed from the tab order. */
	disabled?: boolean;
	/** Arbitrary payload carried on the Bond, returned by lookups and snippet props. */
	data?: unknown;
	/** Replaces the Bond constructor, so a family can be extended or fused. */
	factory?: Factory<TabBond>;
	/** Per-instance presentation overrides for the Tab Bond. */
	presets?: TabPresets | undefined;
	/** Content of this part. */
	children?: Snippet<[{ tab: TabBond }]>;
}

export interface TabsRootProps<
	D extends string = string,
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, TabsChildren> {
	/** Active tab value */
	value?: D;
	/** Factory */
	factory?: Factory<TabsBond>;
	/** Per-instance presentation overrides for the parent Tabs Bond. */
	presets?: TabsPresets | undefined;
	// Semantic selection callback; native `onchange` remains a DOM event callback.
	/** Semantic callback fired after the active value commits. Receives `(value, { bond? })`. */
	onvaluechange?: StateChangeCallback<D | undefined, TabsBond> | undefined;
}

export interface TabHeaderProps<
	E extends HtmlElementTagName = 'button',
	B extends Base = Base
> extends RenderProps<E, B, TabChildren> {
	/** Native click callback. Receives only the DOM event. */
	onclick?: ((event: MouseEvent) => void) | undefined;
}

export interface TabBodyProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, TabChildren> {}

export interface TabDescriptionProps<
	E extends HtmlElementTagName = 'p',
	B extends Base = Base
> extends RenderProps<E, B, TabChildren> {}

export interface TabsHeaderProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, TabsChildren> {}

export interface TabsBodyProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, TabsChildren> {}

export interface TabsContentProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, TabsChildren> {}
