import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import TabsAtomProbe from '$ixirjs/ui/test/components/tabs/tabs-atom-probe.test.svelte';

// `Tab.Body` registers its content with the parent `Tabs` bond so `Tabs.Content` can render it.
// That registration used to live only inside `$effect.pre`, which never runs during SSR — every
// panel rendered empty until hydration. See tab-body.svelte.
describe('Tabs — SSR content coverage', () => {
	it('renders the active panel body during SSR, not only after hydration', () => {
		const { body } = render(TabsAtomProbe);
		expect(body).toContain('Panel one');
	});
});
