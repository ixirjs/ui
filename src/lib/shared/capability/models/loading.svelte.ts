import {
	defineCapability,
	sharedCapabilityKey,
	type Capability
} from '$ixirjs/ui/shared/capability/capability';

export interface LoadingBacking {
	pending(): boolean;
	error?: () => unknown;
	stale?: () => boolean;
}

export interface LoadingModel {
	readonly isPending: boolean;
	readonly isSettled: boolean;
	readonly isError: boolean;
	readonly isStale: boolean;
	readonly error: unknown;
}

export const LOADING = sharedCapabilityKey<LoadingModel>({
	owner: '@ixirjs/cap',
	name: 'loading',
	version: 1
});

export function createLoading(backing: LoadingBacking): LoadingModel {
	return {
		get isPending() {
			return backing.pending();
		},
		get isSettled() {
			return !backing.pending();
		},
		get isError() {
			return backing.error?.() !== undefined;
		},
		get isStale() {
			return backing.stale?.() ?? false;
		},
		get error() {
			return backing.error?.();
		}
	};
}

export interface LoadingProjectionOptions {
	roles?: readonly string[];
}

export function loadingCapability(
	loading: LoadingModel,
	options: LoadingProjectionOptions = {}
): Capability<LoadingModel> {
	const roles = options.roles ?? ['control'];

	return defineCapability<LoadingModel>({
		slot: LOADING,
		surface: loading,
		meta: {
			projects: roles,
			docs: 'Pending, settled, error, and stale loading state projection.'
		},
		behavior: (role) =>
			roles.includes(role)
				? {
						attrs: () => ({
							'aria-busy': loading.isPending ? 'true' : 'false',
							'data-loading': loading.isPending ? '' : undefined,
							'data-settled': loading.isSettled ? '' : undefined,
							'data-error': loading.isError ? '' : undefined,
							'data-stale': loading.isStale ? '' : undefined
						})
					}
				: undefined
	});
}
