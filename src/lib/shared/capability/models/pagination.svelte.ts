import { defineCapability, sharedCapabilityKey, type Capability } from '../capability';

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

export const PAGINATION = sharedCapabilityKey<PaginationModel>('@svelte-atoms/cap:pagination');

export function createPagination(backing: PaginationBacking): PaginationModel {
	const model: PaginationModel = {
		get page() {
			return Math.max(1, backing.page());
		},
		get pageSize() {
			return Math.max(1, backing.pageSize());
		},
		get total() {
			return backing.total?.();
		},
		get pageCount() {
			const total = backing.total?.();
			return total === undefined ? undefined : Math.max(1, Math.ceil(total / model.pageSize));
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
			backing.setPageSize?.(Math.max(1, pageSize));
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

export interface PaginationProjectionOptions {
	containerRoles?: readonly string[];
	previousRoles?: readonly string[];
	nextRoles?: readonly string[];
}

export function paginationCapability(
	pagination: PaginationModel,
	options: PaginationProjectionOptions = {}
): Capability<PaginationModel> {
	const containerRoles = options.containerRoles ?? ['container'];
	const previousRoles = options.previousRoles ?? ['previous'];
	const nextRoles = options.nextRoles ?? ['next'];
	const projects = [...containerRoles, ...previousRoles, ...nextRoles];

	return defineCapability<PaginationModel>({
		slot: PAGINATION,
		surface: pagination,
		meta: {
			layer: 1,
			kind: 'model',
			projects,
			docs: 'Page, page size, total, and navigation boundary model.'
		},
		behavior: (role) => {
			if (containerRoles.includes(role)) {
				return {
					attrs: () => ({
						'data-page': pagination.page,
						'data-page-size': pagination.pageSize,
						'data-total': pagination.total,
						'data-page-count': pagination.pageCount,
						'data-start-index': pagination.startIndex,
						'data-end-index': pagination.endIndex
					})
				};
			}
			if (previousRoles.includes(role)) {
				return {
					attrs: () => ({
						'aria-disabled': pagination.hasPrevious ? undefined : 'true',
						'data-disabled': pagination.hasPrevious ? undefined : ''
					}),
					handlers: () => ({
						onclick: () => pagination.previousPage()
					})
				};
			}
			if (nextRoles.includes(role)) {
				return {
					attrs: () => ({
						'aria-disabled': pagination.hasNext ? undefined : 'true',
						'data-disabled': pagination.hasNext ? undefined : ''
					}),
					handlers: () => ({
						onclick: () => pagination.nextPage()
					})
				};
			}
			return undefined;
		}
	});
}

function clampPage(page: number, pageCount: number | undefined): number {
	const lower = Math.max(1, page);
	return pageCount === undefined ? lower : Math.min(lower, pageCount);
}
