import { describe, expect, it } from 'vitest';
import { PortalBond, PortalState, type PortalStateProps } from './bond.svelte';

function makePortal(initial: Partial<PortalStateProps> = {}) {
	const props = $state<PortalStateProps>({ id: 'p', ...initial });
	return new PortalBond(new PortalState(props));
}

// Mount a real node onto an atom slot by invoking its (symbol-keyed) attachment —
// the same path the `{...atom.spread}` wiring takes in a component.
function mount(bond: PortalBond, slot: string, node: HTMLElement) {
	const atom = bond.atom(slot)!;
	const attachments = atom.attachments as Record<symbol, (n: HTMLElement) => void>;
	const key = Object.getOwnPropertySymbols(attachments)[0]!;
	attachments[key]!(node);
}

// `boundaryElement` resolves the floating-ui boundary: the Inner sink once mounted, falling back
// to the Outer before then.
describe('PortalBond — containment boundary', () => {
	it('boundaryElement is undefined before any element is set', () => {
		expect(makePortal().boundaryElement).toBeUndefined();
	});

	it('falls back to the Outer until the Inner sink mounts, then is the Inner', () => {
		const bond = makePortal();
		const root = document.createElement('div');
		mount(bond, 'root', root);
		expect(bond.boundaryElement).toBe(root); // only Outer mounted
		const inner = document.createElement('div');
		mount(bond, 'inner', inner);
		// Teleport sink and floating-ui boundary are one element — the innermost sink, the Inner.
		expect(bond.boundaryElement).toBe(inner);
	});
});
