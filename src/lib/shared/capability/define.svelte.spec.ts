import { describe, it, expect, vi } from 'vitest';
import {
	Bond,
	BondState,
	Atom,
	defineCapability,
	defineModelCapability,
	defineProjectionCapability,
	defineRelationshipCapability,
	definePolicyCapability,
	defineEffectCapability,
	defineFocusedCapability,
	defineArchetypeCapabilities,
	explainBondRole,
	sharedCapabilityKey,
	capabilityKey,
	type BondStateProps,
	type Capability
} from '../bond';
import { useCapabilities } from './use.svelte';

// defineCapability is the canonical authoring entry point: a typed role-map (or a raw behavior
// escape hatch) folded into a Capability, plus the surface-access (#3/#4) and setup-guard (#5)
// primitives it pairs with. These specs lock the seam the 9-issue pass introduced.

const MODEL = sharedCapabilityKey<{ value: number }>('@svelte-atoms/test:dc:model');
const DEP = sharedCapabilityKey<{ tag: string }>('@svelte-atoms/test:dc:dep');

class S extends BondState<BondStateProps> {
	constructor() {
		super({});
	}
}

class TestBond extends Bond {
	constructor(state: BondState = new S()) {
		super(state, 'test');
	}
}

const mkBond = () => new TestBond();

describe('defineCapability — typed role map', () => {
	it('folds a roles map into behavior(role) dispatch, returning undefined for unhandled roles', () => {
		const cap = defineCapability<{ value: number }>({
			slot: MODEL,
			surface: { value: 7 },
			roles: {
				item: (id) => ({ attrs: () => ({ 'data-id': id }) }),
				container: () => ({ attrs: () => ({ role: 'list' }) })
			}
		});

		const bond = mkBond();
		// ctx is typed per role (item → string); the projection resolves against the bond.
		expect(cap.behavior?.('item', 'a')?.attrs?.(bond)).toEqual({ 'data-id': 'a' });
		expect(cap.behavior?.('container')?.attrs?.(bond)).toEqual({ role: 'list' });
		// A role with no map entry projects nothing.
		expect(cap.behavior?.('surface')).toBeUndefined();
	});

	it('omits behavior entirely for a surface-only capability (no roles, no behavior)', () => {
		const cap = defineCapability<{ value: number }>({ slot: MODEL, surface: { value: 1 } });
		expect(cap.behavior).toBeUndefined();
		expect(cap.surface).toEqual({ value: 1 });
	});

	it('a role entry returning undefined opts that role out (conditional projection)', () => {
		const cap = defineCapability({
			slot: capabilityKey('opt'),
			roles: { label: () => undefined }
		});
		expect(cap.behavior?.('label')).toBeUndefined();
	});

	it('supports the raw behavior escape hatch for dynamic role sets', () => {
		const handled = ['container', 'trigger'];
		const cap = defineCapability({
			slot: capabilityKey('dyn'),
			behavior: (role) => (handled.includes(role) ? { attrs: () => ({ ok: role }) } : undefined)
		});
		const bond = mkBond();
		expect(cap.behavior?.('trigger')?.attrs?.(bond)).toEqual({ ok: 'trigger' });
		expect(cap.behavior?.('item')).toBeUndefined();
	});

	it('carries requires through to the built capability', () => {
		const cap = defineCapability({ slot: MODEL, requires: [DEP], roles: {} });
		expect(cap.requires).toEqual([DEP]);
	});

	it('projects through behaviorsForRole once registered on a state', () => {
		const state = new S();
		state.capability(
			defineCapability({ slot: MODEL, roles: { item: (id) => ({ attrs: () => ({ id }) }) } })
		);
		const behaviors = state.behaviorsForRole('item', 'x');
		expect(behaviors).toHaveLength(1);
		expect(behaviors[0]!.attrs?.(mkBond())).toEqual({ id: 'x' });
	});

	it('carries inert metadata into describeCapabilities()', () => {
		const state = new S();
		const cap = defineCapability({
			slot: MODEL,
			meta: {
				layer: 1,
				kind: 'policy',
				projects: ['trigger'],
				requiresRoles: ['trigger', 'content'],
				conflicts: [DEP],
				docs: 'test policy'
			}
		});

		state.capability(cap);

		expect(cap.meta?.kind).toBe('policy');
		expect(state.describeCapabilities()[0]!.meta).toEqual(cap.meta);
	});
});

describe('faceted capability helpers', () => {
	it('defines a Layer 1 model capability without projection behavior', () => {
		const cap = defineModelCapability({ slot: MODEL, surface: { value: 1 } });

		expect(cap.surface).toEqual({ value: 1 });
		expect(cap.behavior).toBeUndefined();
		expect(cap.meta).toMatchObject({ layer: 1, kind: 'model' });
	});

	it('defines a Layer 1 projection capability from a typed role map', () => {
		const cap = defineProjectionCapability({
			slot: capabilityKey('projection'),
			roles: {
				trigger: () => ({ attrs: () => ({ 'data-trigger': true }) })
			}
		});

		expect(cap.meta).toMatchObject({
			layer: 1,
			kind: 'projection',
			projects: ['trigger']
		});
		expect(cap.behavior?.('trigger')?.attrs?.(mkBond())).toEqual({ 'data-trigger': true });
	});

	it('defines relationship, policy, and effect facets with explicit intent metadata', () => {
		const relationship = defineRelationshipCapability({
			slot: capabilityKey('relationship'),
			meta: { projects: ['trigger', 'content'], requiresRoles: ['trigger', 'content'] }
		});
		const policy = definePolicyCapability({
			slot: capabilityKey('policy'),
			meta: { projects: ['trigger'] },
			behavior: (role) =>
				role === 'trigger' ? { handlers: () => ({ onclick: () => {} }) } : undefined
		});
		const effect = defineEffectCapability({
			slot: capabilityKey('effect'),
			setup: () => {},
			meta: { docs: 'installs a whole-bond listener' }
		});

		expect(relationship.meta).toMatchObject({
			layer: 1,
			kind: 'relationship',
			requiresRoles: ['trigger', 'content']
		});
		expect(policy.meta).toMatchObject({ layer: 1, kind: 'policy', projects: ['trigger'] });
		expect(policy.behavior?.('trigger')).toBeDefined();
		expect(effect.meta).toMatchObject({ layer: 1, kind: 'effect' });
		expect(effect.setup).toBeTypeOf('function');
	});

	it('labels focused capabilities and archetype bundles without changing member capabilities', () => {
		const model = defineModelCapability({ slot: MODEL, surface: { value: 2 } });
		const focused = defineFocusedCapability({
			slot: capabilityKey('focused'),
			capabilities: [model],
			meta: { docs: 'selectable collection kit' }
		});
		const archetype = defineArchetypeCapabilities([model], { docs: 'listbox recipe' });

		expect(focused.surface).toEqual([model]);
		expect(focused.meta).toMatchObject({ layer: 2, kind: 'focused' });
		expect(archetype).toHaveLength(1);
		expect(archetype[0]).toBe(model);
		expect(archetype.meta).toMatchObject({ layer: 3, kind: 'archetype' });
	});
});

describe('surface / requireCapability / requireSurface — typed access (#3/#4)', () => {
	it('surface() returns the held model, undefined when the slot is empty', () => {
		const bond = mkBond();
		expect(bond.state.surface(MODEL)).toBeUndefined();
		bond.state.capability(
			defineCapability<{ value: number }>({ slot: MODEL, surface: { value: 42 } })
		);
		expect(bond.state.surface(MODEL)).toEqual({ value: 42 });
	});

	it('requireCapability() throws (no warn) when the slot is empty', () => {
		const bond = mkBond();
		expect(() => bond.state.requireCapability(MODEL)).toThrowError(/required capability/);
	});

	it('requireSurface() returns the model, throws when slot or surface is absent', () => {
		const bond = mkBond();
		expect(() => bond.state.requireSurface(MODEL)).toThrowError(/required capability/);
		// Registered but surface-less.
		bond.state.capability(defineCapability({ slot: MODEL, roles: {} }));
		expect(() => bond.state.requireSurface(MODEL)).toThrowError(/no surface/);
	});
});

describe('explainRole — projection introspection (#7)', () => {
	it('reports each capability that contributes to a role, with resolved attrs', () => {
		const bond = mkBond();
		bond.state.capability(
			defineCapability({
				slot: capabilityKey('a'),
				meta: { layer: 1, kind: 'projection', projects: ['item'] },
				roles: { item: (id) => ({ attrs: () => ({ a: id }) }) }
			})
		);
		bond.state.capability(
			defineCapability({
				slot: capabilityKey('b'),
				roles: { item: () => ({ attrs: () => ({ b: 1 }) }) }
			})
		);
		const info = explainBondRole(bond, 'item', 'q');
		expect(info).toHaveLength(2);
		expect(info[0]!.meta).toMatchObject({ kind: 'projection', projects: ['item'] });
		expect(info[0]!.attrs).toEqual({ a: 'q' });
		expect(info[1]!.attrs).toEqual({ b: 1 });
		// A capability that doesn't handle the role is absent from the report.
		expect(explainBondRole(bond, 'surface')).toHaveLength(0);
	});
});

describe('setup guard (#5)', () => {
	it('warns when a setup-bearing capability is registered but useCapabilities was never called', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const bond = mkBond();
		// setup returns void so useCapabilities (not called here anyway) wouldn't need a component context.
		bond.state.capability(defineCapability({ slot: capabilityKey('fx'), setup: () => {} }));
		// Trigger the deferred DEV validation via a projection ('surface' is a void role — no ctx).
		new (class extends Atom {})(bond, 'probe').role('surface');
		expect(warn).toHaveBeenCalledWith(
			expect.stringContaining('useCapabilities(bond) was never called')
		);
		warn.mockRestore();
	});

	it('stays quiet once useCapabilities has marked the bond live', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const bond = mkBond();
		// Void teardown so useCapabilities does not register an onDestroy (no component here).
		const cap: Capability = defineCapability({ slot: capabilityKey('fx2'), setup: () => {} });
		bond.state.capability(cap);
		useCapabilities(bond); // marks setup consumed before any projection
		new (class extends Atom {})(bond, 'probe').role('surface');
		expect(warn).not.toHaveBeenCalledWith(
			expect.stringContaining('useCapabilities(bond) was never called')
		);
		warn.mockRestore();
	});
});

describe('deferred capability validation', () => {
	it('validates each registered capability in a multi-level requires chain', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const state = new S();
		const a = capabilityKey('requires:a');
		const b = capabilityKey('requires:b');
		const c = capabilityKey('requires:c');

		state.capability(defineCapability({ slot: a, requires: [b], roles: { item: () => ({}) } }));
		state.capability(defineCapability({ slot: b, requires: [c], roles: { item: () => ({}) } }));

		state.behaviorsForRole('item');

		expect(warn).toHaveBeenCalledTimes(1);
		expect(warn).toHaveBeenCalledWith(
			expect.stringContaining('capability "requires:b" requires slot "requires:c"')
		);
		warn.mockRestore();
	});

	it('does not re-run validation for capabilities registered after the first projection', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const state = new S();
		const ready = capabilityKey('late:ready');
		const late = capabilityKey('late:capability');
		const missing = capabilityKey('late:missing');

		state.capability(
			defineCapability({ slot: ready, roles: { item: () => ({ attrs: () => ({ ready: true }) }) } })
		);
		state.behaviorsForRole('item');

		state.capability(
			defineCapability({ slot: late, requires: [missing], roles: { item: () => ({}) } })
		);
		state.behaviorsForRole('item');

		expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('requires slot'));
		warn.mockRestore();
	});

	it('warns when capability metadata declares a conflict with a registered slot or projected role', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const state = new S();
		const primary = capabilityKey('conflict:primary');
		const competing = capabilityKey('conflict:competing');

		state.capability(
			defineCapability({
				slot: primary,
				meta: { conflicts: [competing, 'trigger'] },
				roles: { item: () => ({}) }
			})
		);
		state.capability(
			defineCapability({
				slot: competing,
				meta: { projects: ['trigger'] },
				roles: { trigger: () => ({}) }
			})
		);

		state.behaviorsForRole('item');

		expect(warn).toHaveBeenCalledWith(
			expect.stringContaining('conflicts with registered capability slot "conflict:competing"')
		);
		expect(warn).toHaveBeenCalledWith(
			expect.stringContaining('conflicts with role "trigger" projected by "conflict:competing"')
		);
		warn.mockRestore();
	});
});
