import type { Base, RenderProps, HtmlElementTagName } from '$ixirjs/ui/authoring';

// Extension points: merge custom props into breadcrumb parts by augmenting these interfaces.
// `BreadcrumbItemProps` is interface-shaped, so it is augmented directly instead.
export interface BreadcrumbRootExtendProps {}

export interface BreadcrumbSeparatorExtendProps {}

export type BreadcrumbRootProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> = RenderProps<E, B> & BreadcrumbRootExtendProps;

export interface BreadcrumbItemProps<
	E extends HtmlElementTagName = 'a',
	B extends Base = Base
> extends RenderProps<E, B> {
	/** Link URL. Omit for the current (non-linked) page item. */
	href?: string;
}

export type BreadcrumbSeparatorProps<
	E extends HtmlElementTagName = 'span',
	B extends Base = Base
> = RenderProps<E, B> & BreadcrumbSeparatorExtendProps;
