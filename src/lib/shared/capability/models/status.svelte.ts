import { defineCapability, sharedCapabilityKey, type Capability } from '../capability';

export type StatusName =
	| 'active'
	| 'busy'
	| 'completed'
	| 'disabled'
	| 'invalid'
	| 'loading'
	| 'open'
	| 'pending'
	| 'readonly';

export type StatusAccessors = Partial<Record<StatusName, () => boolean>>;

export interface StatusModel {
	readonly names: readonly StatusName[];
	is(name: StatusName): boolean;
}

export const STATUS = sharedCapabilityKey<StatusModel>('@svelte-atoms/cap:status');

export function createStatus(accessors: StatusAccessors): StatusModel {
	const names = Object.keys(accessors) as StatusName[];
	return {
		names,
		is(name) {
			return accessors[name]?.() ?? false;
		}
	};
}

export interface StatusProjectionOptions {
	roles?: readonly string[];
	statuses?: readonly StatusName[];
}

export function statusCapability(
	status: StatusModel,
	options: StatusProjectionOptions = {}
): Capability<StatusModel> {
	const roles = options.roles ?? ['control'];
	const statuses = options.statuses ?? status.names;

	return defineCapability<StatusModel>({
		slot: STATUS,
		surface: status,
		meta: {
			layer: 1,
			kind: 'projection',
			projects: roles,
			docs: 'Scoped status projection for repeated boolean state attrs.'
		},
		behavior: (role) =>
			roles.includes(role)
				? {
						attrs: () => statusAttrs(status, statuses)
					}
				: undefined
	});
}

function statusAttrs(
	status: StatusModel,
	statuses: readonly StatusName[]
): Record<string, unknown> {
	const attrs: Record<string, unknown> = {};
	for (const name of statuses) {
		const value = status.is(name);
		attrs[`data-${name}`] = value ? '' : undefined;

		switch (name) {
			case 'busy':
				attrs['aria-busy'] = value ? 'true' : 'false';
				break;
			case 'disabled':
				attrs['aria-disabled'] = value ? 'true' : 'false';
				break;
			case 'invalid':
				attrs['aria-invalid'] = value ? 'true' : 'false';
				break;
			case 'readonly':
				attrs['aria-readonly'] = value ? 'true' : 'false';
				break;
		}
	}
	return attrs;
}
