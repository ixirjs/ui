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
