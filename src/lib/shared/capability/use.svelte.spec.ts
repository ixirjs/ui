import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { Bond, BondState, defineCapability, capabilityKey, type BondStateProps } from '../bond';
import UseProbe from './use-probe.svelte';

class S extends BondState<BondStateProps> {
	constructor() {
		super({});
	}
}

class TestBond extends Bond {
	constructor(state: BondState = new S()) {
		super(state, 'capability-use-test');
	}
}

describe('useCapabilities', () => {
	it('runs setup in registration order and teardown in LIFO order', () => {
		const events: string[] = [];
		const bond = new TestBond();

		bond.state.capability(
			defineCapability({
				slot: capabilityKey('first'),
				setup: () => {
					events.push('setup:first');
					return () => events.push('teardown:first');
				}
			})
		);
		bond.state.capability(
			defineCapability({
				slot: capabilityKey('second'),
				setup: () => {
					events.push('setup:second');
					return () => events.push('teardown:second');
				}
			})
		);

		const { unmount } = render(UseProbe, { bond });

		expect(events).toEqual(['setup:first', 'setup:second']);

		unmount();

		expect(events).toEqual(['setup:first', 'setup:second', 'teardown:second', 'teardown:first']);
	});

	it('normalizes Disposable setup returns into teardown callbacks', () => {
		const events: string[] = [];
		const bond = new TestBond();

		bond.state.capability(
			defineCapability({
				slot: capabilityKey('disposable'),
				setup: () => ({
					[Symbol.dispose]: () => events.push('dispose')
				})
			})
		);

		const { unmount } = render(UseProbe, { bond });

		expect(events).toEqual([]);

		unmount();

		expect(events).toEqual(['dispose']);
	});

	it('unwinds earlier setups when a later setup throws', () => {
		const events: string[] = [];
		const bond = new TestBond();

		bond.state.capability(
			defineCapability({
				slot: capabilityKey('first-failing-chain'),
				setup: () => {
					events.push('setup:first');
					return () => events.push('teardown:first');
				}
			})
		);
		bond.state.capability(
			defineCapability({
				slot: capabilityKey('throws'),
				setup: () => {
					events.push('setup:throws');
					throw new Error('boom');
				}
			})
		);

		expect(() => render(UseProbe, { bond })).toThrow('boom');
		expect(events).toEqual(['setup:first', 'setup:throws', 'teardown:first']);
	});
});
