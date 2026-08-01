import { describe, expect, it } from 'vitest';
import { PortalBond, PortalInnerAtom, PortalRootAtom, type PortalBondProps } from './bond.svelte';

function makePortal(initial: Partial<PortalBondProps> = {}) {
	const props = $state<PortalBondProps>({ id: 'p', ...initial });
	return PortalBond.create(props);
}

// Mount a real node by invoking its (symbol-keyed) attachment — the same path the
// `{...atom.spread}` wiring takes in a component.
function mount(atom: PortalRootAtom | PortalInnerAtom, node: HTMLElement) {
	const attachments = atom.attachments as Record<symbol, (n: HTMLElement) => void>;
	const key = Object.getOwnPropertySymbols(attachments)[0]!;
	attachments[key]!(node);
}

// `boundaryElement` resolves the floating-ui boundary from the Inner sink once mounted.
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

describe('PortalBond — containment boundary', () => {
	it('boundaryElement is undefined before any element is set', () => {
		expect(makePortal().boundaryElement).toBeUndefined();
	});

	it('stays undefined after the Outer mounts and resolves when the Inner sink mounts', () => {
		const bond = makePortal();
		const rootAtom = new PortalRootAtom(bond);
		const innerAtom = new PortalInnerAtom(bond);
		bond.register(rootAtom, { key: 'root' });
		bond.register(innerAtom, { key: 'inner' });

		const root = document.createElement('div');
		mount(rootAtom, root);
		expect(bond.boundaryElement).toBeUndefined();
		const inner = document.createElement('div');
		mount(innerAtom, inner);
		// Teleport sink and floating-ui boundary are one element — the innermost sink, the Inner.
		expect(bond.boundaryElement).toBe(inner);
	});
});
