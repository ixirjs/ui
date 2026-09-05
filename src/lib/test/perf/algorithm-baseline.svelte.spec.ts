import { assertButtons } from './vs-shadcn/parity';
import { describe, expect, it } from 'vitest';
import { createSelection, createRovingFocus } from '$ixirjs/ui/capability';
import { AccordionBond } from '$ixirjs/ui/components/accordion/bond.svelte';

// Selection is linear after M2; roving shares pre-write reads after M4.
// Count work, not wall time; restore instrumentation before any assertion or effect flush.
describe('algorithm work ceilings', () => {
	it('pins bulk selection work and preserves ordering/duplicates', () => {
		const records = [];
		for (const n of [100, 200, 400]) {
			let values: number[] = [];
			const selection = createSelection({
				get: () => values,
				set: (next) => {
					values = next;
				},
				mode: () => 'multiple'
			});
			const incoming = Array.from({ length: n }, (_, i) => i);
			let comparisons = 0;
			let lookups = 0;
			const originalHas = Set.prototype.has;
			const original = Array.prototype.some;
			try {
				Set.prototype.has = function (value) {
					lookups++;
					return originalHas.call(this, value);
				};
				Array.prototype.some = function (callback, receiver) {
					return original.call(this, (value, index, array) => {
						comparisons++;
						return callback.call(receiver, value, index, array);
					});
				};
				selection.select(incoming);
				selection.deselect(incoming.slice(0, n / 2));
			} finally {
				Array.prototype.some = original;
				Set.prototype.has = originalHas;
			}
			records.push({ n, comparisons });
			expect(values).toEqual(incoming.slice(n / 2));
			expect(comparisons).toBe(0);
			expect(lookups).toBeGreaterThan(0);
			expect(lookups).toBeLessThanOrEqual(2 * n);
			values = [...incoming];
			selection.select([0, n]);
			expect(values).toEqual([...incoming, n]);
			selection.deselect([0, n]);
			expect(values).toEqual(incoming.slice(1));
		}
		expect(records).toHaveLength(3);
	});
	it('bounds Accordion bulk membership work without indexing live predicates', () => {
		for (const n of [100, 200, 400]) {
			const props = { values: [] as string[], multiple: true };
			const bond = new AccordionBond(props);
			bond.bindCommit((next) => {
				props.values = next;
			});
			const ids = Array.from({ length: n }, (_, i) => `v${i}`);
			let work = 0;
			const includes = Array.prototype.includes;
			const has = Set.prototype.has;
			try {
				Array.prototype.includes = function (value, from) {
					work += this.length;
					return includes.call(this, value, from);
				};
				Set.prototype.has = function (value) {
					work++;
					return has.call(this, value);
				};
				bond.open(ids);
				bond.close(ids.slice(0, n / 2));
			} finally {
				Array.prototype.includes = includes;
				Set.prototype.has = has;
			}
			expect(props.values).toEqual(ids.slice(n / 2));
			expect(work).toBeGreaterThan(0);
			expect(work).toBeLessThanOrEqual(2 * n);
		}
	});
	it('caps repeated complete-list reads for one navigation request', () => {
		let reads = 0;
		const roving = createRovingFocus({
			ids: () => {
				reads++;
				return ['a', 'b', 'c'];
			}
		});
		roving.goto('a');
		reads = 0;
		expect(roving.next()).toBe('b');
		expect(reads).toBe(2);
	});
});

describe('button parity assertion guard', () => {
	it('rejects missing output, wrong semantics and missing updates', () => {
		const target = document.createElement('div');
		expect(() => assertButtons(target, 1)).toThrow();
		target.innerHTML = '<button type="button">Press 0</button><button type="button">Probe</button>';
		expect(() => assertButtons(target, 1)).not.toThrow();
		expect(() => assertButtons(target, 1, 'changed')).toThrow();
		target.querySelector('button')!.disabled = true;
		expect(() => assertButtons(target, 1)).toThrow();
	});
});
