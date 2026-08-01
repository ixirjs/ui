import type { PortalBond } from '$ixirjs/ui/components/portal/instance/bond.svelte';
import type { PortalsBond } from './bond.svelte';

// The one reading path over the registry: a string is looked up, a PortalBond passes through
// (so a directly-supplied bond resolves even with no <Portals> ancestor). Keep it the only one.
export function resolvePortal(
	portals: PortalsBond | undefined,
	idOrBond: string | PortalBond | undefined
): PortalBond | undefined {
	if (typeof idOrBond === 'string') return portals?.getPortal(idOrBond);
	return idOrBond;
}

// The default mounting rule for teleported portal content: an explicit target wins,
// otherwise use the ambient portal shared through context, otherwise fall back to the
// root portal registered by <Root>. Unknown string ids deliberately fall through to the
// ambient/root fallback so nested overlays keep their containment when a local target is absent.
export function resolveTeleportTarget(
	portals: PortalsBond | undefined,
	idOrBond: string | PortalBond | undefined,
	ambient: PortalBond | undefined,
	rootId = 'root.l0'
): PortalBond | undefined {
	return resolvePortal(portals, idOrBond) ?? ambient ?? portals?.getPortal(rootId);
}

export function hasUnresolvedExplicitTarget(
	portals: PortalsBond | undefined,
	idOrBond: string | PortalBond | undefined
): boolean {
	return idOrBond !== undefined && resolvePortal(portals, idOrBond) === undefined;
}

export function describePortalTarget(idOrBond: string | PortalBond | undefined): string {
	if (typeof idOrBond === 'string') return ` portal="${idOrBond}"`;
	if (idOrBond) return ' portal={PortalBond}';
	return '';
}
