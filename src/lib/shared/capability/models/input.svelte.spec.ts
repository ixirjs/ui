import { describe, expect, it } from 'vitest';
import { createInput, inputCapability, INPUT } from './input.svelte';
import { ROVING } from './roving.svelte';

describe('inputCapability', () => {
	it('is annotated as a Layer 1 projection over the input model surface', () => {
		const model = createInput({
			query: {
				get: () => '',
				set: () => {}
			}
		});
		const cap = inputCapability(model);

		expect(cap.slot).toBe(INPUT);
		expect(cap.surface).toBe(model);
		expect(cap.requires).toEqual([ROVING]);
		expect(cap.meta).toMatchObject({
			layer: 1,
			kind: 'projection',
			projects: ['input']
		});
	});
});
