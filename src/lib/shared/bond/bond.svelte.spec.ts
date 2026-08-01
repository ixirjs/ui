import { describe, expect, it, vi } from 'vitest';
import { Bond, Atom, capabilityKey, defineCapability } from './index';

// Specs for Bond.namespace and Atom.preset — the seam for <namespace>.<atom> preset key resolution. See CONTEXT.md §preset.

class TestBond extends Bond {
	override share(): this {
		return this;
	}
}

class TestAtom extends Atom {
	constructor(bond: Bond, key: string) {
		super(bond, key);
	}
}

class RoleAtom extends Atom {
	constructor(bond: Bond, key: string, role: string) {
		super(bond, key);
		this.role(role);
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

// Bonds take their props object directly; there is no separate state host.
function makeProps() {
	return {};
}

describe('Bond.namespace', () => {
	it('defaults to the bond name', () => {
		const bond = new TestBond(makeProps(), 'popover');
		expect(bond.namespace).toBe('popover');
	});

	it('is overridable by subclasses', () => {
		const bond = new NamespacedBond(makeProps(), 'popover');
		expect(bond.namespace).toBe('combobox');
	});
});

describe('Atom.preset', () => {
	it('builds the preset key from the default namespace (name)', () => {
		const bond = new TestBond(makeProps(), 'popover');
		expect(new TestAtom(bond, 'content').preset).toBe('popover.content');
	});

	it('builds the preset key from the overridden namespace', () => {
		const bond = new NamespacedBond(makeProps(), 'popover');
		expect(new TestAtom(bond, 'arrow').preset).toBe('combobox.arrow');
	});

	it('re-namespaces every atom the bond exposes', () => {
		const bond = new NamespacedBond(makeProps(), 'popover');
		expect(new TestAtom(bond, 'content').preset).toBe('combobox.content');
		expect(new TestAtom(bond, 'item').preset).toBe('combobox.item');
	});

	it('maps the root atom to the bare bond preset (no `.root` suffix)', () => {
		const bond = new TestBond(makeProps(), 'accordion');
		expect(new TestAtom(bond, 'root').preset).toBe('accordion');
	});

	it('follows bond.preset, not the hyphenated DOM namespace, for nested bonds', () => {
		const bond = new NestedBond(makeProps(), 'accordion-item');
		expect(new TestAtom(bond, 'root').preset).toBe('accordion.item');
		expect(new TestAtom(bond, 'header').preset).toBe('accordion.item.header');
		// hyphens inside a single atom name are preserved
		expect(new TestAtom(bond, 'close-button').preset).toBe('accordion.item.close-button');
	});

	it('defaults bond.preset to the namespace for single-level components', () => {
		const bond = new TestBond(makeProps(), 'dropdown-menu');
		expect(new TestAtom(bond, 'list').preset).toBe('dropdown-menu.list');
	});
});

// Fixtures: registered component-owned atoms.
class RootAtom extends Atom {}
class ItemAtom extends Atom {
	value: string;
	constructor(bond: Bond, key: string, value: string) {
		super(bond, key);
		this.value = value;
	}
}
class RegistryBond extends TestBond {
	item(value: string): ItemAtom {
		const key = `item:${value}`;
		const atom = new ItemAtom(this, key, value);
		this.register(atom, { key });
		return atom;
	}
}

describe('Bond node registry resolution', () => {
	it('registers and resolves a fixed atom by key', () => {
		const bond = new RegistryBond(makeProps(), 'stack');
		const root = new RootAtom(bond, 'root');
		bond.register(root);

		expect(bond.nodeByPart('root')).toBe(root);
		expect(bond.nodeByPart('nope')).toBeUndefined();
	});

	it('resolves a dynamic per-value atom registered by the component', () => {
		const bond = new RegistryBond(makeProps(), 'stack');
		const apple = bond.item('apple');
		expect(bond.nodeByPart('item:apple')).toBe(apple);
		expect(apple).toBeInstanceOf(ItemAtom);
		expect(apple.value).toBe('apple');
	});

	it('keeps dynamic atoms per-instance', () => {
		const a = new RegistryBond(makeProps(), 'stack');
		const b = new RegistryBond(makeProps(), 'stack');
		expect(a.item('apple').value).toBe('apple');
		expect(b.item('banana').value).toBe('banana');
		expect(b.nodeByPart('item:apple')).toBeUndefined();
	});

	it('separates exact part and role lookups and rejects duplicate single parts', () => {
		const bond = new TestBond(makeProps(), 'registry');
		const trigger = new RoleAtom(bond, 'trigger', 'trigger');
		bond.register(trigger, { key: 'button' });
		expect(bond.nodeByPart('button')).toBe(trigger);
		expect(bond.nodesByPart('button')).toEqual([trigger]);
		expect(bond.nodeByRole('trigger')).toBe(trigger);
		expect(() => bond.register(new RootAtom(bond, 'button'))).toThrow('multiple nodes');
	});
});

describe('Bond.nodeByRole', () => {
	it('returns the first registered atom and diagnoses ambiguous roles once', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const bond = new TestBond(makeProps(), 'roles');
		bond.capability(
			defineCapability({ slot: capabilityKey('role-test'), roles: { trigger: () => ({}) } })
		);
		const first = new RoleAtom(bond, 'first', 'trigger');
		const second = new RoleAtom(bond, 'second', 'trigger');

		bond.register(first);
		bond.register(second);

		expect(bond.nodeByPart('first')).toBe(first);
		expect(bond.nodeByPart('second')).toBe(second);
		expect(bond.nodeByRole('trigger')).toBe(first);
		expect(bond.nodeByRole('trigger')).toBe(first);
		expect(warn).toHaveBeenCalledTimes(1);
		expect(warn).toHaveBeenCalledWith(
			expect.stringContaining('nodeByRole("trigger") matched multiple Atoms')
		);
		warn.mockRestore();
	});
});

describe('Atom.role', () => {
	it('does not duplicate projected behaviors for the same role/context on a cached atom', () => {
		const debug = vi.spyOn(console, 'debug').mockImplementation(() => {});
		let clicks = 0;
		const bond = new TestBond(makeProps(), 'roles');
		bond.capability(
			defineCapability({
				slot: capabilityKey('role-idempotent'),
				roles: {
					trigger: () => ({
						handlers: () => ({ onclick: () => clicks++ })
					})
				}
			})
		);

		const atom = new TestAtom(bond, 'trigger').role('trigger').role('trigger');
		(atom.spread.onclick as () => void)();

		expect(clicks).toBe(1);
		expect(debug).toHaveBeenCalledWith(expect.stringContaining('already projected'));
		debug.mockRestore();
	});
});

// ADR 0005 — symbol protocol layer
describe('Bond[Symbol.toStringTag] (ADR 0005 D1)', () => {
	it('tags the bond with its name so it prints as [object <name>]', () => {
		const bond = new TestBond(makeProps(), 'popover');
		expect(Object.prototype.toString.call(bond)).toBe('[object popover]');
	});

	it('follows an overridden name (empty default when unnamed)', () => {
		expect(Object.prototype.toString.call(new TestBond(makeProps()))).toBe('[object ]');
	});
});

describe('Bond[Symbol.hasInstance] (ADR 0005 D4)', () => {
	// Simulate a bond from a duplicate package copy via a plain object carrying the registered brand symbol.
	const BOND_BRAND = Symbol.for('@ixirjs/bond:brand');
	const fromOtherCopy = { [BOND_BRAND]: true };

	it('recognises a normal bond as an instance of the base', () => {
		expect(new TestBond(makeProps(), 'popover') instanceof Bond).toBe(true);
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
		const bond = new TestBond(makeProps(), 'popover');
		expect(bond instanceof TestBond).toBe(true);
		// brand alone must NOT satisfy a subclass check — that stays prototype-based
		expect(fromOtherCopy instanceof TestBond).toBe(false);
		// a sibling subclass instance is not an instance of an unrelated subclass
		expect(bond instanceof NamespacedBond).toBe(false);
		expect(new NamespacedBond(makeProps(), 'popover') instanceof TestBond).toBe(true);
	});
});
