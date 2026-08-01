export type StateDefiner<T extends object> = (base: T) => T;

// Build a bond's props object from per-field accessor cells. Each definer installs a live getter/setter.
// `base` is spread once — fields become frozen snapshots; reactive props must use defineProperty instead (ADR 0002).
export function defineState<T extends object>(
	definers: StateDefiner<Partial<T>>[],
	base?: () => Partial<T>
) {
	let outcome = { ...(base?.() ?? ({} as T)) };

	for (const definer of definers) {
		outcome = definer(outcome);
	}

	return outcome as T;
}

export function defineProperty<T extends Record<string, unknown>, R>(
	property: keyof T | (string & {}),
	get: () => R,
	set?: (value: R) => void,
	config?: Pick<PropertyDescriptor, 'enumerable' | 'configurable'>
) {
	return (base: T) => {
		if (property in base) {
			delete (base as unknown as Record<string, unknown>)[property as string];
		}

		const descriptor: PropertyDescriptor = { get, enumerable: true, ...config };
		if (set) descriptor.set = set;

		return Object.defineProperty(base, property, descriptor);
	};
}
