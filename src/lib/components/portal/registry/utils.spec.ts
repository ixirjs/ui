import { describe, expect, it } from 'vitest';
import type { PortalBond } from '$ixirjs/ui/components/portal/instance/bond.svelte';
import { hasUnresolvedExplicitTarget, resolveTeleportTarget } from './utils';

function portal(id: string) {
	return { id } as unknown as PortalBond;
}

function registry(entries: Record<string, PortalBond>) {
	return {
		getPortal: (id: string) => entries[id]
	};
}

describe('resolveTeleportTarget', () => {
	it('prefers an explicit PortalBond', () => {
		const explicit = portal('explicit');
		const ambient = portal('ambient');
		const root = portal('root.l0');

		expect(resolveTeleportTarget(registry({ 'root.l0': root }) as never, explicit, ambient)).toBe(
			explicit
		);
	});

	it('prefers an explicit registered id over the ambient portal', () => {
		const explicit = portal('explicit');
		const ambient = portal('ambient');
		const root = portal('root.l0');

		expect(
			resolveTeleportTarget(registry({ explicit, 'root.l0': root }) as never, 'explicit', ambient)
		).toBe(explicit);
	});

	it('falls back to the ambient portal when no explicit target resolves', () => {
		const ambient = portal('ambient');
		const root = portal('root.l0');

		expect(resolveTeleportTarget(registry({ 'root.l0': root }) as never, undefined, ambient)).toBe(
			ambient
		);
		expect(resolveTeleportTarget(registry({ 'root.l0': root }) as never, 'missing', ambient)).toBe(
			ambient
		);
	});

	it('falls back to the root portal when there is no ambient portal', () => {
		const root = portal('root.l0');

		expect(
			resolveTeleportTarget(registry({ 'root.l0': root }) as never, undefined, undefined)
		).toBe(root);
	});

	it('reports an unresolved explicit id even when fallback resolution succeeds', () => {
		const ambient = portal('ambient');
		const root = portal('root.l0');
		const portals = registry({ 'root.l0': root }) as never;

		expect(resolveTeleportTarget(portals, 'missing', ambient)).toBe(ambient);
		expect(hasUnresolvedExplicitTarget(portals, 'missing')).toBe(true);
		expect(hasUnresolvedExplicitTarget(portals, undefined)).toBe(false);
		expect(hasUnresolvedExplicitTarget(portals, ambient)).toBe(false);
	});
});
