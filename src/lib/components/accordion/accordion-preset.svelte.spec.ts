import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import AccordionRoot from './accordion-root.svelte';
import type { AccordionBond } from './bond.svelte';
import type { AccordionPresets } from './types';
import RenderAsProbe from '$ixirjs/ui/test/components/accordion/render-as-probe.test.svelte';

describe('Accordion root presets', () => {
	it('applies the typed root layer without forwarding the presets map', () => {
		const presets: AccordionPresets = {
			root: { class: 'instance-root', attrs: { 'data-instance': 'root' } }
		};
		const { component, unmount } = render(AccordionRoot, { presets });

		expect(document.querySelector('.instance-root[data-instance="root"]')).not.toBeNull();
		expect(
			(component as unknown as { getBond(): AccordionBond }).getBond().props.presets
		).toBeDefined();
		expect(document.querySelector('[presets]')).toBeNull();

		unmount();
	});

	it("honours a preset's render.as on the item root", () => {
		const { unmount } = render(RenderAsProbe);
		expect(document.querySelector('li[id^="accordion-item-root-"]')).not.toBeNull();
		unmount();
	});
});
