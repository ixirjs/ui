import { defineCapability, sharedCapabilityKey, type Capability } from '../capability';

export type CheckedState = boolean | 'mixed';

export interface CheckedBacking {
	get(): CheckedState;
	set?(checked: boolean): void;
	disabled?: () => boolean;
}

export interface CheckedModel {
	readonly state: CheckedState;
	readonly isChecked: boolean;
	readonly isMixed: boolean;
	readonly isDisabled: boolean;
	set(checked: boolean): void;
	toggle(): void;
}

export const CHECKED = sharedCapabilityKey<CheckedModel>('@svelte-atoms/cap:checked');

export function createChecked(backing: CheckedBacking): CheckedModel {
	return {
		get state() {
			return backing.get();
		},
		get isChecked() {
			return backing.get() === true;
		},
		get isMixed() {
			return backing.get() === 'mixed';
		},
		get isDisabled() {
			return backing.disabled?.() ?? false;
		},
		set(checked) {
			if (backing.disabled?.()) return;
			backing.set?.(checked);
		},
		toggle() {
			if (backing.disabled?.()) return;
			backing.set?.(backing.get() !== true);
		}
	};
}

export interface CheckedProjectionOptions {
	roles?: readonly string[];
	interactive?: boolean;
}

export function checkedCapability(
	checked: CheckedModel,
	options: CheckedProjectionOptions = {}
): Capability<CheckedModel> {
	const roles = options.roles ?? ['control'];
	const interactive = options.interactive ?? true;

	return defineCapability<CheckedModel>({
		slot: CHECKED,
		surface: checked,
		meta: {
			layer: 1,
			kind: 'model',
			projects: roles,
			docs: 'Checked, unchecked, and mixed state model with scoped checked-state projection.'
		},
		behavior: (role) =>
			roles.includes(role)
				? {
						attrs: () => checkedAttrs(checked),
						handlers: () =>
							interactive
								? {
										onclick: () => checked.toggle()
									}
								: {}
					}
				: undefined
	});
}

function checkedAttrs(checked: CheckedModel): Record<string, unknown> {
	return {
		'aria-checked': checked.isMixed ? 'mixed' : checked.isChecked ? 'true' : 'false',
		'aria-disabled': checked.isDisabled ? 'true' : undefined,
		'data-checked': checked.isChecked ? '' : undefined,
		'data-indeterminate': checked.isMixed ? '' : undefined,
		'data-disabled': checked.isDisabled ? '' : undefined
	};
}
