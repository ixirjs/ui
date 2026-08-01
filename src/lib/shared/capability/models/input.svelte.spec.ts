import { describe, expect, it, vi } from 'vitest';
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
			projects: ['input']
		});
	});

	it('uses own field keys and prevents disabled input writes', () => {
		const set = vi.fn();
		const model = createInput({
			query: { get: () => '', set }
		});
		const cap = inputCapability(model, { disabled: () => true });
		const project = cap.behavior;
		expect(project).toBeDefined();
		const behavior = project!('input', 'query')!;
		const bond = {
			requireSurface: () => ({ activeId: null }),
			nodeByRole: () => undefined
		};

		expect(model.get('toString')).toBe('');
		expect(behavior.attrs?.(bond as never)).toMatchObject({
			'aria-disabled': true,
			disabled: true,
			tabindex: -1
		});
		(behavior.handlers?.(bond as never).oninput as (event: Event) => void)({
			currentTarget: { value: 'ignored' }
		} as unknown as Event);
		expect(set).not.toHaveBeenCalled();
	});
});
