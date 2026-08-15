import { expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { CardBond } from '$ixirjs/ui/components/card/bond.svelte';
import Probe from '$ixirjs/ui/test/perf/lazy-kernel/lazy-browser-probe.test.svelte';

it('keeps relationship ids and mounted elements lazy until a public query', async () => {
	let bond: CardBond | undefined;
	render(Probe, { onbond: (value) => (bond = value) });
	await new Promise((resolve) => setTimeout(resolve));

	const root = document.querySelector('.card') as HTMLElement;
	const title = document.querySelector('.card-title') as HTMLElement;
	expect(root.getAttribute('aria-labelledby')).toBe(title.id);
	expect(bond!.elements.title).toBe(title);

	const atom = bond!.nodeByRole('label');
	expect(atom?.id).toBe(title.id);
	expect(atom?.element).toBe(title);
	expect(bond!.nodeByRole('label')).toBe(atom);
});
