import { describe, expect, it } from 'vitest';
import { mount, unmount } from 'svelte';
import BondConstruct, {
	type ConstructSubject
} from '$ixirjs/ui/test/perf/bond-construct.test.svelte';

/**
 * Phase A1 of the on-demand-init study: what one Bond costs to construct.
 *
 * Construction is where Population A lives — the stateful models (`createDisclosure`,
 * `createSelection`, `createInput`) built as field initializers, plus one ~0.63 µs frozen descriptor
 * per `this.capability(...)`. `card` is the floor: one deferred capability, no models.
 *
 * Same methodology as the activation bench: interleave subjects within every round, floor each
 * endpoint across rounds, take the slope between two instance counts.
 */

const LOW = 50;
const HIGH = 400;
const ROUNDS = 25;
const WARMUP = 5;
const SUBJECTS: ConstructSubject[] = [
	'card',
	'collapsible',
	'menu',
	'tree',
	'select',
	'select-input-only',
	'dialog'
];

const debug = console.debug;

function sample(subject: ConstructSubject, n: number): number {
	const target = document.createElement('div');
	document.body.appendChild(target);
	console.debug = () => undefined;
	let elapsed: number;
	try {
		const component = mount(BondConstruct, { target, props: { subject, n } });
		elapsed = component.elapsed;
		component.teardown();
		void unmount(component);
	} finally {
		console.debug = debug;
	}
	target.remove();
	return elapsed;
}

describe('Bond construction cost by family', () => {
	it('prices one Bond construction per family', () => {
		const floor = new Map<string, number>();
		for (let round = 0; round < ROUNDS; round++) {
			for (const n of [LOW, HIGH]) {
				for (const subject of SUBJECTS) {
					const ms = sample(subject, n);
					if (round < WARMUP) continue;
					const key = `${subject}:${n}`;
					floor.set(key, Math.min(floor.get(key) ?? Infinity, ms));
				}
			}
		}

		const micros = (subject: ConstructSubject) =>
			((floor.get(`${subject}:${HIGH}`)! - floor.get(`${subject}:${LOW}`)!) * 1000) / (HIGH - LOW);

		const card = micros('card');
		console.log('subject          µs/bond   over card');
		for (const subject of SUBJECTS) {
			const value = micros(subject);
			console.log(
				`${subject.padEnd(16)} ${value.toFixed(2).padStart(7)}   ${(value - card)
					.toFixed(2)
					.padStart(9)}`
			);
		}

		// Card is the floor: one deferred capability, no stateful model.
		expect(card).toBeLessThan(micros('dialog'));
	});
});
