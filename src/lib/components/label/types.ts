import type { Snippet } from 'svelte';
import type {
	RenderProps,
	Base,
	SnippetProps,
	HtmlElementTagName
} from '$ixirjs/ui/components/atom';

export interface LabelSnippetProps extends SnippetProps {}

export type LabelChildren = Snippet<[LabelSnippetProps]>;

export interface LabelProps<
	E extends HtmlElementTagName = 'label',
	B extends Base = Base
> extends RenderProps<E, B, LabelChildren> {
	/** The id of the form element this label is associated with. Maps to the HTML `for` attribute. */
	for?: string | null;
}
