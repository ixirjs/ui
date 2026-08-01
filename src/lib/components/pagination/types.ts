import type { Snippet } from 'svelte';
import type { HtmlAtomProps, Base, SnippetProps } from '$ixirjs/ui/components/atom';
import type { Factory } from '$ixirjs/ui/types';
import type { PaginationBond } from './bond.svelte';

// Extension points: merge custom props into pagination parts by augmenting these interfaces.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PaginationRootExtendProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PaginationPreviousExtendProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PaginationNextExtendProps {}

// Snippet props
export interface PaginationSnippetProps extends SnippetProps {
	pagination: PaginationBond;
}

export type PaginationChildren = Snippet<[PaginationSnippetProps]>;

export type PaginationRootProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> = HtmlAtomProps<E, B, PaginationChildren> &
	PaginationRootExtendProps & {
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
		as?: E;
		factory?: Factory<PaginationBond>;
	};

export type PaginationPreviousProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> = HtmlAtomProps<E, B, PaginationChildren> & PaginationPreviousExtendProps & { as?: E };

export type PaginationNextProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> = HtmlAtomProps<E, B, PaginationChildren> & PaginationNextExtendProps & { as?: E };
