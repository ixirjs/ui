import { describe, expect, it, vi } from 'vitest';
import { Atom } from './atom.svelte';
import { Bond } from './bond.svelte';
import { NodeRegistry, type LazyNodePlan } from './node-registry.svelte';
import { labelledControl } from '$ixirjs/ui/shared/capability/models/relationship.svelte';

class ProbeBond extends Bond {
	constructor() {
		super({ id: 'owner' }, 'probe');
		this.capability(labelledControl());
	}
}

describe('NodeRegistry', () => {
	it('registers unique parts through the exact-part index', () => {
		const registry = new NodeRegistry(() => 'probe');

		for (let index = 0; index < 32; index++) {
			registry.register(new Atom(undefined, `part-${index}`));
		}

		const materializeParts = vi.spyOn(registry, 'nodesByPart');
		expect(registry.nodeByPart('part-31')?.name).toBe('part-31');
		expect(materializeParts).not.toHaveBeenCalled();
		expect(registry.values()).toHaveLength(32);
	});

	it('preserves single/many cardinality and pending registration order', () => {
		const registry = new NodeRegistry(() => 'probe');
		const first = new Atom(undefined, 'item');
		const second = new Atom(undefined, 'item');
		const disposeFirst = registry.register(first, { cardinality: 'many' });
		registry.register(second, { cardinality: 'many' });

		expect(registry.nodesByPart('item')).toEqual([first, second]);
		expect(() => registry.register(new Atom(undefined, 'item'))).toThrow('multiple nodes');

		disposeFirst();
		expect(registry.nodesByPart('item')).toEqual([second]);
	});

	it('keeps role lookup deterministic and teardown idempotent', () => {
		const registry = new NodeRegistry(() => 'probe');
		const first = new Atom(undefined, 'first').role('trigger');
		const second = new Atom(undefined, 'second').role('trigger');
		const dispose = registry.register(first);
		registry.register(second);

		const materializeRoles = vi.spyOn(registry, 'nodesByRole');
		expect(registry.nodeByRole('trigger')).toBe(first);
		expect(materializeRoles).not.toHaveBeenCalled();
		expect(registry.nodesByRole('trigger')).toEqual([first, second]);
		dispose();
		dispose();
		expect(registry.nodesByRole('trigger')).toEqual([second]);
	});

	it('keeps lazy ids and elements observable without constructing the Atom', () => {
		const registry = new NodeRegistry(() => 'probe');
		const bond = new ProbeBond();
		const create = vi.fn((owner: Bond) => new Atom(owner, 'title').role('label'));
		const plan: LazyNodePlan = {
			key: 'title',
			cardinality: 'single',
			roles: ['label'],
			id: () => 'probe-title-owner',
			create
		};
		const descriptor = registry.registerLazy(plan, bond);
		const element = {} as Element;
		descriptor.mount(element);

		expect(registry.idByRole('label')).toBe('probe-title-owner');
		expect(registry.elementValues()).toEqual([{ key: 'title', element }]);
		expect(create).not.toHaveBeenCalled();

		const atom = registry.nodeByRole('label');
		expect(atom).toBeInstanceOf(Atom);
		expect(registry.nodeByPart('title')).toBe(atom);
		expect(create).toHaveBeenCalledOnce();
	});

	it('uses roles discovered when a lazy Atom materializes', () => {
		const registry = new NodeRegistry(() => 'probe');
		const bond = new ProbeBond();
		const descriptor = registry.registerLazy(
			{
				key: 'body',
				cardinality: 'single',
				roles: ['content'],
				id: () => 'probe-body-owner',
				create: () => new Atom(undefined, 'body').role('content').role('treegroup')
			},
			bond
		);
		const atom = descriptor.materialize();

		expect(registry.nodeByRole('treegroup')).toBe(atom);
		expect(registry.nodesByRole('treegroup')).toEqual([atom]);
		expect(registry.idByRole('treegroup')).toBe(atom.id);
	});

	it('enforces cardinality across eager and lazy registrations', () => {
		const registry = new NodeRegistry(() => 'probe');
		const bond = new ProbeBond();
		const plan: LazyNodePlan = {
			key: 'title',
			cardinality: 'single',
			roles: [],
			id: () => 'probe-title-owner',
			create: (owner) => new Atom(owner, 'title')
		};
		const descriptor = registry.registerLazy(plan, bond);
		expect(() => registry.register(new Atom(bond, 'title'))).toThrow('multiple nodes');
		registry.unregisterLazy(descriptor);
		expect(() => registry.register(new Atom(bond, 'title'))).not.toThrow();
	});

	it('preserves mixed eager/lazy insertion order and unregisters by materialized Atom', () => {
		const registry = new NodeRegistry(() => 'probe');
		const bond = new ProbeBond();
		const first = new Atom(bond, 'item');
		registry.register(first, { cardinality: 'many' });
		const descriptor = registry.registerLazy(
			{
				key: 'item',
				cardinality: 'many',
				roles: [],
				id: () => 'probe-item-owner',
				create: (owner) => new Atom(owner, 'item')
			},
			bond
		);
		const last = new Atom(bond, 'item');
		registry.register(last, { cardinality: 'many' });

		const lazy = descriptor.materialize();
		expect(registry.nodesByPart('item')).toEqual([first, lazy, last]);
		registry.unregister(lazy);
		expect(registry.nodesByPart('item')).toEqual([first, last]);
	});
});
