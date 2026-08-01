import { describe, it, expect, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import {
	Bond,
	BondState,
	sharedCapabilityKey,
	type Behavior,
	type Capability,
	type BondStateProps
} from './index';
import Comp, { tally, resetTally } from './probe.svelte';

// Regression for the spread attachment-key churn: Atom.spread must NOT re-mint attachment keys
// on each access, or Svelte tears down and re-runs every onmount on every reactive update that
// re-reads spread. We probe via a capability that projects an onmount onto role 'item'.
const SLOT = sharedCapabilityKey('@svelte-atoms/test:mount-probe');

function probeCapability(): Capability {
	return {
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
	};
}

class ProbeState extends BondState<BondStateProps> {
	constructor() {
		super({});
	}
}

class ProbeBond extends Bond {
	constructor(state: ProbeState) {
		super(state, 'probe');
		this.state.capability(probeCapability());
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
