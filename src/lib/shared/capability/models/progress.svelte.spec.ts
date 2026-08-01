import { describe, expect, it } from 'vitest';
import { Bond, Atom, bondContextKey, type BondStateProps } from '$ixirjs/ui/shared/bond';
import { createProgressValue, progressValueCapability, PROGRESS_VALUE } from './progress.svelte';

class TestState {
	value = $state<number | null>(25);
	min = $state(0);
	max = $state(100);
}

class TestBond extends Bond<BondStateProps> {
	static CONTEXT_KEY = bondContextKey('test-progress');
	constructor(readonly state = new TestState()) {
		super({}, 'test');
	}
	addAtom(key: string, role: string) {
		const atom = new TestAtom(this, key).role(role);
		this.register(atom, { key });
		return atom;
	}
}

class TestAtom extends Atom<TestBond> {
	constructor(bond: TestBond, key: string) {
		super(bond, key);
	}
}

describe('progressValueCapability', () => {
	it('exposes determinate progress and projects progressbar attrs', () => {
		const state = new TestState();
		const progress = createProgressValue({
			value: () => state.value,
			min: () => state.min,
			max: () => state.max
		});
		const cap = progressValueCapability(progress);
		const bond = new TestBond(state);
		bond.capability(cap);
		const bar = bond.addAtom('bar', 'progressbar');

		expect(cap.slot).toBe(PROGRESS_VALUE);
		expect(cap.surface).toBe(progress);
		expect(cap.meta).toMatchObject({
			projects: ['progressbar']
		});
		expect(progress.percent).toBe(25);
		expect(bar.spread.role).toBe('progressbar');
		expect(bar.spread['aria-valuemin']).toBe(0);
		expect(bar.spread['aria-valuemax']).toBe(100);
		expect(bar.spread['aria-valuenow']).toBe(25);
		expect(bar.spread['aria-valuetext']).toBe('25%');
		expect(bar.spread['data-completed']).toBeUndefined();

		state.value = 125;
		expect(progress.value).toBe(100);
		expect(progress.percent).toBe(100);
		expect(progress.isCompleted).toBe(true);
		expect(bar.spread['aria-valuenow']).toBe(100);
		expect(bar.spread['data-percent']).toBe(100);
		expect(bar.spread['data-completed']).toBe('');

		state.value = Number.NaN;
		expect(progress.isIndeterminate).toBe(true);
		expect(bar.spread['aria-valuenow']).toBeUndefined();

		state.min = 100;
		state.max = 0;
		state.value = 25;
		expect(progress.min).toBe(0);
		expect(progress.max).toBe(100);
		expect(progress.value).toBe(25);
	});

	it('omits current value attrs for indeterminate progress', () => {
		const state = new TestState();
		state.value = null;
		const progress = createProgressValue({
			value: () => state.value,
			max: () => state.max
		});
		const bond = new TestBond(state);
		bond.capability(progressValueCapability(progress));
		const bar = bond.addAtom('bar', 'progressbar');

		expect(progress.isIndeterminate).toBe(true);
		expect(progress.percent).toBeNull();
		expect(bar.spread['aria-valuenow']).toBeUndefined();
		expect(bar.spread['aria-valuetext']).toBeUndefined();
		expect(bar.spread['data-indeterminate']).toBe('');
	});
});
