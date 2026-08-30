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

export function createStatus(accessors: StatusAccessors): StatusModel {
	const names = Object.keys(accessors) as StatusName[];
	return {
		names,
		is(name) {
			return accessors[name]?.() ?? false;
		}
	};
}
