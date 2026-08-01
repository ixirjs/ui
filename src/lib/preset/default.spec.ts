import { describe, expect, it } from 'vitest';
import { defaultPreset } from './default';
import { BUILT_IN_PRESET_KEYS } from './manifest';

describe('defaultPreset', () => {
	it('provides an entry for every shipped preset slot', () => {
		expect(Object.keys(defaultPreset).sort()).toEqual([...BUILT_IN_PRESET_KEYS]);

		for (const key of BUILT_IN_PRESET_KEYS) {
			expect(defaultPreset[key]).toBeTypeOf('function');
		}
	});

	it('composes reusable visual policy into common interactive entries', () => {
		expect(defaultPreset.button({ bond: undefined })).toMatchObject({
			defaults: { variant: 'primary' },
			variants: { variant: expect.any(Object) }
		});
		expect(defaultPreset['dialog.content']({ bond: undefined })).toMatchObject({
			class: expect.arrayContaining([
				'rounded-md border border-border bg-popover text-popover-foreground shadow-lg'
			])
		});
	});
});
