import { Atom, Bond } from '$ixirjs/ui/public/experimental';
import { defineBond } from '$ixirjs/ui/public/shared';

class LifetimeRootAtom extends Atom<Bond> {
	constructor(bond: Bond | undefined) {
		super(bond, 'root', { namespace: 'lifetime-probe' });
	}
}

class LifetimeTriggerAtom extends Atom<Bond> {
	constructor(bond: Bond | undefined) {
		super(bond, 'trigger', { namespace: 'lifetime-probe' });
	}
}

export const LifetimeBond = defineBond({
	name: 'lifetime-probe',
	atoms: { root: LifetimeRootAtom, trigger: LifetimeTriggerAtom }
});
