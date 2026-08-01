import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Probe from './form-field-composition-probe.test.svelte';
import type { FormBond } from '$ixirjs/ui/components/form/bond.svelte';

describe('Form and Field composition contract', () => {
	it('registers a rendered field with its containing form and unregisters it on teardown', async () => {
		const { component, unmount } = render(Probe);
		await tick();
		const form = (component as unknown as { getBond(): FormBond }).getBond();

		expect(form.fields).toHaveLength(1);
		expect(form.fields[0]?.props.name).toBe('email');
		unmount();
		expect(form.fields).toHaveLength(0);
	});
});
