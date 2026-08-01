import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import AccordionRoot from './accordion-root.svelte';
import type { AccordionPresets } from './types';

describe('Accordion root presets', () => {
	it('applies the typed root layer without forwarding the presets map', () => {
		const presets: AccordionPresets = {
			root: { class: 'instance-root', attrs: { 'data-instance': 'root' } }
		};
		const { component, unmount } = render(AccordionRoot, { presets });

		expect(document.querySelector('.instance-root[data-instance="root"]')).not.toBeNull();
		expect(component.getBond().props.presets).toBeDefined();
		expect(document.querySelector('[presets]')).toBeNull();

		unmount();
	});
});
