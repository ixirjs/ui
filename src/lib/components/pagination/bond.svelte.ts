import { Bond, defineAtom } from '$ixirjs/ui/shared/bond';
import { defineBond } from '$ixirjs/ui/shared';
import {
	createPagination,
	paginationCapability,
	type PaginationModel
} from '$ixirjs/ui/shared/capability/models/pagination.svelte';
import type { BondStateProps } from '$ixirjs/ui/shared/bond';

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type PaginationStateProps = BondStateProps & {
	disabled?: boolean;
	/** 1-based current page. */
	page?: number;
	pageSize?: number;
	/** Total item count across all pages. Omit for an unknown-length source. */
	total?: number;
};

export type PaginationDomElements = {
	root: HTMLElement;
	previous: HTMLElement;
	next: HTMLElement;
};

// -----------------------------------------------------------------------------
// Internal types
// -----------------------------------------------------------------------------

type PaginationBondView = PaginationBondBase;

// -----------------------------------------------------------------------------
// Atom definitions
// -----------------------------------------------------------------------------

// Roles, not hand-written attributes: the page data attributes, `aria-disabled` at each boundary,
// and both click handlers are projected by the shared paginationCapability.
export const PaginationRootAtom = defineAtom<PaginationBondView>('root', (atom) =>
	atom.role('container')
);
export type PaginationRootAtom = InstanceType<typeof PaginationRootAtom>;

export const PaginationPreviousAtom = defineAtom<PaginationBondView>('previous', (atom) =>
	atom.role('previous')
);
export type PaginationPreviousAtom = InstanceType<typeof PaginationPreviousAtom>;

export const PaginationNextAtom = defineAtom<PaginationBondView>('next', (atom) =>
	atom.role('next')
);
export type PaginationNextAtom = InstanceType<typeof PaginationNextAtom>;

// -----------------------------------------------------------------------------
// Bond implementation
// -----------------------------------------------------------------------------

const DEFAULT_PAGE_SIZE = 10;

class PaginationBondBase extends Bond<PaginationStateProps> {
	readonly pagination: PaginationModel = createPagination({
		page: () => this.props.page ?? 1,
		pageSize: () => this.props.pageSize ?? DEFAULT_PAGE_SIZE,
		total: () => this.props.total,
		setPage: (page) => {
			if (this.isDisabled) return;
			this.props.page = page;
		},
		setPageSize: (pageSize) => (this.props.pageSize = pageSize)
	});

	constructor(props: PaginationStateProps, name = 'pagination') {
		super(props, name);
		this.capability(paginationCapability(this.pagination));
	}

	get isDisabled(): boolean {
		return this.props.disabled ?? false;
	}

	get page(): number {
		return this.pagination.page;
	}

	get pageCount(): number | undefined {
		return this.pagination.pageCount;
	}

	/** Zero-based slice bounds for the current page, for a caller paginating in memory. */
	get startIndex(): number {
		return this.pagination.startIndex;
	}

	get endIndex(): number | undefined {
		return this.pagination.endIndex;
	}

	get hasPrevious(): boolean {
		return !this.isDisabled && this.pagination.hasPrevious;
	}

	get hasNext(): boolean {
		return !this.isDisabled && this.pagination.hasNext;
	}

	setPage(page: number): void {
		this.pagination.setPage(page);
	}

	next(): void {
		if (this.isDisabled) return;
		this.pagination.nextPage();
	}

	previous(): void {
		if (this.isDisabled) return;
		this.pagination.previousPage();
	}
}

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

const paginationSpec = {
	name: 'pagination',
	base: PaginationBondBase,
	atoms: {
		root: PaginationRootAtom,
		previous: PaginationPreviousAtom,
		next: PaginationNextAtom
	}
};

export const PaginationBond = defineBond(paginationSpec);

export type PaginationBond = PaginationBondBase;
