import { defineCapability, sharedCapabilityKey, type Capability } from '../capability';

export interface PressedBacking {
	get(): boolean;
	set?(pressed: boolean): void;
	disabled?: () => boolean;
}

export interface PressedModel {
	readonly isPressed: boolean;
	readonly isDisabled: boolean;
	set(pressed: boolean): void;
	toggle(): void;
}

export const PRESSED = sharedCapabilityKey<PressedModel>('@svelte-atoms/cap:pressed');

export function createPressed(backing: PressedBacking): PressedModel {
	return {
		get isPressed() {
			return backing.get();
		},
		get isDisabled() {
			return backing.disabled?.() ?? false;
		},
		set(pressed) {
			if (backing.disabled?.()) return;
			backing.set?.(pressed);
		},
		toggle() {
			if (backing.disabled?.()) return;
			backing.set?.(!backing.get());
		}
	};
}

export interface PressedProjectionOptions {
	roles?: readonly string[];
	interactive?: boolean;
}

export function pressedCapability(
	pressed: PressedModel,
	options: PressedProjectionOptions = {}
): Capability<PressedModel> {
	const roles = options.roles ?? ['control'];
	const interactive = options.interactive ?? true;

	return defineCapability<PressedModel>({
		slot: PRESSED,
		surface: pressed,
		meta: {
			layer: 1,
			kind: 'model',
			projects: roles,
			docs: 'Pressed/unpressed toggle state with scoped toggle-button projection.'
		},
		behavior: (role) =>
			roles.includes(role)
				? {
						attrs: () => ({
							'aria-pressed': pressed.isPressed ? 'true' : 'false',
							'aria-disabled': pressed.isDisabled ? 'true' : undefined,
							'data-pressed': pressed.isPressed ? '' : undefined,
							'data-disabled': pressed.isDisabled ? '' : undefined
						}),
						handlers: () =>
							interactive
								? {
										onclick: () => pressed.toggle()
									}
								: {}
					}
				: undefined
	});
}
