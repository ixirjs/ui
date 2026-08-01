import { describe, expect, it, vi, afterEach } from 'vitest';
import { Bond, Atom, BondState, bondContextKey, type BondStateProps } from '../../bond';
import { collectionSlot } from './collection.svelte';
import { createRovingFocus, rovingCapability, ROVING } from './roving.svelte';
import { typeaheadCapability, TYPEAHEAD } from './typeahead.svelte';

type Item = {
	label: string;
	disabled?: boolean;
};

class TypeaheadState extends BondState<BondStateProps> {
	items = this.collection<Item>('item');
	roving = createRovingFocus<Item>({
		ids: () => this.items.keys,
		item: (id) => this.items.get(id)
	});

	constructor() {
		super({});
		this.capability(rovingCapability(this.roving));
		this.capability(
			typeaheadCapability(this.items, this.roving, { roles: ['container', 'trigger'] })
		);
	}
}

class TypeaheadBond extends Bond<BondStateProps> {
	static CONTEXT_KEY = bondContextKey('test-typeahead');
	constructor(state = new TypeaheadState()) {
		super(state, 'test-typeahead');
	}

	override get state(): TypeaheadState {
		return super.state as TypeaheadState;
	}
}

class TypeaheadAtom extends Atom<TypeaheadBond> {
	constructor(bond: TypeaheadBond, key = 'content') {
		super(bond, key);
	}
}

function seed(state: TypeaheadState) {
	state.items.set('alpha', { label: 'Alpha' });
	state.items.set('beta', { label: 'Beta', disabled: true });
	state.items.set('bravo', { label: 'Bravo' });
	state.items.set('charlie', { label: 'Charlie' });
}

function key(spread: Record<string, unknown>, k: string, extra: Partial<KeyboardEvent> = {}) {
	const ev = {
		key: k,
		defaultPrevented: false,
		altKey: false,
		ctrlKey: false,
		metaKey: false,
		preventDefault: vi.fn(),
		...extra
	} as unknown as KeyboardEvent;
	(spread.onkeydown as (e: Event) => void)(ev);
	return ev;
}

afterEach(() => {
	vi.useRealTimers();
});

describe('typeaheadCapability', () => {
	it('reports metadata, surface, and collection/roving requirements', () => {
		const bond = new TypeaheadBond();
		const cap = bond.state.requireCapability(TYPEAHEAD);

		expect(cap.surface).toBeDefined();
		expect(cap.requires).toEqual([collectionSlot('item'), ROVING]);
		expect(cap.meta).toMatchObject({
			layer: 1,
			kind: 'policy',
			projects: ['container', 'trigger']
		});
	});

	it('buffers printable keys and moves the roving focus to the matching item', () => {
		vi.useFakeTimers();
		const bond = new TypeaheadBond();
		bond.state.markSetupConsumed();
		seed(bond.state);

		const content = new TypeaheadAtom(bond).role('container');

		const b = key(content.spread, 'b');
		expect(bond.state.roving.activeId).toBe('bravo');
		expect(b.preventDefault).toHaveBeenCalled();
		expect(bond.state.requireSurface(TYPEAHEAD).buffer).toBe('b');

		key(content.spread, 'r');
		expect(bond.state.roving.activeId).toBe('bravo');
		expect(bond.state.requireSurface(TYPEAHEAD).buffer).toBe('br');

		vi.advanceTimersByTime(700);
		expect(bond.state.requireSurface(TYPEAHEAD).buffer).toBe('');

		key(content.spread, 'a');
		expect(bond.state.roving.activeId).toBe('alpha');
	});

	it('falls back to a fresh one-character search when the buffered query misses', () => {
		const bond = new TypeaheadBond();
		bond.state.markSetupConsumed();
		seed(bond.state);

		const content = new TypeaheadAtom(bond).role('container');

		key(content.spread, 'x');
		expect(bond.state.roving.activeId).toBeNull();
		key(content.spread, 'c');
		expect(bond.state.roving.activeId).toBe('charlie');
		expect(bond.state.requireSurface(TYPEAHEAD).buffer).toBe('c');
	});

	it('ignores default-prevented, modified, non-printable, and disabled searches', () => {
		const bond = new TypeaheadBond();
		bond.state.markSetupConsumed();
		seed(bond.state);

		const content = new TypeaheadAtom(bond).role('container');

		key(content.spread, 'ArrowDown');
		expect(bond.state.roving.activeId).toBeNull();
		key(content.spread, 'b', { ctrlKey: true });
		expect(bond.state.roving.activeId).toBeNull();
		key(content.spread, 'b', { defaultPrevented: true });
		expect(bond.state.roving.activeId).toBeNull();

		key(content.spread, 'b');
		expect(bond.state.roving.activeId).toBe('bravo');
	});

	it('projects to each configured role', () => {
		const bond = new TypeaheadBond();
		bond.state.markSetupConsumed();
		seed(bond.state);

		const trigger = new TypeaheadAtom(bond, 'trigger').role('trigger');
		key(trigger.spread, 'c');

		expect(bond.state.roving.activeId).toBe('charlie');
	});

	it('clears pending timeout state during setup teardown', () => {
		vi.useFakeTimers();
		const state = new TypeaheadState();
		seed(state);
		const cap = typeaheadCapability(state.items, state.roving);
		const surface = cap.surface!;
		const bond = new TypeaheadBond(state);

		surface.handleKeydown({
			key: 'a',
			defaultPrevented: false,
			altKey: false,
			ctrlKey: false,
			metaKey: false,
			preventDefault: vi.fn()
		} as unknown as KeyboardEvent);

		expect(surface.buffer).toBe('a');
		const teardown = cap.setup?.(bond) as (() => void) | undefined;
		teardown?.();
		expect(surface.buffer).toBe('');
		expect(vi.getTimerCount()).toBe(0);
	});
});
