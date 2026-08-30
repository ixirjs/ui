/**
 * Pagination's shared object — a plain state class on the redesigned `Kernel`. The page model is
 * still `createPagination`; the projections it used to put on each part are written in the parts.
 */
import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
import {
	createPagination,
	type PaginationModel
} from '$ixirjs/ui/capability/models/pagination.svelte';

export type PaginationStateProps = {
	id?: string;
	disabled?: boolean;
	/** 1-based current page. */
	page?: number | undefined;
	pageSize?: number | undefined;
	/** Total item count across all pages. Omit for an unknown-length source. */
	total?: number | undefined;
};

export const PaginationContext = Kernel.context<PaginationBond>('bond/pagination');

const DEFAULT_PAGE_SIZE = 10;

export class PaginationBond {
	readonly name = 'pagination';
	readonly props: PaginationStateProps;
	readonly pagination: PaginationModel;

	constructor(props: PaginationStateProps) {
		this.props = props;
		this.pagination = createPagination({
			page: () => this.props.page ?? 1,
			pageSize: () => this.props.pageSize ?? DEFAULT_PAGE_SIZE,
			total: () => this.props.total,
			setPage: (page) => {
				if (this.isDisabled) return;
				this.props.page = page;
			},
			setPageSize: (pageSize) => (this.props.pageSize = pageSize)
		});
	}

	static create(props: PaginationStateProps): PaginationBond {
		return new PaginationBond(props);
	}

	get id(): string {
		return this.props.id ?? 'pagination';
	}
	get rootId(): string {
		return Kernel.id(this.id, 'pagination-root');
	}
	get previousId(): string {
		return Kernel.id(this.id, 'pagination-previous');
	}
	get nextId(): string {
		return Kernel.id(this.id, 'pagination-next');
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
