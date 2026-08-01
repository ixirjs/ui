import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TextareaPresetProbe from '$ixirjs/ui/test/components/textarea/textarea-preset.test.svelte';

describe('textarea presentation seam', () => {
	it('applies preset classes and attrs without leaking the sentinel', () => {
		render(TextareaPresetProbe);

		const textarea = document.querySelector<HTMLTextAreaElement>('[data-testid="textarea"]');
		expect(textarea).toHaveAttribute('data-theme', 'textarea');
		expect(textarea?.className).toContain('textarea-theme');
		expect(textarea?.className).not.toContain('$preset');
		expect(textarea).not.toHaveAttribute('preset');
	});
});
