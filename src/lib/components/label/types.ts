import type { Snippet } from 'svelte';
import type { HtmlAtomProps, Base, SnippetProps } from '$ixirjs/ui/components/atom';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LabelSnippetProps extends SnippetProps {}

export type LabelChildren = Snippet<[LabelSnippetProps]>;

export interface LabelProps<
	E extends keyof HTMLElementTagNameMap = 'label',
	B extends Base = Base
> extends HtmlAtomProps<E, B, LabelChildren> {
	for?: string | null;
}
