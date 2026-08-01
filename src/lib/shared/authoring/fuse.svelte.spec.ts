import { describe, expect, it, vi } from 'vitest';
import { BondState, Atom, type BondStateProps } from '../bond';
import { Collection } from '../bond/collection.svelte';
import { defineBond } from './define.svelte';
import { fuse } from './fuse.svelte';
import {
	createSelection,
	selectionCapability,
	SELECTION
} from '../capability/models/selection.svelte';
import { createRovingFocus, rovingCapability, ROVING } from '../capability/models/roving.svelte';
import { collectionSlot } from '../capability/models/collection.svelte';
import {
	trappedFocus,
	focusOnOpen,
	FOCUS
} from '$svelte-atoms/core/components/portal/host/policies/focus.svelte';

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

class TriggerAtom extends Atom {
	constructor(bond: ConstructorParameters<typeof Atom>[0]) {
		super(bond, 'trigger');
	}
}
class ListAtom extends Atom {
	constructor(bond: ConstructorParameters<typeof Atom>[0]) {
		super(bond, 'list');
	}
}
class OptionAtom extends Atom {
	constructor(bond: ConstructorParameters<typeof Atom>[0]) {
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
		expect(bond.state.capability(ROVING)).toBeDefined(); // from Triggerable
		expect(bond.state.capability(SELECTION)).toBeDefined(); // from Listbox
	});

	it('takes a fresh rebrand identity (namespace / CONTEXT_KEY)', () => {
		const bond = new Fused(new FState());
		expect(bond.namespace).toBe('fused');
		expect(Fused.CONTEXT_KEY).toContain('fused');
		// atoms carry the fused namespace, not the parts'
		expect(bond.trigger().spread['data-bond']).toBe('fused');
	});

	it('the fused bond is itself fusable (closure)', () => {
		class ExtraAtom extends Atom {
			constructor(bond: ConstructorParameters<typeof Atom>[0]) {
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
		expect(bond.state.capability(SELECTION)).toBeDefined(); // carried through
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
		const focus = bond.state.capability(FOCUS)?.surface;
		expect(focus?.restoreFocus).toBe('previous'); // modal (later) won the slot
	});

	it('a lazily-created collection is reachable through capability("collection:item") (ADR 0007)', () => {
		// The genuinely new property: a collection on the fused bond is addressable via the
		// unified capability seam — same instance the lazy `collection()` getter returns.
		const bond = new Fused(new FState());
		const items = bond.collection<{ id: string }>('item');
		expect(items).toBeInstanceOf(Collection);
		expect(bond.state.capability(collectionSlot('item'))?.surface).toBe(items);
	});

	it('parts share one collection instance on the fused Bond', () => {
		const state = new FState();
		const bond = new Fused(state);
		// Reached via the Bond facade and through the capability seam: the same Collection.
		const items = bond.collection<{ id: string }>('item');
		const item = { id: 'x' };
		items.set('x', item);
		const surface = bond.capability(collectionSlot('item'))?.surface as Collection<{
			id: string;
		}>;
		expect(surface.get('x')).toBe(item); // visible across parts, as it always was
	});

	it('re-fusing (closure) preserves collection addressability', () => {
		class ExtraAtom extends Atom {
			constructor(b: ConstructorParameters<typeof Atom>[0]) {
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
		expect(bond.state.capability(collectionSlot('item'))?.surface).toBe(items);
	});

	it('a fused bond can declare its State and self-construct via create() (ADR 0012)', () => {
		const Stateful = fuse({ name: 'fused-state', parts: [Triggerable, Listbox], state: FState });
		expect(Stateful.state).toBe(FState); // static ref carried onto the fusion
		const bond = Stateful.create({});
		expect(bond.state).toBe(bond);
		expect(bond.trigger()).toBeInstanceOf(TriggerAtom); // atoms from parts still resolve
		expect(bond.state.capability(SELECTION)).toBeDefined(); // capabilities from parts still register
	});

	it('later parts win on atom-key collision (resolve)', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		class A1 extends Atom {
			constructor(b: ConstructorParameters<typeof Atom>[0]) {
				super(b, 'root');
			}
			tag = 'A';
		}
		class A2 extends Atom {
			constructor(b: ConstructorParameters<typeof Atom>[0]) {
				super(b, 'root');
			}
			tag = 'B';
		}
		const P1 = defineBond<{ root: typeof A1 }, FState>({ name: 'p1', atoms: { root: A1 } });
		const P2 = defineBond<{ root: typeof A2 }, FState>({ name: 'p2', atoms: { root: A2 } });
		const Resolved = fuse({ name: 'resolved', parts: [P1, P2] });
		expect((new Resolved(new FState()).root() as A2).tag).toBe('B'); // P2 wins
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('duplicate atom method "root"'));
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('duplicate atom key "root"'));
		warn.mockRestore();
	});

	it('warns when a method collides with a composed atom accessor', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const WithMethodCollision = defineBond({
			name: 'method-collision',
			parts: [Triggerable],
			atoms: {},
			methods: {
				trigger() {
					return 'method';
				}
			}
		});

		expect(new WithMethodCollision(new FState()).trigger() as unknown as string).toBe('method');
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('duplicate method "trigger"'));
		warn.mockRestore();
	});
});
