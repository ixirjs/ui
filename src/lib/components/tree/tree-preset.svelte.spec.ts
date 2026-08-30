import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { TreeBond } from './bond.svelte';
import TreeRoot from './tree-root.svelte';
import type { TreePresets } from './types';

describe('Tree root presets', () => {
	it('applies the typed root layer without forwarding the presets map', () => {
		const presets: TreePresets = {
			root: { class: 'instance-root', attrs: { 'data-instance': 'root' } }
		};
		const { component, unmount } = render(TreeRoot, { presets });

		expect(document.querySelector('.instance-root[data-instance="root"]')).not.toBeNull();
		// `Tree.Root` is no longer generic, so `render` types `component` precisely as the constructor;
		// the export lives on the instance.
		expect((component as unknown as { getBond(): TreeBond }).getBond().props.presets).toBeDefined();
		expect(document.querySelector('[presets]')).toBeNull();

		unmount();
	});
});
