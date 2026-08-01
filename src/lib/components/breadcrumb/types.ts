import type { Base, HtmlAtomProps } from '$ixirjs/ui/components/atom';

// Extension points: merge custom props into breadcrumb parts by augmenting these interfaces.
// `BreadcrumbItemProps` is interface-shaped, so it is augmented directly instead.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BreadcrumbRootExtendProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BreadcrumbSeparatorExtendProps {}

export type BreadcrumbRootProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> = HtmlAtomProps<E, B> & BreadcrumbRootExtendProps;

export interface BreadcrumbItemProps<
	E extends keyof HTMLElementTagNameMap = 'a',
	B extends Base = Base
> extends HtmlAtomProps<E, B> {
	href?: string;
}

export type BreadcrumbSeparatorProps<
	E extends keyof HTMLElementTagNameMap = 'span',
	B extends Base = Base
> = HtmlAtomProps<E, B> & BreadcrumbSeparatorExtendProps;
