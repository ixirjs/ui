import { defineCapability, sharedCapabilityKey, type Capability } from '../capability';

export type Orientation = 'horizontal' | 'vertical';
export type AriaCurrentValue = boolean | 'page' | 'step' | 'location' | 'date' | 'time';
export type ProjectionAccessor<T> = T | ((ctx: unknown, role: string) => T);

export const ORIENTATION_PROJECTION = sharedCapabilityKey<void>(
	'@svelte-atoms/cap:orientation-projection'
);
export const DISABLED_PROJECTION = sharedCapabilityKey<void>(
	'@svelte-atoms/cap:disabled-projection'
);
export const CURRENT_PROJECTION = sharedCapabilityKey<void>('@svelte-atoms/cap:current-projection');

export interface OrientationProjectionOptions {
	roles?: readonly string[];
	orientation: ProjectionAccessor<Orientation | undefined>;
}

export function orientationProjection(options: OrientationProjectionOptions): Capability<void> {
	const roles = options.roles ?? ['container'];

	return defineCapability<void>({
		slot: ORIENTATION_PROJECTION,
		meta: {
			layer: 1,
			kind: 'projection',
			projects: roles,
			docs: 'Generic horizontal/vertical orientation projection.'
		},
		behavior: (role, ctx) =>
			roles.includes(role)
				? {
						attrs: () => {
							const orientation = readProjectionValue(options.orientation, ctx, role);
							return {
								'aria-orientation': orientation,
								'data-orientation': orientation
							};
						}
					}
				: undefined
	});
}

export interface DisabledProjectionOptions {
	roles?: readonly string[];
	disabled: ProjectionAccessor<boolean>;
	// `true` applies native disabled to every projected role; an array scopes it by role.
	native?: boolean | readonly string[];
	tabindex?: number | false;
}

export function disabledProjection(options: DisabledProjectionOptions): Capability<void> {
	const roles = options.roles ?? ['control'];
	const native = options.native ?? true;
	const tabindex = options.tabindex ?? -1;

	return defineCapability<void>({
		slot: DISABLED_PROJECTION,
		meta: {
			layer: 1,
			kind: 'projection',
			projects: roles,
			docs: 'Generic disabled projection with ARIA, native disabled, and tabindex guard attrs.'
		},
		behavior: (role, ctx) =>
			roles.includes(role)
				? {
						attrs: () => {
							const disabled = readProjectionValue(options.disabled, ctx, role);
							const nativeDisabled =
								native === true || (Array.isArray(native) && native.includes(role));
							return {
								'aria-disabled': disabled ? 'true' : undefined,
								'data-disabled': disabled ? '' : undefined,
								disabled: disabled && nativeDisabled ? true : undefined,
								tabindex: disabled && tabindex !== false ? tabindex : undefined
							};
						}
					}
				: undefined
	});
}

export interface CurrentProjectionOptions {
	roles?: readonly string[];
	current: ProjectionAccessor<AriaCurrentValue | null | undefined>;
}

export function currentProjection(options: CurrentProjectionOptions): Capability<void> {
	const roles = options.roles ?? ['item'];

	return defineCapability<void>({
		slot: CURRENT_PROJECTION,
		meta: {
			layer: 1,
			kind: 'projection',
			projects: roles,
			docs: 'Generic aria-current projection for pages, steps, dates, and navigation items.'
		},
		behavior: (role, ctx) =>
			roles.includes(role)
				? {
						attrs: () => {
							const current = normalizeCurrent(readProjectionValue(options.current, ctx, role));
							return {
								'aria-current': current,
								'data-current': current ? '' : undefined,
								'data-current-value': typeof current === 'string' ? current : undefined
							};
						}
					}
				: undefined
	});
}

function readProjectionValue<T>(value: ProjectionAccessor<T>, ctx: unknown, role: string): T {
	return typeof value === 'function'
		? (value as (ctx: unknown, role: string) => T)(ctx, role)
		: value;
}

function normalizeCurrent(
	current: AriaCurrentValue | null | undefined
): Exclude<AriaCurrentValue, false> | undefined {
	return current === false || current === null || current === undefined ? undefined : current;
}
