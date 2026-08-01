import { describe, expect, expectTypeOf, it } from 'vitest';
import { Atom, Bond, type BondStateProps } from '$ixirjs/ui/shared/bond';
import { defineBond, type AtomSpec, type DefinedBond } from './define.svelte';
import { resolveBondPart } from './metadata';
import {
	createSelection,
	selectionCapability,
	SELECTION
} from '$ixirjs/ui/shared/capability/models/selection.svelte';

// Svelte serializes an inferred root `getBond()` return structurally, losing Bond's private fields.
// This must remain valid in declarations consumed from a separately installed package.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PackedRootGetBond = DefinedBond<{ name: string; atoms: Record<never, AtomSpec> }>;

// Shared state lives on a Bond subclass used as the spec's `base`. This is the shape
// `defineBond({ state })` used to provide through a separate host class.
class TBase extends Bond<BondStateProps> {
	values = $state<string[]>([]);
	selection = createSelection<string>({
		get: () => this.values,
		set: (v) => (this.values = v),
		mode: () => 'multiple'
	});
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

const Defined = defineBond({
	name: 'test-dc',
	base: TBase,
	atoms: { root: RootAtom, item: ItemAtom },
	capabilities: (bond: TBase) => [selectionCapability(bond.selection)]
});

describe('defineBond', () => {
	it('derives its entire facade from the single spec inference site', () => {
		const _Inferred = defineBond({
			name: 'inferred',
			base: TBase,
			atoms: { root: RootAtom },
			methods: { ping: () => 'pong' as const }
		});

		expectTypeOf<InstanceType<typeof _Inferred>['props']>().toEqualTypeOf<BondStateProps>();
		expectTypeOf<InstanceType<typeof _Inferred>['ping']>().toEqualTypeOf<() => 'pong'>();
		expectTypeOf<typeof _Inferred.create>().parameter(0).toEqualTypeOf<BondStateProps>();
	});

	it('accepts a declaration-emitted base shape for inferred root exports', () => {
		const bond: PackedRootGetBond | undefined = undefined;
		expect(bond).toBeUndefined();
	});

	it('does not manufacture detached atom methods', () => {
		const bond = new Defined({}) as unknown as Record<string, unknown>;
		expect(bond.root).toBeUndefined();
		expect(bond.item).toBeUndefined();
		expect('state' in bond).toBe(false);
	});

	it('wires namespace + preset into directly constructed atom spreads', () => {
		const bond = new Defined({});
		const root = new RootAtom(bond);
		expect(bond.namespace).toBe('test-dc');
		expect(bond.preset).toBe('test-dc');
		expect(root.spread['data-bond']).toBe('test-dc');
		expect(root.spread['data-kind']).toBe('test-dc-root');
	});

	it('sets CONTEXT_KEY from name', () => {
		expect(Defined.CONTEXT_KEY).toContain('test-dc');
	});

	it('registers the spec capabilities on the bond', () => {
		const bond = new Defined({});
		expect(bond.capability(SELECTION)).toBeDefined();
	});

	it('honours a preset override distinct from the name', () => {
		const Nested = defineBond({
			name: 'a-b',
			atoms: { root: RootAtom },
			preset: 'a.b'
		});
		const bond = new Nested({});
		expect(bond.namespace).toBe('a-b');
		expect(bond.preset).toBe('a.b');
	});

	it('works with no capabilities', () => {
		const Plain = defineBond({
			name: 'plain',
			atoms: { root: RootAtom }
		});
		const bond = new Plain({});
		expect(new RootAtom(bond)).toBeInstanceOf(RootAtom);
		expect(bond.capability(SELECTION)).toBeUndefined();
	});
});

describe('defineBond — atom spec affordances', () => {
	it('accepts Atom constructors as declaration metadata', () => {
		const NodeDefined = defineBond({
			name: 'node-defined',
			atoms: { root: NodeRootAtom, item: NodeItemAtom }
		});
		const bond = new NodeDefined({});

		expect(new NodeRootAtom(bond)).toBeInstanceOf(NodeRootAtom);
		expect(new NodeItemAtom(bond)).toBeInstanceOf(NodeItemAtom);
	});

	it('keeps declaration aliases, roles, and cardinality in metadata without runtime methods', () => {
		const Aliased = defineBond({
			name: 'aliased',
			atoms: { dismiss: { atom: RootAtom, part: 'close', cardinality: 'many' } }
		});
		const Roled = defineBond({
			name: 'roled',
			base: TBase,
			atoms: { list: { atom: RootAtom, role: 'container' } },
			capabilities: (bond: TBase) => [selectionCapability(bond.selection)]
		});

		const aliased = new Aliased({}) as unknown as Record<string, unknown>;
		const roled = new Roled({});
		expect(aliased.dismiss).toBeUndefined();
		expect(resolveBondPart(Aliased, 'dismiss')).toMatchObject({
			part: 'close',
			cardinality: 'many'
		});
		expect(new RootAtom(roled).role('container').spread['aria-multiselectable']).toBe(true);
	});

	it('base: extends a base bond class, inheriting its methods', () => {
		class BaseBond extends Bond {
			greet() {
				return 'hi';
			}
		}
		const Derived = defineBond({
			name: 'derived',
			base: BaseBond,
			atoms: { root: RootAtom }
		});
		const bond = new Derived({});
		expect((bond as unknown as BaseBond).greet()).toBe('hi');
		expect(bond.namespace).toBe('derived');
	});

	it('subclassing is the escape hatch for custom / parameterized methods', () => {
		class Sub extends defineBond({
			name: 'sub',
			atoms: { root: RootAtom }
		}) {
			label() {
				return 'custom';
			}
		}
		const bond = new Sub({});
		expect(bond.label()).toBe('custom');
		expect((Sub as unknown as { CONTEXT_KEY: string }).CONTEXT_KEY).toContain('sub');
	});

	it('methods: attaches non-atom instance methods', () => {
		const WithMethods = defineBond({
			name: 'with-methods',
			atoms: { root: RootAtom },
			methods: {
				ping(): string {
					return 'pong';
				}
			}
		});
		const bond = new WithMethods({});
		expect(bond.ping()).toBe('pong');
	});
});

describe('defineBond — `extends` inheritance', () => {
	class ChildItemAtom extends Atom {
		constructor(bond: ConstructorParameters<typeof Atom>[0]) {
			super(bond, 'item');
		}
	}

	const Parent = defineBond({
		name: 'parent',
		base: TBase,
		atoms: { root: RootAtom, item: ItemAtom },
		capabilities: (bond: TBase) => [selectionCapability(bond.selection)],
		methods: {
			kind(this: unknown) {
				return 'parent-kind';
			}
		}
	});

	const Child = defineBond({
		extends: Parent,
		name: 'child',
		atoms: { item: ChildItemAtom }
	});

	it('inherits parent capabilities and metadata while overriding identity', () => {
		const bond = new Child({});
		expect(bond.capability(SELECTION)).toBeDefined();
		expect(bond.namespace).toBe('child');
		expect(bond.preset).toBe('child');
		expect((bond as unknown as { kind(): string }).kind()).toBe('parent-kind');
		expect(new RootAtom(bond)).toBeInstanceOf(RootAtom);
		expect(new ChildItemAtom(bond)).toBeInstanceOf(ChildItemAtom);
	});

	it('is instanceof the parent and shares its context key', () => {
		const bond = new Child({});
		expect(bond).toBeInstanceOf(Parent);
		expect((Child as unknown as { CONTEXT_KEY: string }).CONTEXT_KEY).toBe(
			(Parent as unknown as { CONTEXT_KEY: string }).CONTEXT_KEY
		);
	});

	it('keeps composition metadata private', () => {
		expect('spec' in Child).toBe(false);
	});
});

describe('defineBond — state on the base class (`base` + `create`)', () => {
	it('self-constructs via create(), carrying the base class state', () => {
		const Stateful = defineBond({ name: 'stateful', base: TBase, atoms: { root: RootAtom } });
		const bond = Stateful.create({});
		expect(bond).toBeInstanceOf(Stateful);
		expect('state' in bond).toBe(false);
		expect(bond.selection).toBeDefined();
		expect(new RootAtom(bond)).toBeInstanceOf(RootAtom);
	});

	it('hands the constructed bond to the capability factory', () => {
		const Stateful = defineBond({
			name: 'stateful-typed',
			base: TBase,
			atoms: { root: RootAtom },
			capabilities: (bond: TBase) => [selectionCapability(bond.selection)]
		});
		const bond = Stateful.create({});
		expect(bond.capability(SELECTION)?.surface).toBe(bond.selection);
	});

	it('create() constructs a Bond-owned props model when the spec declares no state', () => {
		const Stateless = defineBond({ name: 'stateless', atoms: { root: RootAtom } });
		const bond = Stateless.create({ id: 'owned' });
		expect(bond).toBeInstanceOf(Stateless);
		expect(bond.id).toBe('owned');
		expect(new RootAtom(bond)).toBeInstanceOf(RootAtom);
	});

	it('create() respects subclass identity', () => {
		const Base = defineBond({ name: 'base-sc', base: TBase, atoms: { root: RootAtom } });
		class Sub extends Base {}
		const bond = (Sub as unknown as { create(p: unknown): { constructor: unknown } }).create({});
		expect(bond).toBeInstanceOf(Sub);
	});
});
