import { render } from 'svelte/server';
import { fixtures, type Fixture } from './fixtures';
import reference from './ssr-reference.json';

export function renderFixture(fixture: Fixture) {
	const output = render(fixture.component, { props: fixture.props ?? {}, idPrefix: 'parity-' });
	return { body: output.body, head: output.head };
}
/** Frozen pre-removal HTML, not a retained implementation or a self-comparison. */
export function samples() {
	return fixtures.map((fixture) => {
		const saved = reference.find((entry) => entry.name === fixture.name)!;
		return {
			name: fixture.name,
			reference: { body: saved.body, head: saved.head },
			candidate: renderFixture(fixture)
		};
	});
}
const median = (values: number[]) =>
	[...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]!;
export function timings(rounds = 7, iterations = 50) {
	return fixtures.map((fixture) => {
		for (let n = 0; n < 20; n++) renderFixture(fixture);
		const times = [];
		for (let round = 0; round < rounds; round++) {
			const start = performance.now();
			for (let n = 0; n < iterations; n++) renderFixture(fixture);
			times.push(((performance.now() - start) * 1000) / iterations);
		}
		return { name: fixture.name, microseconds: median(times) };
	});
}
