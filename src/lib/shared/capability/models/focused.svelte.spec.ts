import { describe, expect, it } from 'vitest';
import { Atom, Bond, BondState } from '$svelte-atoms/core/shared/bond';
import {
	ERROR_MESSAGE,
	INPUT,
	ROVING,
	SELECTION,
	STATUS,
	TYPEAHEAD,
	VALIDATION,
	collectionSlot,
	createInput,
	createRovingFocus,
	createSelection,
	createStatus,
	createValidation,
	filterableCollectionCapability,
	labelledFieldCapability,
	navigableCollectionCapability,
	selectableCollectionCapability,
	type CollectionCapability,
	validatedControlCapability
} from '.';

class TestState extends BondState {
	constructor() {
		super({});
	}
}

class TestBond extends Bond {
	constructor(state: TestState) {
		super(state, 'test');
	}
}

function addAtom(bond: TestBond, key: string, role: string, ctx?: unknown) {
	const atom = new Atom(bond, key).role(role, ctx);
	bond.register(atom, { key });
	return atom;
}

describe('Layer 2 focused capability bundles', () => {
	it('selectableCollectionCapability composes collection and selection primitives', () => {
		let values = $state<string[]>([]);
		const selection = createSelection<string>({
			get: () => values,
			set: (next) => (values = next),
			mode: () => 'multiple'
		});
		const caps = selectableCollectionCapability({
			kind: 'item',
			selection,
			collectionOptions: { positional: true }
		});
		const state = new TestState();
		const bond = new TestBond(state);
		for (const cap of caps) bond.capability(cap);

		const collection = bond.requireSurface(collectionSlot('item'));
		collection.set('rust', { label: 'Rust' });
		collection.set('go', { label: 'Go' });

		expect(caps.meta).toMatchObject({ layer: 2, kind: 'focused' });
		expect(bond.capability(SELECTION)?.surface).toBe(selection);
		const rust = addAtom(bond, 'rust', 'item', 'rust');
		expect(rust.spread).toMatchObject({
			'aria-selected': false,
			'aria-posinset': 1
		});

		selection.select('rust');
		expect(rust.spread).toMatchObject({
			'aria-selected': true,
			'data-selected': ''
		});
	});

	it('navigableCollectionCapability composes collection, roving, and navigation', () => {
		const state = new TestState();
		const collection = selectableCollectionCapability({
			kind: 'item',
			selection: createSelection<string>({
				get: () => [],
				set: () => {},
				mode: () => 'single'
			})
		}).find((cap): cap is CollectionCapability<string> => cap.slot === collectionSlot('item'))!;
		const roving = createRovingFocus({
			ids: () => ['rust', 'go']
		});
		const caps = navigableCollectionCapability({
			collection,
			roving,
			navigation: { homeEnd: true, preventScroll: true }
		});
		const bond = new TestBond(state);
		for (const cap of caps) bond.capability(cap);

		const ev = new KeyboardEvent('keydown', { key: 'ArrowDown' });
		const preventDefault = viPreventDefault(ev);
		const handlers = addAtom(bond, 'list', 'container').spread;
		(handlers.onkeydown as (ev: Event) => void)(ev);

		expect(caps.meta).toMatchObject({ layer: 2, kind: 'focused' });
		expect(bond.capability(ROVING)?.surface).toBe(roving);
		expect(preventDefault.called).toBe(true);
		expect(roving.activeId).toBe('rust');
	});

	it('filterableCollectionCapability composes input and typeahead over a collection', () => {
		let query = $state('');
		const input = createInput({
			query: {
				get: () => query,
				set: (next) => (query = next)
			}
		});
		const roving = createRovingFocus({ ids: () => ['rust'] });
		const caps = filterableCollectionCapability({
			kind: 'item',
			input,
			roving
		});
		const state = new TestState();
		const bond = new TestBond(state);
		for (const cap of caps) bond.capability(cap);

		expect(caps.meta).toMatchObject({ layer: 2, kind: 'focused' });
		expect(bond.capability(INPUT)?.surface).toBe(input);
		expect(bond.capability(TYPEAHEAD)?.surface).toBeDefined();
	});

	it('labelledFieldCapability and validatedControlCapability compose form primitives', () => {
		const status = createStatus({ disabled: () => true });
		const validation = createValidation({
			validate: () => ({ success: false, errors: [{ path: [], message: 'Required' }] })
		});
		const fieldCaps = labelledFieldCapability({ labelled: { nativeFor: true }, status });
		const validationCaps = validatedControlCapability({ validation, status: false });
		const state = new TestState();
		const bond = new TestBond(state);
		for (const cap of [...fieldCaps, ...validationCaps]) bond.capability(cap);

		expect(fieldCaps.meta).toMatchObject({ layer: 2, kind: 'focused' });
		expect(validationCaps.meta).toMatchObject({ layer: 2, kind: 'focused' });
		expect(bond.capability(STATUS)?.surface).toBeDefined();
		expect(bond.capability(VALIDATION)?.surface).toBe(validation);
		expect(bond.capability(ERROR_MESSAGE)).toBeDefined();

		addAtom(bond, 'label', 'label');
		addAtom(bond, 'description', 'description');
		const control = addAtom(bond, 'control', 'control');
		const error = addAtom(bond, 'error', 'error');
		validation.validate();

		expect(control.spread).toMatchObject({
			'aria-invalid': 'true',
			'aria-errormessage': error.id
		});
	});
});

function viPreventDefault(ev: KeyboardEvent): { called: boolean } {
	const tracker = { called: false };
	Object.defineProperty(ev, 'preventDefault', {
		value: () => {
			tracker.called = true;
		}
	});
	return tracker;
}
