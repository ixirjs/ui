import { describe, expect, it } from 'vitest';
import { samples } from './ssr';

describe('complete shared-renderer SSR parity', () => {
	it('preserves exact HTML, head, IDs, attributes and hydration markers for all eight families', () => {
		const rendered = samples();
		expect(rendered).toHaveLength(8);
		for (const sample of rendered) {
			expect(sample.candidate, sample.name).toEqual(sample.reference);
			expect(sample.candidate.body, sample.name).toContain('aria-');
		}
	});
});
