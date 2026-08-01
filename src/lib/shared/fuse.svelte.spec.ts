import { describe, expect, it } from 'vitest';
import { BondState, BondAtom, type BondStateProps } from './bond.svelte';
import { Collection } from './collection.svelte';
import { defineBond } from './define-bond.svelte';
import { fuse } from './fuse.svelte';
import { createSelection, selectionCapability, SELECTION } from './capabilities/selection.svelte';
import { createRovingFocus, rovingCapability, ROVING } from './capabilities/roving-focus.svelte';
import { collectionSlot } from './capabilities/collection.svelte';
import { trappedFocus, focusOnOpen, FOCUS } from '$svelte-atoms/core/components/overlay/policies/focus.svelte';

class FState extends BondState<BondStateProps> {
	values = $state<string[]>([]);
	ids = $state<string[]>(['a', 'b']);
	selection = createSelection<string>({
		get: () => this.values,
		set: (v) => (this.values = v),
		mode: () => 'multiple'
	});
	roving = createRovingFocus({ ids: () => this.ids });
	constructor() {
		super({});
	}
}

class TriggerAtom extends BondAtom {
	constructor(bond: ConstructorParameters<typeof BondAtom>[0]) {
		super(bond, 'trigger');
	}
}
class ListAtom extends BondAtom {
	constructor(bond: ConstructorParameters<typeof BondAtom>[0]) {
		super(bond, 'list');
	}
}
class OptionAtom extends BondAtom {
	constructor(bond: ConstructorParameters<typeof BondAtom>[0]) {
		super(bond, 'option');
	}
}

// Two independently-defined bonds sharing a compatible state.
const Triggerable = defineBond<{ trigger: typeof TriggerAtom }, FState>({
	name: 'triggerable',
	atoms: { trigger: TriggerAtom },
	capabilities: (s: FState) => [rovingCapability(s.roving)] // slot 'roving'
});
const Listbox = defineBond<{ list: typeof ListAtom; option: typeof OptionAtom }, FState>({
	name: 'listbox',
	atoms: { list: ListAtom, option: OptionAtom },
	capabilities: (s: FState) => [selectionCapability(s.selection)] // slot 'selection'
});

describe('fuse — bond + bond = bond (the closure property)', () => {
	const Fused = fuse({ name: 'fused', parts: [Triggerable, Listbox] });

	it('unions atoms from every part', () => {
		const bond = new Fused(new FState());
		expect(bond.trigger()).toBeInstanceOf(TriggerAtom); // from Triggerable
		expect(bond.list()).toBeInstanceOf(ListAtom); // from Listbox
		expect(bond.option()).toBeInstanceOf(OptionAtom);
	});

	it('concatenates capabilities from every part', () => {
		const bond = new Fused(new FState());
		expect(bond.capability(ROVING)).toBeDefined(); // from Triggerable
		expect(bond.capability(SELECTION)).toBeDefined(); // from Listbox
	});

	it('takes a fresh rebrand identity (namespace / CONTEXT_KEY)', () => {
		const bond = new Fused(new FState());
		expect(bond.namespace).toBe('fused');
		expect(Fused.CONTEXT_KEY).toContain('fused');
		// atoms carry the fused namespace, not the parts'
		expect(bond.trigger().spread['data-bond']).toBe('fused');
	});

	it('the fused bond is itself fusable (closure)', () => {
		class ExtraAtom extends BondAtom {
			constructor(bond: ConstructorParameters<typeof BondAtom>[0]) {
				super(bond, 'extra');
			}
		}
		const Extra = defineBond<{ extra: typeof ExtraAtom }, FState>({
			name: 'extra',
			atoms: { extra: ExtraAtom }
		});
		const Refused = fuse({ name: 'refused', parts: [Fused, Extra] });
		const bond = new Refused(new FState());
		expect(bond.trigger()).toBeInstanceOf(TriggerAtom); // inherited through Fused
		expect(bond.extra()).toBeInstanceOf(ExtraAtom);
		expect(bond.capability(SELECTION)).toBeDefined(); // carried through
	});

	it('later parts win on capability-SLOT collision (the PopoverDialog focus resolution)', () => {
		// Mirrors `fuse(Popover, Dialog)`: both parts bring slot 'focus'; the later (modal)
		// TrappedFocus wins over FocusOnOpen because capability() is last-wins-per-slot (§13.1).
		const PositionedLike = defineBond<{ trigger: typeof TriggerAtom }, FState>({
			name: 'positioned-like',
			atoms: { trigger: TriggerAtom },
			capabilities: () => [focusOnOpen({ restoreFocus: 'trigger' })]
		});
		const ModalLike = defineBond<{ option: typeof OptionAtom }, FState>({
			name: 'modal-like',
			atoms: { option: OptionAtom },
			capabilities: () => [trappedFocus({ restoreFocus: 'previous' })]
		});
		const Fused2 = fuse({ name: 'positioned-modal', parts: [PositionedLike, ModalLike] });
		const bond = new Fused2(new FState());
		const focus = bond.capability(FOCUS)?.surface;
		expect(focus?.restoreFocus).toBe('previous'); // modal (later) won the slot
	});

	it('a lazily-created collection is reachable through capability("collection:item") (ADR 0007)', () => {
		// The genuinely new property: a collection on the fused bond is addressable via the
		// unified capability seam — same instance the lazy `collection()` getter returns.
		const bond = new Fused(new FState());
		const items = bond.state.collection<{ id: string }>('item');
		expect(items).toBeInstanceOf(Collection);
		expect(bond.capability(collectionSlot('item'))?.surface).toBe(items);
	});

	it('parts share one collection instance — unchanged: it lives on the one shared State', () => {
		const state = new FState();
		const bond = new Fused(state);
		// Reached via the raw state and via the bond's state: the same Collection.
		expect(bond.state.collection('item')).toBe(state.collection('item'));
		const item = { id: 'x' };
		state.collection<{ id: string }>('item').attach('x', item);
		const surface = bond.capability(collectionSlot('item'))?.surface as Collection<{ id: string }>;
		expect(surface.get('x')).toBe(item); // visible across parts, as it always was
	});

	it('re-fusing (closure) preserves collection addressability', () => {
		class ExtraAtom extends BondAtom {
			constructor(b: ConstructorParameters<typeof BondAtom>[0]) {
				super(b, 'extra');
			}
		}
		const Extra = defineBond<{ extra: typeof ExtraAtom }, FState>({
			name: 'extra-coll',
			atoms: { extra: ExtraAtom }
		});
		const Refused = fuse({ name: 'refused-coll', parts: [Fused, Extra] });
		const bond = new Refused(new FState());
		const items = bond.state.collection('item');
		expect(bond.capability(collectionSlot('item'))?.surface).toBe(items);
	});

	it('later parts win on atom-key collision (resolve)', () => {
		class A1 extends BondAtom {
			constructor(b: ConstructorParameters<typeof BondAtom>[0]) {
				super(b, 'root');
			}
			tag = 'A';
		}
		class A2 extends BondAtom {
			constructor(b: ConstructorParameters<typeof BondAtom>[0]) {
				super(b, 'root');
			}
			tag = 'B';
		}
		const P1 = defineBond<{ root: typeof A1 }, FState>({ name: 'p1', atoms: { root: A1 } });
		const P2 = defineBond<{ root: typeof A2 }, FState>({ name: 'p2', atoms: { root: A2 } });
		const Resolved = fuse({ name: 'resolved', parts: [P1, P2] });
		expect((new Resolved(new FState()).root() as A2).tag).toBe('B'); // P2 wins
	});
});
