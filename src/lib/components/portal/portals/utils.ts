import type { PortalBond } from '../bond.svelte';
import type { PortalsBond } from './bond.svelte';

// The one reading path over the registry: a string is looked up, a PortalBond passes through
// (so a directly-supplied bond resolves even with no <Portals> ancestor). Keep it the only one.
export function resolvePortal(
	portals: PortalsBond | undefined,
	idOrBond: string | PortalBond | undefined
): PortalBond | undefined {
	if (typeof idOrBond === 'string') return portals?.state.get(idOrBond);
	return idOrBond;
}
