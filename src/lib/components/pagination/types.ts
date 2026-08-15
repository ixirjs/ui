import type { Snippet } from 'svelte';
import type {
	RenderProps,
	Base,
	SnippetProps,
	HtmlElementTagName
} from '$ixirjs/ui/components/atom';
import type { Factory } from '$ixirjs/ui/types';
import type { PaginationBond } from './bond.svelte';

// Extension points: merge custom props into pagination parts by augmenting these interfaces.
export interface PaginationRootExtendProps {}

export interface PaginationPreviousExtendProps {}

export interface PaginationNextExtendProps {}

// Snippet props
export interface PaginationSnippetProps extends SnippetProps {
	pagination: PaginationBond;
}

export type PaginationChildren = Snippet<[PaginationSnippetProps]>;

export type PaginationRootProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> = RenderProps<E, B, PaginationChildren> &
	PaginationRootExtendProps & {
		/** Disables the control: it stops responding and is removed from the tab order. */
		disabled?: boolean;
		/** Bindable 1-based current page. Previous/Next commit through it. */
		page?: number;
		/** Items per page. Defaults to 10. */
		pageSize?: number | undefined;
		/**
		 * Total item count across all pages. Omit — or pass `undefined` — for an unknown-length
		 * source, and `hasNext` stays true. Explicitly `| undefined` because under
		 * `exactOptionalPropertyTypes` a bare `total?: number` rejects `total={maybeCount}`, which
		 * is the shape an async-loaded count always has.
		 */
		total?: number | undefined;
		/** Accessible name for the navigation landmark. */
		label?: string;
		/** HTML tag to render instead of the default. */
		as?: E;
		/** Replaces the Bond constructor, so a family can be extended or fused. */
		factory?: Factory<PaginationBond>;
	};

export type PaginationPreviousProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> = RenderProps<E, B, PaginationChildren> &
	PaginationPreviousExtendProps & {
		/** HTML tag to render instead of the default. */
		as?: E;
	};

export type PaginationNextProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> = RenderProps<E, B, PaginationChildren> &
	PaginationNextExtendProps & {
		/** HTML tag to render instead of the default. */
		as?: E;
	};
