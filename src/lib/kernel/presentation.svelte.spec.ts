import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PresentationProbe from '$ixirjs/ui/test/components/atom/presentation-probe.test.svelte';

describe('presentation adapters', () => {
	it('uses the same preset fold for lightweight and full renderers', () => {
		render(PresentationProbe);

		for (const selector of ['[data-testid="lightweight"]', '[data-testid="full"]']) {
			const node = document.querySelector<HTMLElement>(selector);
			expect(node).not.toBeNull();
			expect(node).toHaveAttribute('data-theme', 'theme');
			expect(node).toHaveAttribute('data-default', 'default');
			expect(node).toHaveAttribute('data-consumer', 'consumer');
			expect(node?.className).toContain('theme-class');
			expect(node?.className).toContain('consumer-class');
		}
	});
});
