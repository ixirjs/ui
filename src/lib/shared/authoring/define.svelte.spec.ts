import { describe, expect, it } from 'vitest';
import { Atom, Bond, BondState, type BondStateProps } from '../bond';
import { defineBond } from './define.svelte';
import {
	createSelection,
	selectionCapability,
	SELECTION
} from '../capability/models/selection.svelte';

class TState extends BondState<BondStateProps> {
	values = $state<string[]>([]);
	selection = createSelection<string>({
		get: () => this.values,
		set: (v) => (this.values = v),
		mode: () => 'multiple'
	});
	constructor() {
		super({});
	}
}

class RootAtom extends Atom {
	constructor(bond: ConstructorParameters<typeof Atom>[0]) {
		super(bond, 'root');
	}
}
class ItemAtom extends Atom {
	constructor(bond: ConstructorParameters<typeof Atom>[0]) {
		super(bond, 'item');
	}
}
class NodeRootAtom extends Atom {
	constructor(bond: Bond) {
		super(bond, 'root');
	}
}
class NodeItemAtom extends Atom {
	constructor(bond: Bond) {
		super(bond, 'item');
	}
}

const Defined = defineBond<{ root: typeof RootAtom; item: typeof ItemAtom }, TState>({
	name: 'test-dc',
	atoms: { root: RootAtom, item: ItemAtom },
	capabilities: (state: TState) => [selectionCapability(state.selection)]
});

describe('defineBond', () => {
	it('generates typed atom factory methods', () => {
		const bond = new Defined(new TState());
		expect(bond.root()).toBeInstanceOf(RootAtom);
		expect(bond.item()).toBeInstanceOf(ItemAtom);
		expect(bond.root()).not.toBe(bond.item());
	});

	it('wires namespace + preset from name, into the atom spread', () => {
		const bond = new Defined(new TState());
		expect(bond.namespace).toBe('test-dc');
		expect(bond.preset).toBe('test-dc');
		expect(bond.root().spread['data-bond']).toBe('test-dc');
		expect(bond.root().spread['data-kind']).toBe('test-dc-root');
	});

	it('sets CONTEXT_KEY from name', () => {
		expect(Defined.CONTEXT_KEY).toContain('test-dc');
	});

	it('registers the spec capabilities on the bond', () => {
		const bond = new Defined(new TState());
		const selection = bond.state.capability(SELECTION);
		expect(selection).toBeDefined();
		// the surface is the same instance the state holds
		expect(selection?.surface).toBe((bond.state as TState).selection);
	});

	it('honours a preset override distinct from the name', () => {
		const Nested = defineBond<{ root: typeof RootAtom }, TState>({
			name: 'a-b',
			atoms: { root: RootAtom },
			preset: 'a.b'
		});
		const bond = new Nested(new TState());
		expect(bond.namespace).toBe('a-b'); // DOM identity stays hyphenated
		expect(bond.preset).toBe('a.b'); // dotted preset base overridden
	});

	it('works with no capabilities', () => {
		const Plain = defineBond<{ root: typeof RootAtom }, TState>({
			name: 'plain',
			atoms: { root: RootAtom }
		});
		const bond = new Plain(new TState());
		expect(bond.root()).toBeInstanceOf(RootAtom);
		expect(bond.state.capability(SELECTION)).toBeUndefined();
	});
});

describe('defineBond v2 — atom spec affordances', () => {
	it('accepts Atom constructors for generated atom methods', () => {
		const NodeDefined = defineBond<
			{ root: typeof NodeRootAtom; item: typeof NodeItemAtom },
			TState
		>({
			name: 'node-defined',
			atoms: { root: NodeRootAtom, item: NodeItemAtom }
		});
		const bond = new NodeDefined(new TState());

		expect(bond.root()).toBeInstanceOf(NodeRootAtom);
		expect(bond.item()).toBeInstanceOf(NodeItemAtom);
		expect(bond.root()).toBeInstanceOf(Atom);
		expect(bond.root().spread['data-kind']).toBe('node-defined-root');
	});

	it('method alias: method name differs from the atom cache key', () => {
		const Aliased = defineBond<{ dismiss: { atom: typeof RootAtom; key: 'close' } }, TState>({
			name: 'aliased',
			atoms: { dismiss: { atom: RootAtom, key: 'close' } }
		});
		const bond = new Aliased(new TState());
		expect(bond.dismiss()).toBeInstanceOf(RootAtom);
		expect(bond.dismiss().spread['data-kind']).toBe('aliased-root'); // atom's own name
	});

	it('role: folds the capability projection into the atom spread', () => {
		const Roled = defineBond<{ list: { atom: typeof RootAtom; role: 'container' } }, TState>({
			name: 'roled',
			atoms: { list: { atom: RootAtom, role: 'container' } },
			capabilities: (s: TState) => [selectionCapability(s.selection)]
		});
		const bond = new Roled(new TState());
		// selectionCapability projects aria-multiselectable onto role:'container'
		expect(bond.list().spread['aria-multiselectable']).toBe(true);
	});

	it('base: extends a base bond class, inheriting its methods (overlay-collapse seam)', () => {
		class BaseBond extends Bond {
			greet() {
				return 'hi';
			}
		}
		const Derived = defineBond<{ root: typeof RootAtom }, TState, typeof BaseBond>({
			name: 'derived',
			base: BaseBond,
			atoms: { root: RootAtom }
		});
		const bond = new Derived(new TState());
		expect((bond as unknown as BaseBond).greet()).toBe('hi'); // inherited from the base
		expect(bond.root()).toBeInstanceOf(RootAtom); // generated factory still works
		expect(bond.namespace).toBe('derived'); // name applied over the base
	});

	it('subclassing is the escape hatch for custom / parameterized methods', () => {
		class Sub extends defineBond<{ root: typeof RootAtom }, TState>({
			name: 'sub',
			atoms: { root: RootAtom }
		}) {
			label() {
				return 'custom';
			}
		}
		const bond = new Sub(new TState());
		expect(bond.root()).toBeInstanceOf(RootAtom); // inherited generated factory
		expect(bond.label()).toBe('custom'); // custom method
		expect((Sub as unknown as { CONTEXT_KEY: string }).CONTEXT_KEY).toContain('sub');
	});

	it('methods: attaches non-atom instance methods, typed via the `M` generic', () => {
		// Fully-inferred call: `methods` show up in the instance type, so `bond.ping()` needs no cast (explicit type args would require the duality-alias intersection instead).
		const WithMethods = defineBond({
			name: 'with-methods',
			atoms: { root: RootAtom },
			methods: {
				ping(): string {
					return 'pong';
				}
			}
		});
		const bond = new WithMethods(new TState());
		expect(bond.ping()).toBe('pong');
	});

	it('atomMethods: false omits generated atom factory methods', () => {
		const WithoutAtomMethods = defineBond({
			name: 'without-atom-methods',
			atoms: { root: RootAtom },
			atomMethods: false
		});
		const bond = new WithoutAtomMethods(new TState());

		expect((bond as unknown as Record<string, unknown>).root).toBeUndefined();
	});
});

describe('defineBond v3 — `extends` (single-parent spec inheritance)', () => {
	class ChildItemAtom extends Atom {
		constructor(bond: ConstructorParameters<typeof Atom>[0]) {
			super(bond, 'item');
		}
	}

	const Parent = defineBond<{ root: typeof RootAtom; item: typeof ItemAtom }, TState>({
		name: 'parent',
		atoms: { root: RootAtom, item: ItemAtom },
		capabilities: (s: TState) => [selectionCapability(s.selection)],
		methods: {
			kind(this: unknown) {
				return 'parent-kind';
			}
		}
	});

	// No explicit type args — `extends` infers the parent's atoms/state; `atoms` infers own.
	const Child = defineBond({
		extends: Parent,
		name: 'child',
		atoms: { item: ChildItemAtom } // overrides the parent's `item` slot (last-wins)
	});

	it('inherits the parent atoms not overridden', () => {
		const bond = new Child(new TState());
		expect(bond.root()).toBeInstanceOf(RootAtom); // inherited from parent prototype
	});

	it("own atoms override the parent's per slot (last-wins)", () => {
		const bond = new Child(new TState());
		expect(bond.item()).toBeInstanceOf(ChildItemAtom);
		expect(bond.item()).not.toBeInstanceOf(ItemAtom);
	});

	it('inherits parent capabilities (registered by the parent ctor via super)', () => {
		const bond = new Child(new TState());
		expect(bond.state.capability(SELECTION)).toBeDefined();
	});

	it('inherits + can override parent methods', () => {
		const bond = new Child(new TState()) as unknown as { kind(): string };
		expect(bond.kind()).toBe('parent-kind'); // inherited via prototype chain
	});

	it('namespace/preset come from the CHILD spec', () => {
		const bond = new Child(new TState());
		expect(bond.namespace).toBe('child');
		expect(bond.preset).toBe('child');
		expect(bond.item().spread['data-bond']).toBe('child');
	});

	it('is instanceof the parent (real subclass)', () => {
		const bond = new Child(new TState());
		expect(bond).toBeInstanceOf(Parent);
	});

	it("inherits the parent's CONTEXT_KEY (family context-unification)", () => {
		expect((Child as unknown as { CONTEXT_KEY: string }).CONTEXT_KEY).toBe(
			(Parent as unknown as { CONTEXT_KEY: string }).CONTEXT_KEY
		);
	});

	it('flattened static spec exposes parent+own atoms (the fuse/extends seam)', () => {
		const spec = (Child as unknown as { spec: { atoms: Record<string, unknown> } }).spec;
		expect(Object.keys(spec.atoms).sort()).toEqual(['item', 'root']); // merged
	});

	it('atomMethods: false shadows inherited generated atom methods', () => {
		const ChildWithoutAtomMethods = defineBond({
			extends: Parent,
			name: 'child-without-atom-methods',
			atoms: {},
			atomMethods: false
		});
		const bond = new ChildWithoutAtomMethods(new TState());

		expect((bond as unknown as Record<string, unknown>).root).toBeUndefined();
		expect((bond as unknown as Record<string, unknown>).item).toBeUndefined();
		expect((bond as unknown as { kind(): string }).kind()).toBe('parent-kind');
	});
});

describe('defineBond v4 — state co-location (`state` + `create`)', () => {
	it('exposes the declared State class statically and self-constructs via create()', () => {
		const Stateful = defineBond({ name: 'stateful', state: TState, atoms: { root: RootAtom } });
		expect(Stateful.state).toBe(TState); // static ref to the declared State class
		const bond = Stateful.create({});
		expect(bond).toBeInstanceOf(Stateful);
		expect(bond.state).toBe(bond); // state is the Bond-owned compatibility facade
		expect(bond.root()).toBeInstanceOf(RootAtom); // generated atom factory still works
	});

	it('infers the State type from the `state` field (no explicit generics)', () => {
		const Stateful = defineBond({
			name: 'stateful-typed',
			state: TState,
			atoms: { root: RootAtom },
			// thunk receives the inferred State — `state.selection` is TState-typed, no cast
			capabilities: (state) => [selectionCapability(state.selection)]
		});
		const bond = Stateful.create({});
		expect(bond.state.capability(SELECTION)?.surface).toBe((bond.state as TState).selection);
	});

	it('create() constructs a Bond-owned props model when the spec declares no state', () => {
		const Stateless = defineBond({ name: 'stateless', atoms: { root: RootAtom } });
		const bond = Stateless.create({ id: 'owned' });
		expect(bond).toBeInstanceOf(Stateless);
		expect(bond.id).toBe('owned');
		expect(bond.root()).toBeInstanceOf(RootAtom);
	});

	it('create() respects subclass identity (this-based self-construction)', () => {
		const Base = defineBond({ name: 'base-sc', state: TState, atoms: { root: RootAtom } });
		class Sub extends Base {}
		const bond = (Sub as unknown as { create(p: unknown): { constructor: unknown } }).create({});
		expect(bond).toBeInstanceOf(Sub); // constructed under Sub, not Base
	});
});
