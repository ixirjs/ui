import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import Fixture from '$ixirjs/ui/test/prototypes/popup/popup-root.test.svelte';
import type { PopupProfile } from './types';

const profiles: PopupProfile[] = ['popover', 'dropdown-menu', 'select', 'combobox'];

describe('canonical popup SSR', () => {
	it.each(profiles)('renders %s identities and semantic relationships', (profile) => {
		const html = render(Fixture, { props: { profile, open: true, values: ['pear'] } }).body;
		const contentId = html.match(/aria-controls="([^"]+)"/)?.[1];
		expect(contentId).toBeTruthy();
		expect(html).toContain(`id="${contentId}"`);
		expect(html).not.toContain('aria-activedescendant=');
		if (profile === 'popover') expect(html).toContain('role="dialog"');
		else {
			const role = profile === 'dropdown-menu' ? 'menuitem' : 'option';
			expect([...html.matchAll(new RegExp(`role="${role}"`, 'g'))]).toHaveLength(3);
			expect(html).toContain('aria-disabled="true"');
			if (profile !== 'dropdown-menu') expect(html).toContain('aria-selected="true"');
		}
	});
});
