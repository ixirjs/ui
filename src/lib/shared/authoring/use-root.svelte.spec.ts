import { describe, expect, expectTypeOf, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from '@vitest/browser/context';
import { useRoot } from './use-root.svelte';
import UseRootProbe, {
	RootProbeBond,
	type RootProbeBondInstance,
	RootProbeRootAtom
} from '$ixirjs/ui/test/shared/authoring/use-root-probe.test.svelte';
import UseRootSelfLayerProbe from '$ixirjs/ui/test/shared/authoring/use-root-self-layer-probe.test.svelte';

describe('useRoot', () => {
	it('resolves the root Atom, role and registration key from authoring metadata', async () => {
		render(UseRootProbe);
		const node = document.querySelector('[data-testid="declared-root"]');

		// The definition declares `root: { atom, part: 'surface', role: 'control' }`; none of the
		// three is restated by the component.
		expect(node?.getAttribute('data-atom-type')).toBe('true');
		expect(node?.getAttribute('data-role')).toBe('true');
		expect(node?.getAttribute('data-registration')).toBe('true');
		expect(node?.getAttribute('data-slot')).toBe('root');

		// The Bond is published to context before the Atom is created.
		expect(node?.getAttribute('data-shared')).toBe('true');
		expect(node?.getAttribute('data-bond-name')).toBe('root-probe');
		expect(node?.getAttribute('data-get-bond')).toBe('true');

		// The identity seed reaches the Bond, so element ids stay SSR-deterministic.
		expect(node?.getAttribute('data-id-seed')).toBe('true');

		expect(node?.getAttribute('data-preset')).toBe('root-probe');
		await page.getByTestId('toggle-root-preset').click();
		expect(node?.getAttribute('data-preset')).toBe('custom.root');
	});

	it('exposes bond props as live state props', async () => {
		render(UseRootProbe);
		const node = document.querySelector('[data-testid="declared-root"]');

		expect(node?.getAttribute('data-state-flag')).toBe('false');
		await page.getByTestId('toggle-root-flag').click();
		expect(node?.getAttribute('data-state-flag')).toBe('true');
	});

	it('leaves a root without a preset layer when the presets map declares none', () => {
		render(UseRootProbe);
		const node = document.querySelector('[data-testid="declared-root"]');

		// This probe declares no `presets` map, so `bond.presetLayer('root')` has nothing to resolve.
		expect(node?.getAttribute('data-preset-layer')).toBe('true');
	});

	it('resolves presets.root for the root itself, with no component option', () => {
		render(UseRootSelfLayerProbe);
		const node = document.querySelector('[data-testid="self-layer-root"]');

		// A root resolves its own slot from `presets` exactly as every descendant part does. This
		// used to be per-family opt-in — `presetLayer: true` restated at every render, later
		// `selfLayer: true` on the definition — two spellings of a rule with no reason to vary.
		expect(node?.getAttribute('data-preset-layer-value')).toBe('true');
	});

	it('accepts an explicit atom for a definition with no authoring metadata', () => {
		render(UseRootProbe, { raw: true });
		const node = document.querySelector('[data-testid="raw-root"]');

		expect(node?.getAttribute('data-atom-type')).toBe('true');
		expect(node?.getAttribute('data-registration')).toBe('true');
		expect(node?.getAttribute('data-shared')).toBe('true');
	});

	it('keeps bond and atom types tied to the definition', () => {
		const assertTypes = () => {
			const root = useRoot(RootProbeBond, {});
			expectTypeOf(root.bond).toEqualTypeOf<RootProbeBondInstance>();
			expectTypeOf(root.atom).toEqualTypeOf<RootProbeRootAtom>();
		};
		expectTypeOf(assertTypes).toBeFunction();
	});
});
