import { describe, expect, it } from 'vitest';
import { Bond, BondAtom, BondState } from './bond.svelte';

// Specs for Bond.namespace and BondAtom.preset — the seam for <namespace>.<atom> preset key resolution. See CONTEXT.md §preset.

class TestState extends BondState {}

class TestBond extends Bond {
	override share(): this {
		return this;
	}
}

class TestAtom extends BondAtom {
	constructor(bond: Bond, key: string) {
		super(bond, key);
	}
}

// Overrides namespace only, mirroring compound bonds (combobox, select, dropdown-menu).
class NamespacedBond extends TestBond {
	override get namespace(): string {
		return 'combobox';
	}
}

// Hyphenated DOM namespace with deeper dotted preset path (accordion-item → accordion.item).
class NestedBond extends TestBond {
	override get namespace(): string {
		return 'accordion-item';
	}
	override get preset(): string {
		return 'accordion.item';
	}
}

function makeState() {
	return new TestState({});
}

describe('Bond.namespace', () => {
	it('defaults to the bond name', () => {
		const bond = new TestBond(makeState(), 'popover');
		expect(bond.namespace).toBe('popover');
	});

	it('is overridable by subclasses', () => {
		const bond = new NamespacedBond(makeState(), 'popover');
		expect(bond.namespace).toBe('combobox');
	});
});

describe('BondAtom.preset', () => {
	it('builds the preset key from the default namespace (name)', () => {
		const bond = new TestBond(makeState(), 'popover');
		expect(new TestAtom(bond, 'content').preset).toBe('popover.content');
	});

	it('builds the preset key from the overridden namespace', () => {
		const bond = new NamespacedBond(makeState(), 'popover');
		expect(new TestAtom(bond, 'arrow').preset).toBe('combobox.arrow');
	});

	it('re-namespaces every atom the bond exposes', () => {
		const bond = new NamespacedBond(makeState(), 'popover');
		expect(new TestAtom(bond, 'content').preset).toBe('combobox.content');
		expect(new TestAtom(bond, 'item').preset).toBe('combobox.item');
	});

	it('maps the root atom to the bare bond preset (no `.root` suffix)', () => {
		const bond = new TestBond(makeState(), 'accordion');
		expect(new TestAtom(bond, 'root').preset).toBe('accordion');
	});

	it('follows bond.preset, not the hyphenated DOM namespace, for nested bonds', () => {
		const bond = new NestedBond(makeState(), 'accordion-item');
		expect(new TestAtom(bond, 'root').preset).toBe('accordion.item');
		expect(new TestAtom(bond, 'header').preset).toBe('accordion.item.header');
		// hyphens inside a single atom name are preserved
		expect(new TestAtom(bond, 'close-button').preset).toBe('accordion.item.close-button');
	});

	it('defaults bond.preset to the namespace for single-level components', () => {
		const bond = new TestBond(makeState(), 'dropdown-menu');
		expect(new TestAtom(bond, 'list').preset).toBe('dropdown-menu.list');
	});
});

// Fixtures: fixed static atoms (class registry) + dynamic per-value atoms (registerAtom).
class RootAtom extends BondAtom {}
class ItemAtom extends BondAtom {
	value: string;
	constructor(bond: Bond, key: string, value: string) {
		super(bond, key);
		this.value = value;
	}
}
class RegistryBond extends TestBond {
	static atoms = {
		root: (b: Bond) => new RootAtom(b, 'root')
	};

	item(value: string): ItemAtom {
		const key = `item:${value}`;
		this.registerAtom(key, (b) => new ItemAtom(b, key, value));
		return this.atom(key) as ItemAtom;
	}
}

describe('Bond atom registry resolution', () => {
	it('builds a fixed atom from the shared static class registry', () => {
		const bond = new RegistryBond(makeState(), 'stack');
		expect(bond.atom('root')).toBeInstanceOf(RootAtom);
	});

	it('caches per key — repeat access returns the same atom instance', () => {
		const bond = new RegistryBond(makeState(), 'stack');
		expect(bond.atom('root')).toBe(bond.atom('root'));
	});

	it('falls back to DefaultAtom for an unregistered key', () => {
		const bond = new RegistryBond(makeState(), 'stack');
		const atom = bond.atom('nope');
		expect(atom).toBeInstanceOf(BondAtom);
		expect(atom).not.toBeInstanceOf(RootAtom);
	});

	it('resolves a dynamic per-value atom registered via registerAtom', () => {
		const bond = new RegistryBond(makeState(), 'stack');
		const apple = bond.item('apple');
		expect(apple).toBeInstanceOf(ItemAtom);
		expect(apple.value).toBe('apple');
	});

	it('keeps dynamic atoms per-instance and never mutates the shared class registry', () => {
		const a = new RegistryBond(makeState(), 'stack');
		const b = new RegistryBond(makeState(), 'stack');
		expect(a.item('apple').value).toBe('apple');
		expect(b.item('banana').value).toBe('banana');
		// the class registry stays fixed — dynamic atoms live on the instance, not the class
		expect(Object.keys((RegistryBond as unknown as typeof Bond).atoms)).toEqual(['root']);
	});
});

// ADR 0005 — symbol protocol layer
describe('Bond[Symbol.toStringTag] (ADR 0005 D1)', () => {
	it('tags the bond with its name so it prints as [object <name>]', () => {
		const bond = new TestBond(makeState(), 'popover');
		expect(Object.prototype.toString.call(bond)).toBe('[object popover]');
	});

	it('follows an overridden name (empty default when unnamed)', () => {
		expect(Object.prototype.toString.call(new TestBond(makeState()))).toBe('[object ]');
	});
});

describe('Bond[Symbol.hasInstance] (ADR 0005 D4)', () => {
	// Simulate a bond from a duplicate package copy via a plain object carrying the registered brand symbol.
	const BOND_BRAND = Symbol.for('@svelte-atoms/bond:brand');
	const fromOtherCopy = { [BOND_BRAND]: true };

	it('recognises a normal bond as an instance of the base', () => {
		expect(new TestBond(makeState(), 'popover') instanceof Bond).toBe(true);
	});

	it('recognises a brand-carrying object from a duplicate package copy', () => {
		// A prototype-chain check would fork here; the brand check survives the copy.
		expect(fromOtherCopy instanceof Bond).toBe(true);
	});

	it('rejects plain objects and null-proto objects with no brand', () => {
		expect({} instanceof Bond).toBe(false);
		expect(Object.create(null) instanceof Bond).toBe(false);
	});

	it('keeps exact prototype semantics for subclass checks', () => {
		const bond = new TestBond(makeState(), 'popover');
		expect(bond instanceof TestBond).toBe(true);
		// brand alone must NOT satisfy a subclass check — that stays prototype-based
		expect(fromOtherCopy instanceof TestBond).toBe(false);
		// a sibling subclass instance is not an instance of an unrelated subclass
		expect(bond instanceof NamespacedBond).toBe(false);
		expect(new NamespacedBond(makeState(), 'popover') instanceof TestBond).toBe(true);
	});
});
