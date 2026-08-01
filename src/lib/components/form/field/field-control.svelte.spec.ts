import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Probe from '$ixirjs/ui/test/components/form/field/field-control-inputs.test.svelte';

describe('Field.Control input state routing', () => {
	it('does not forward file state to text controls', () => {
		render(Probe);

		const textControl = document.querySelector<HTMLInputElement>('[data-testid="text-control"]');

		expect(textControl).toBeInstanceOf(HTMLInputElement);
		expect(textControl?.type).toBe('text');
		expect(textControl?.value).toBe('hello');
		expect(textControl?.files).toBeNull();
	});

	it('forwards bound file state to Input.FileControl', () => {
		render(Probe);

		const fileControl = document.querySelector<HTMLInputElement>(
			'input[type="file"][data-testid="file-control"]'
		);
		const picker = fileControl?.nextElementSibling;

		expect(fileControl).toBeInstanceOf(HTMLInputElement);
		expect(fileControl?.accept).toBe('text/plain');
		expect(fileControl?.files).toBeInstanceOf(FileList);
		expect(fileControl?.files).toHaveLength(0);
		expect(picker?.textContent).toContain('fixture.txt');
	});
});
