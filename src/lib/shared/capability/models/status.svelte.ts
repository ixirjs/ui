import {
	defineRoleProjection,
	sharedCapabilityKey,
	type Capability
} from '$ixirjs/ui/shared/capability/capability';

export type StatusName =
	| 'active'
	| 'busy'
	| 'completed'
	| 'disabled'
	| 'invalid'
	| 'loading'
	| 'open'
	| 'pending'
	| 'readonly'
	| 'required'
	// Interaction state. Data attributes only — there is no ARIA for "the user has been here".
	| 'touched'
	| 'dirty';

export type StatusAccessors = Partial<Record<StatusName, () => boolean>>;

export interface StatusModel {
	readonly names: readonly StatusName[];
	is(name: StatusName): boolean;
}

export const STATUS = sharedCapabilityKey<StatusModel>('@ixirjs/cap:status');

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
	const statuses = options.statuses ?? status.names;

	return defineRoleProjection<StatusModel>({
		slot: STATUS,
		roles: options.roles ?? ['control'],
		surface: status,
		docs: 'Scoped status projection for repeated boolean state attrs.',
		attrs: () => statusAttrs(status, statuses)
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
			// Unlike the others, aria-required has no meaningful "false" — it is omitted instead, so
			// an optional control does not advertise the attribute at all.
			case 'required':
				attrs['aria-required'] = value ? 'true' : undefined;
				break;
		}
	}
	return attrs;
}
