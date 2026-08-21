import { describe, expect, it } from 'vitest';
import { mount, unmount } from 'svelte';
import OverlayActivation, {
	type ActivationArm
} from '$ixirjs/ui/test/perf/overlay-activation.test.svelte';

/**
 * Phase A2 of the on-demand-init study: prices `activateCapabilities()` for a *closed* Dialog.
 *
 * Three arms over the same Bond, atoms and context:
 *   construct — Bond only, no activation
 *   activate  — today's behaviour: `$effect.root` + focus / body-scroll-lock / inert-siblings / escape
 *   stripped  — the same four slots replaced by setup-free stand-ins, i.e. the floor a perfect
 *               deferral could reach for an overlay that is never opened
 *
 * `activate - stripped` is therefore the ceiling on Phase B's win, measured without implementing it.
 *
 * House methodology: interleave arms within every round, floor each endpoint across rounds, take the
 * slope between two instance counts so fixed per-round cost cancels.
 */

const LOW = 50;
const HIGH = 400;
const ROUNDS = 25;
const WARMUP = 5;
const ARMS: ActivationArm[] = ['construct', 'activate', 'stripped'];

// The `stripped` arm replaces four slots per Bond, and each replacement emits a DEV last-wins
// `console.debug` (host.ts:117). Vitest's browser provider forwards console traffic to the node
// process, which costs ~310 µs/dialog — two orders above the signal being measured.
const debug = console.debug;

function sample(arm: ActivationArm, n: number): number {
	const target = document.createElement('div');
	document.body.appendChild(target);
	console.debug = () => undefined;
	let elapsed: number;
	try {
		const component = mount(OverlayActivation, { target, props: { arm, n } });
		elapsed = component.elapsed;
		component.teardown();
		void unmount(component);
	} finally {
		console.debug = debug;
	}
	target.remove();
	return elapsed;
}

function microsPerInstance(floor: Map<string, number>, arm: ActivationArm): number {
	return ((floor.get(`${arm}:${HIGH}`)! - floor.get(`${arm}:${LOW}`)!) * 1000) / (HIGH - LOW);
}

describe('closed-overlay capability activation cost', () => {
	it('prices what a never-opened Dialog pays for its lifecycle', () => {
		const floor = new Map<string, number>();
		for (let round = 0; round < ROUNDS; round++) {
			for (const n of [LOW, HIGH]) {
				for (const arm of ARMS) {
					const ms = sample(arm, n);
					if (round < WARMUP) continue;
					const key = `${arm}:${n}`;
					floor.set(key, Math.min(floor.get(key) ?? Infinity, ms));
				}
			}
		}

		const construct = microsPerInstance(floor, 'construct');
		const activate = microsPerInstance(floor, 'activate');
		const stripped = microsPerInstance(floor, 'stripped');

		console.log('arm         µs/closed dialog');
		console.log(`construct   ${construct.toFixed(2).padStart(16)}`);
		console.log(`activate    ${activate.toFixed(2).padStart(16)}`);
		console.log(`stripped    ${stripped.toFixed(2).padStart(16)}`);
		console.log(`--> activation costs ${(activate - construct).toFixed(2)} µs/dialog`);
		console.log(`--> Phase B ceiling  ${(activate - stripped).toFixed(2)} µs/dialog`);

		// Activation is not free for a closed overlay — the premise Phase B rests on.
		expect(activate).toBeGreaterThan(construct);
	});
});
