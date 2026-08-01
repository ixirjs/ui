import { describe, expect, it, vi } from 'vitest';
import { Atom } from './atom.svelte';
import { NodeRegistry } from './node-registry.svelte';

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
});
