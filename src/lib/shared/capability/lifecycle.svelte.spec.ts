import { describe, expect, it, vi } from 'vitest';
import { Bond, defineCapability, capabilityKey, type BondStateProps } from '$ixirjs/ui/shared/bond';

class S extends Bond<BondStateProps> {
	constructor() {
		super({});
	}
}

class TestBond extends Bond {
	constructor(readonly state = new S()) {
		super({}, 'capability-use-test');
	}
}

describe('capability lifecycle', () => {
	it('runs setup in registration order and teardown in LIFO order', () => {
		const events: string[] = [];
		const bond = new TestBond();

		bond.capability(
			defineCapability({
				slot: capabilityKey('first'),
				setup: () => {
					events.push('setup:first');
					return () => events.push('teardown:first');
				}
			})
		);
		bond.capability(
			defineCapability({
				slot: capabilityKey('second'),
				setup: () => {
					events.push('setup:second');
					return () => events.push('teardown:second');
				}
			})
		);

		bond.activateCapabilities(bond);

		expect(events).toEqual(['setup:first', 'setup:second']);

		bond.destroy();

		expect(events).toEqual(['setup:first', 'setup:second', 'teardown:second', 'teardown:first']);
	});

	it('rejects a second root activation for the same bond', () => {
		const bond = new TestBond();
		bond.capability(defineCapability({ slot: capabilityKey('once'), setup: () => {} }));

		bond.activateCapabilities(bond);
		expect(() => bond.activateCapabilities(bond)).toThrow('exactly one lifecycle owner');
		bond.destroy();
	});

	it('runs required effects before dependants regardless of registration order', () => {
		const events: string[] = [];
		const dependency = capabilityKey('dependency');
		const dependant = capabilityKey('dependant');
		const bond = new TestBond();
		bond.capability(
			defineCapability({
				slot: dependant,
				requires: [dependency],
				setup: () => {
					events.push('dependant');
				}
			})
		);
		bond.capability(
			defineCapability({
				slot: dependency,
				setup: () => {
					events.push('dependency');
				}
			})
		);

		bond.activateCapabilities(bond);
		expect(events).toEqual(['dependency', 'dependant']);
		bond.destroy();
	});

	it('normalizes Disposable setup returns into teardown callbacks', () => {
		const events: string[] = [];
		const bond = new TestBond();

		bond.capability(
			defineCapability({
				slot: capabilityKey('disposable'),
				setup: () => ({
					[Symbol.dispose]: () => events.push('dispose')
				})
			})
		);

		bond.activateCapabilities(bond);

		expect(events).toEqual([]);

		bond.destroy();

		expect(events).toEqual(['dispose']);
	});

	it('continues LIFO teardown and reports every failure as AggregateError', () => {
		const events: string[] = [];
		const bond = new TestBond();

		for (const name of ['first', 'throws', 'last']) {
			bond.capability(
				defineCapability({
					slot: capabilityKey(`teardown:${name}`),
					setup: () => () => {
						events.push(`teardown:${name}`);
						if (name === 'throws') throw new Error('teardown failed');
					}
				})
			);
		}

		bond.activateCapabilities(bond);
		expect(() => bond.destroy()).toThrow(AggregateError);
		expect(events).toEqual(['teardown:last', 'teardown:throws', 'teardown:first']);
	});

	it('rejects missing requirements before any setup runs', () => {
		const setup = vi.fn();
		const bond = new TestBond();
		bond.capability(
			defineCapability({
				slot: capabilityKey('missing:owner'),
				requires: [capabilityKey('missing:dependency')],
				setup
			})
		);

		expect(() => bond.activateCapabilities(bond)).toThrow('which is not registered');
		expect(setup).not.toHaveBeenCalled();
	});

	/**
	 * Registration order that is already topological skips the sort entirely (see
	 * `#isRegistrationOrderTopological`). These pin what that shortcut has to keep true: it is the
	 * order every bonded family with a relationship actually takes, so nothing else exercises it.
	 */
	it('keeps registration order when requirements are declared before their dependants', () => {
		const events: string[] = [];
		const model = capabilityKey('inorder:model');
		const link = capabilityKey('inorder:link');
		const bond = new TestBond();

		// A diamond, not a chain: two independent dependants, so an order-losing shortcut shows up.
		bond.capability(defineCapability({ slot: model, setup: () => void events.push('model') }));
		bond.capability(
			defineCapability({ slot: link, requires: [model], setup: () => void events.push('link') })
		);
		bond.capability(
			defineCapability({
				slot: capabilityKey('inorder:trigger'),
				requires: [model, link],
				setup: () => void events.push('trigger')
			})
		);

		bond.activateCapabilities(bond);
		expect(events).toEqual(['model', 'link', 'trigger']);
		bond.destroy();
	});

	it('rejects a capability that requires itself', () => {
		const setup = vi.fn();
		const own = capabilityKey('self:required');
		const bond = new TestBond();
		bond.capability(defineCapability({ slot: own, requires: [own], setup }));

		expect(() => bond.activateCapabilities(bond)).toThrow('dependency cycle');
		expect(setup).not.toHaveBeenCalled();
	});

	it('rejects cycles before any setup runs', () => {
		const setup = vi.fn();
		const first = capabilityKey('cycle:first');
		const second = capabilityKey('cycle:second');
		const bond = new TestBond();
		bond.capability(defineCapability({ slot: first, requires: [second], setup }));
		bond.capability(defineCapability({ slot: second, requires: [first], setup }));

		expect(() => bond.activateCapabilities(bond)).toThrow('dependency cycle');
		expect(setup).not.toHaveBeenCalled();
	});

	it('keeps declaration order for dependency-unconstrained setups', () => {
		const events: string[] = [];
		const dependency = capabilityKey('stable:dependency');
		const dependant = capabilityKey('stable:dependant');
		const bond = new TestBond();
		bond.capability(
			defineCapability({
				slot: dependant,
				requires: [dependency],
				setup: () => {
					events.push('dependant');
				}
			})
		);
		bond.capability(
			defineCapability({
				slot: capabilityKey('stable:middle'),
				setup: () => {
					events.push('middle');
				}
			})
		);
		bond.capability(
			defineCapability({
				slot: dependency,
				setup: () => {
					events.push('dependency');
				}
			})
		);

		bond.activateCapabilities(bond);
		expect(events).toEqual(['middle', 'dependency', 'dependant']);
		bond.destroy();
	});

	it('rejects reentrant activation as a second lifecycle owner', () => {
		const bond = new TestBond();
		bond.capability(
			defineCapability({
				slot: capabilityKey('reentrant'),
				setup: () => bond.activateCapabilities(bond)
			})
		);

		expect(() => bond.activateCapabilities(bond)).toThrow('exactly one lifecycle owner');
	});

	it('becomes non-retryable when transactional rollback fails', () => {
		const bond = new TestBond();
		bond.capability(
			defineCapability({
				slot: capabilityKey('rollback:cleanup'),
				setup: () => () => {
					throw new Error('cleanup failed');
				}
			})
		);
		bond.capability(
			defineCapability({
				slot: capabilityKey('rollback:setup'),
				setup: () => {
					throw new Error('setup failed');
				}
			})
		);

		expect(() => bond.activateCapabilities(bond)).toThrow(AggregateError);
		expect(() => bond.activateCapabilities(bond)).toThrow('disposed');
	});

	it('unwinds earlier setups when a later setup throws', () => {
		const events: string[] = [];
		const bond = new TestBond();

		bond.capability(
			defineCapability({
				slot: capabilityKey('first-failing-chain'),
				setup: () => {
					events.push('setup:first');
					return () => events.push('teardown:first');
				}
			})
		);
		bond.capability(
			defineCapability({
				slot: capabilityKey('throws'),
				setup: () => {
					events.push('setup:throws');
					throw new Error('boom');
				}
			})
		);

		expect(() => bond.activateCapabilities(bond)).toThrow('boom');
		expect(events).toEqual(['setup:first', 'setup:throws', 'teardown:first']);
	});
});

describe('inactive-lifecycle diagnostic', () => {
	class Deferred extends Bond<BondStateProps> {
		constructor() {
			super({}, 'deferred');
			this.capability(defineCapability({ slot: capabilityKey('fx'), setup: () => {} }));
		}
	}

	// bindBond activates inside its own constructor, so a Bond that projects a role while still
	// constructing asks the lifecycle question before the answer exists.
	it('does not report an inactive lifecycle when a role is projected before activation', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const bond = new Deferred();

		bond.behaviorsForRole('trigger');
		bond.activateCapabilities(bond);
		await Promise.resolve();

		expect(warn.mock.calls.flat().join('\n')).not.toContain('lifecycle was never activated');
		warn.mockRestore();
	});

	it('still reports a Bond whose lifecycle is never activated', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const bond = new Deferred();

		bond.behaviorsForRole('trigger');
		await Promise.resolve();

		expect(warn).toHaveBeenCalledWith(expect.stringContaining('lifecycle was never activated'));
		warn.mockRestore();
	});
});
