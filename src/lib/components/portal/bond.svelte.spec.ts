import { describe, expect, it } from 'vitest';
import { Atom } from '$svelte-atoms/core/shared/bond';
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

// `boundaryElement` resolves the floating-ui boundary: the Inner sink once mounted, falling back
// to the Outer before then.
describe('PortalBond — containment boundary', () => {
	it('legacy adapters return Portal Atoms, not Atom compatibility classes', () => {
		const bond = makePortal();
		const root = bond.root();
		const inner = bond.inner();

		expect(root).toBeInstanceOf(PortalRootAtom);
		expect(inner).toBeInstanceOf(PortalInnerAtom);
		expect(root).toBeInstanceOf(Atom);
		expect(inner).toBeInstanceOf(Atom);
	});

	it('boundaryElement is undefined before any element is set', () => {
		expect(makePortal().boundaryElement).toBeUndefined();
	});

	it('falls back to the Outer until the Inner sink mounts, then is the Inner', () => {
		const bond = makePortal();
		const rootAtom = new PortalRootAtom(bond);
		const innerAtom = new PortalInnerAtom(bond);
		bond.register(rootAtom, { key: 'root' });
		bond.register(innerAtom, { key: 'inner' });

		const root = document.createElement('div');
		mount(rootAtom, root);
		expect(bond.boundaryElement).toBe(root); // only Outer mounted
		const inner = document.createElement('div');
		mount(innerAtom, inner);
		// Teleport sink and floating-ui boundary are one element — the innermost sink, the Inner.
		expect(bond.boundaryElement).toBe(inner);
	});
});
