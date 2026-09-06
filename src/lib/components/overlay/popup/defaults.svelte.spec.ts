import { expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Defaults, { captured } from '$ixirjs/ui/test/components/popup/defaults.test.svelte';
import { PopupBond } from './bond.svelte';
import { CollectionItemAtom } from './item';
import { profiles } from './profiles';

it('uses canonical roots and handles through every published default, and releases collections', async () => {
	captured.clear();
	const view = render(Defaults);
	expect([...captured.keys()].sort()).toEqual(Object.keys(profiles).sort());
	const collections = [];
	for (const [family, value] of captured) {
		expect(value, family).toBeInstanceOf(PopupBond);
		const bond = value as PopupBond;
		expect(bond.profile).toBe(profiles[family as keyof typeof profiles]);
		if (bond.profile.collection) {
			expect(bond.items.size).toBe(1);
			for (const item of bond.items.values()) expect(item).toBeInstanceOf(CollectionItemAtom);
			collections.push(bond.items);
		}
	}
	await view.unmount();
	for (const items of collections) expect(items.size).toBe(0);
});
