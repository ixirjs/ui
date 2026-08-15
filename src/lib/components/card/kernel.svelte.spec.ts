import { tick } from 'svelte';
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

it('keeps one semantic Atom while switching between the leaf and rich paths', async () => {
	let bond: CardBond | undefined;
	const screen = render(Probe, { rich: false, onbond: (value) => (bond = value) });
	await tick();

	const first = bond!.nodeByRole('label');
	const title = () => document.querySelector('[data-testid="title"]') as HTMLElement;
	expect(title().tagName).toBe('H3');
	expect(first?.element).toBe(title());

	screen.rerender({ rich: true, onbond: (value) => (bond = value) });
	await tick();
	expect(title().tagName).toBe('H2');
	expect(bond!.nodeByRole('label')).toBe(first);
	expect(first?.element).toBe(title());

	screen.rerender({ rich: false, onbond: (value) => (bond = value) });
	await tick();
	expect(title().tagName).toBe('H3');
	expect(bond!.nodeByRole('label')).toBe(first);
	expect(first?.element).toBe(title());
});

it('routes a custom renderer through the rich path without replacing Bond identity', async () => {
	let bond: CardBond | undefined;
	const screen = render(Probe, { custom: false, onbond: (value) => (bond = value) });
	await tick();
	const identity = bond;

	screen.rerender({ custom: true, onbond: (value) => (bond = value) });
	await tick();
	const title = document.querySelector('[data-testid="title"]') as HTMLElement;
	expect(title.tagName).toBe('DIV');
	expect(title.getAttribute('data-received')).toContain('data-testid');
	expect(bond).toBe(identity);
	expect(bond!.nodeByRole('label')).toBeDefined();
});

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
	expect(factoryBond!.nodeByPart('root')?.element).toBe(root);
});
