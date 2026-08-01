import { describe, it, expect, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import {
	Bond,
	sharedCapabilityKey,
	defineCapability,
	type Behavior,
	type Capability
} from './index';
import Comp, { tally, resetTally } from '$ixirjs/ui/test/shared/bond/probe.test.svelte';

// Regression for the spread attachment-key churn: Atom.spread must NOT re-mint attachment keys
// on each access, or Svelte tears down and re-runs every onmount on every reactive update that
// re-reads spread. We probe via a capability that projects an onmount onto role 'item'.
const SLOT = sharedCapabilityKey({ owner: '@ixirjs/test', name: 'mount-probe', version: 1 });

function probeCapability(): Capability {
	return defineCapability({
		slot: SLOT,
		behavior(role): Behavior | undefined {
			if (role !== 'item') return undefined;
			return {
				onmount: () => {
					tally.mount++;
					return () => {
						tally.cleanup++;
					};
				}
			};
		}
	});
}

class ProbeState {}

class ProbeBond extends Bond {
	constructor(readonly state: ProbeState) {
		super({}, 'probe');
		this.capability(probeCapability());
	}
}

describe('Atom.spread attachment stability', () => {
	beforeEach(resetTally);

	it('runs the atom onmount once across re-derived spread (no remount churn)', async () => {
		const bond = new ProbeBond(new ProbeState());
		const { rerender } = render(Comp, { bond, tick: 0 });

		expect(tally.mount).toBe(1);
		expect(tally.cleanup).toBe(0);

		await rerender({ bond, tick: 1 });
		await rerender({ bond, tick: 2 });
		await rerender({ bond, tick: 3 });

		// Stable attachment key + closure → Svelte keeps the one attachment: no teardown, no re-run.
		expect(tally.mount).toBe(1);
		expect(tally.cleanup).toBe(0);
	});
});
