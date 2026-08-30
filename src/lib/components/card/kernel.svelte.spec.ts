import { expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { CardBond } from './bond.svelte';
import Probe from '$ixirjs/ui/test/components/card/kernel-card-probe.test.svelte';
import PresetProbe from '$ixirjs/ui/test/components/card/kernel-preset-probe.test.svelte';
import FactoryProbe from '$ixirjs/ui/test/components/card/kernel-factory-probe.test.svelte';

it('forwards attributes and preserves clickable keyboard behavior on the leaf', () => {
	let clicks = 0;
	render(Probe, {
		onbond: () => {},
		onrootclick: () => clicks++
	});
	const root = document.querySelector('[data-extra="yes"]') as HTMLElement;
	expect(root.getAttribute('role')).toBe('button');
	root.click();
	root.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
	expect(clicks).toBe(2);
});

// The leaf ↔ rich switching and custom-renderer cases moved to `alert/kernel.svelte.spec.ts`:
// Card's parts are their own element now and take no `as`/`base` (`PlainPartProps`).

it('falls back to full presentation for local variants', () => {
	render(Probe, { withVariants: true, onbond: () => {} });
	expect(document.querySelector('[data-testid="title"]')?.classList).toContain('tone-hot');
});

it('falls back to full presentation for function presets', () => {
	render(PresetProbe, {});
	const title = document.querySelector('.kernel-custom-title') as HTMLElement;
	expect(title.getAttribute('data-rich-preset')).toBe('yes');
});

it('preserves a custom factory and its Bond identity', () => {
	let factoryBond: CardBond | undefined;
	let childBond: CardBond | undefined;
	render(FactoryProbe, {
		onfactory: (bond) => (factoryBond = bond),
		onbond: (bond) => (childBond = bond)
	});
	expect(factoryBond).toBeDefined();
	expect(childBond).toBe(factoryBond);
	const root = document.querySelector('[data-testid="factory-root"]');
	expect(root).toBeTruthy();
	expect(factoryBond!.element).toBe(root);
});
