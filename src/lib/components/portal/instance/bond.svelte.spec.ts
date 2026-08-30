import { describe, expect, it } from 'vitest';
import { PortalBond, type PortalBondProps } from './bond.svelte';

function makePortal(initial: Partial<PortalBondProps> = {}) {
	const props = $state<PortalBondProps>({ id: 'p', ...initial });
	return PortalBond.create(props);
}

describe('PortalBond — local anchors and elevation', () => {
	it('registers portal-local anchors and resolves relative elevation', () => {
		const bond = makePortal();
		const off = bond.anchor('header', () => 5);

		expect(bond.readAnchor('header')).toBe(5);
		expect(bond.elevation({ band: 'positioned', relation: { below: 'header' } })).toBe(4);
		expect(bond.elevation({ band: 'positioned', relation: { above: 'header' } })).toBe(6);

		off();
		expect(bond.readAnchor('header')).toBeUndefined();
		expect(bond.elevation({ band: 'positioned', relation: { below: 'header' } })).toBe(10);
	});

	it('adds open rank only to band elevation, keeping relations at anchor ±1', () => {
		const bond = makePortal();
		bond.anchor('header', () => 10);

		expect(bond.elevation({ band: 'modal', rank: 2 })).toBe(22);
		expect(bond.elevation({ band: 'modal', relation: { above: 'header' }, rank: 1 })).toBe(11);
		expect(bond.elevation({ band: 'modal', relation: { above: 'header' }, rank: 2 })).toBe(11);
		expect(bond.elevation({ band: 'modal', relation: { below: 'header' }, rank: 2 })).toBe(9);
	});

	it('normalizes z-index input at the portal elevation site', () => {
		const bond = makePortal();

		expect(bond.elevation({ band: 'modal', 'z-index': 2 })).toBe(22);
		expect(bond.elevation({ band: 'modal', 'z-index': (natural) => natural + 3 })).toBe(23);
	});
});

// Teleport sink and floating-ui boundary are one element — the Inner, once it mounted.
describe('PortalBond — containment boundary', () => {
	it('boundaryElement is undefined before the Inner mounts and is the Inner afterwards', () => {
		const bond = makePortal();
		expect(bond.boundaryElement).toBeUndefined();

		const inner = document.createElement('div');
		bond.sink = inner;
		expect(bond.boundaryElement).toBe(inner);

		bond.sink = undefined;
		expect(bond.boundaryElement).toBeUndefined();
	});
});
