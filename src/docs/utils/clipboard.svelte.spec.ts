import { describe, expect, test, vi } from 'vitest';
import { createCopier } from './clipboard.svelte';

describe('createCopier', () => {
	test('is idle before any copy, flashes the copied key, then resets', async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		vi.stubGlobal('navigator', { clipboard: { writeText } });
		vi.useFakeTimers();

		const copier = createCopier(1000);

		// The regression this guards: the default key is '', so an ''-valued idle sentinel would
		// report every single-button copier as already copied on first render.
		expect(copier.label()).toBe('Copy');
		expect(copier.label('md', 'Copy as Markdown')).toBe('Copy as Markdown');

		await copier.run('hello');
		expect(writeText).toHaveBeenCalledWith('hello');
		expect(copier.label()).toBe('Copied');
		expect(copier.label('md')).toBe('Copy');

		vi.advanceTimersByTime(1000);
		expect(copier.label()).toBe('Copy');

		vi.useRealTimers();
		vi.unstubAllGlobals();
	});
});
