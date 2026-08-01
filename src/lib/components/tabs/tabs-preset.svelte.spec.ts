import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TabsRoot from './tabs-root.svelte';
import type { TabsPresets } from './types';

describe('Tabs root presets', () => {
	it('applies the typed root layer without forwarding the presets map', () => {
		const presets: TabsPresets = {
			root: { class: 'instance-root', attrs: { 'data-instance': 'root' } }
		};
		const { component, unmount } = render(TabsRoot, { presets, value: 'one' });

		expect(document.querySelector('.instance-root[data-instance="root"]')).not.toBeNull();
		expect(component.getBond().props.presets).toBeDefined();
		expect(document.querySelector('[presets]')).toBeNull();

		unmount();
	});
});
