export interface PaginationBacking {
	page(): number;
	pageSize(): number;
	total?: () => number | undefined;
	setPage?: (page: number) => void;
	setPageSize?: (pageSize: number) => void;
}

export interface PaginationModel {
	readonly page: number;
	readonly pageSize: number;
	readonly total: number | undefined;
	readonly pageCount: number | undefined;
	readonly startIndex: number;
	readonly endIndex: number | undefined;
	readonly hasPrevious: boolean;
	readonly hasNext: boolean;
	setPage(page: number): void;
	setPageSize(pageSize: number): void;
	nextPage(): void;
	previousPage(): void;
}

export function createPagination(backing: PaginationBacking): PaginationModel {
	const model: PaginationModel = {
		get page() {
			return positiveInteger(backing.page());
		},
		get pageSize() {
			return positiveInteger(backing.pageSize());
		},
		get total() {
			const total = backing.total?.();
			return total === undefined ? undefined : nonnegativeInteger(total);
		},
		get pageCount() {
			return model.total === undefined
				? undefined
				: Math.max(1, Math.ceil(model.total / model.pageSize));
		},
		get startIndex() {
			return (model.page - 1) * model.pageSize;
		},
		get endIndex() {
			const end = model.startIndex + model.pageSize;
			return model.total === undefined ? end : Math.min(end, model.total);
		},
		get hasPrevious() {
			return model.page > 1;
		},
		get hasNext() {
			const pageCount = model.pageCount;
			return pageCount === undefined ? true : model.page < pageCount;
		},
		setPage(page) {
			backing.setPage?.(clampPage(page, model.pageCount));
		},
		setPageSize(pageSize) {
			backing.setPageSize?.(positiveInteger(pageSize));
		},
		nextPage() {
			if (model.hasNext) model.setPage(model.page + 1);
		},
		previousPage() {
			if (model.hasPrevious) model.setPage(model.page - 1);
		}
	};
	return model;
}

function positiveInteger(value: number): number {
	return Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1;
}

function nonnegativeInteger(value: number): number {
	return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function clampPage(page: number, pageCount: number | undefined): number {
	const lower = positiveInteger(page);
	return pageCount === undefined ? lower : Math.min(lower, pageCount);
}
