import { describe, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import { createDisclosure, type DisclosureBacking } from './disclosure.svelte';

// Reactive boolean store standing in for a bond's bindable `props.open`.
function makeBacking(initial = false) {
	let open = $state(initial);
	const backing: DisclosureBacking = {
		get: () => open,
		set: (v) => (open = v)
	};
	return { backing, read: () => open };
}

describe('Disclosure — degenerate SelectionModel over {self}', () => {
	it('starts from the backing value', () => {
		expect(createDisclosure(makeBacking(false).backing).isOpen).toBe(false);
		expect(createDisclosure(makeBacking(true).backing).isOpen).toBe(true);
	});

	it('open / close set the boolean backing', () => {
		const { backing, read } = makeBacking(false);
		const d = createDisclosure(backing);
		d.open();
		expect(read()).toBe(true);
		expect(d.isOpen).toBe(true);
		d.close();
		expect(read()).toBe(false);
		expect(d.isOpen).toBe(false);
	});

	it('toggle flips both directions', () => {
		const { backing } = makeBacking(false);
		const d = createDisclosure(backing);
		d.toggle();
		expect(d.isOpen).toBe(true);
		d.toggle();
		expect(d.isOpen).toBe(false);
	});

	it('open is idempotent, close is idempotent', () => {
		const { backing, read } = makeBacking(false);
		const d = createDisclosure(backing);
		d.open();
		d.open();
		expect(read()).toBe(true);
		d.close();
		d.close();
		expect(read()).toBe(false);
	});

	it('isOpen is reactive', () => {
		const { backing } = makeBacking(false);
		const d = createDisclosure(backing);
		let count = 0;
		const dispose = $effect.root(() => {
			$effect(() => {
				void d.isOpen;
				count++;
			});
		});
		flushSync();
		const initial = count;
		d.open();
		flushSync();
		expect(count).toBeGreaterThan(initial);
		dispose();
	});
});
