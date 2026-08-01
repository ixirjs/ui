import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Probe from '$ixirjs/ui/test/components/atom/custom-renderer-probe.test.svelte';

describe('HtmlAtom — custom render target', () => {
	it('does not hand HtmlElement-private props to a consumer-supplied base component', async () => {
		const received: string[] = [];
		render(Probe, { received });

		// `__resolvedPresentation` is part of the renderer-slot contract between HtmlAtom and
		// HtmlElement. A `base` naming some other component resolves its own presentation, so it must
		// never see the flag — and must never spread it onto the DOM as an unknown attribute.
		expect(received).not.toContain('__resolvedPresentation');
		expect(document.querySelector('[__resolvedpresentation]')).toBeNull();
	});
});
