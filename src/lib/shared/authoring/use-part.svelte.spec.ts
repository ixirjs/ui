import { describe, expect, expectTypeOf, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from '@vitest/browser/context';
import { usePart } from './use-part.svelte';
import UsePartProbe, {
	ProbeBond,
	type ProbeBondInstance,
	ProbeTriggerAtom
} from '$ixirjs/ui/test/shared/authoring/use-part-probe.test.svelte';
import MissingRootProbe from '$ixirjs/ui/test/shared/authoring/missing-root-probe.test.svelte';

describe('usePart', () => {
	it('resolves definition metadata and delegates registration to createAtomInstance', async () => {
		render(UsePartProbe);
		const node = document.querySelector('[data-testid="required-part"]');

		expect(node?.getAttribute('data-bond-present')).toBe('true');
		expect(node?.getAttribute('data-atom-type')).toBe('true');
		expect(node?.getAttribute('data-role')).toBe('true');
		expect(node?.getAttribute('data-registration')).toBe('true');
		expect(node?.getAttribute('data-user')).toBe('kept');
		expect(node?.getAttribute('data-preset')).toBe('part-probe.trigger');

		await page.getByTestId('toggle-part-preset').click();
		expect(node?.getAttribute('data-preset')).toBe('custom.part');
		expect(node?.getAttribute('data-user')).toBe('updated');
	});

	it('supports explicitly optional context for bondless-capable atoms', () => {
		render(UsePartProbe, { optional: true });
		const node = document.querySelector('[data-testid="optional-part"]');

		expect(node?.getAttribute('data-bond-present')).toBe('false');
		expect(node?.getAttribute('data-atom-type')).toBe('true');
		expect(node?.getAttribute('data-role')).toBe('true');
		expect(node?.getAttribute('data-user')).toBe('kept');
		expect(node?.getAttribute('data-preset')).toBe('part-probe.trigger');
	});

	it('derives the missing-root message from the definition', () => {
		// The slot string and the family name are already known here; restating them as a literal at
		// every call site is what let 35 copies drift into four different shapes.
		expect(() => render(MissingRootProbe)).toThrow(
			'[ixirjs] <PartProbe.Trigger /> must be used within a <PartProbe.Root />'
		);
	});

	it('segments a hyphenated name and agrees the article with its initial vowel', () => {
		expect(() => render(MissingRootProbe, { vowel: true })).toThrow(
			'[ixirjs] <AccordionItem.Header /> must be used within an <AccordionItem.Root />'
		);
	});

	it('still honours an explicit message where the component name is not the slot name', () => {
		expect(() => render(MissingRootProbe, { message: 'custom' })).toThrow('custom');
	});

	it('keeps slot and result types tied to the definition', () => {
		const assertTypes = () => {
			const part = usePart(ProbeBond, 'trigger', {});
			expectTypeOf(part.bond).toEqualTypeOf<ProbeBondInstance>();
			expectTypeOf(part.atom).toEqualTypeOf<ProbeTriggerAtom>();

			// @ts-expect-error unknown slots are rejected at the authoring interface
			usePart(ProbeBond, 'missing', {});
		};
		expectTypeOf(assertTypes).toBeFunction();
	});
});
