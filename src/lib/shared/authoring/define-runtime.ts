import type { Bond, BondStateProps } from '$ixirjs/ui/shared/bond';

// The static constructor that lets definitions self-construct under their own identity.
function bondCreate(this: new (props: BondStateProps) => Bond, props: BondStateProps): Bond {
	return new this(props);
}

export function attachStateFactory(cls: object): void {
	Object.defineProperty(cls, 'create', {
		value: bondCreate,
		writable: true,
		configurable: true
	});
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function attachMethod(proto: object, name: string, fn: (...args: any[]) => any) {
	Object.defineProperty(proto, name, {
		value: fn,
		writable: true,
		configurable: true,
		enumerable: false
	});
}
