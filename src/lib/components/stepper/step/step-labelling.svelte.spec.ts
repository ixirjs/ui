import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import StepLabellingTest from '$ixirjs/ui/test/components/stepper/step-labelling.test.svelte';

// Step.Header carries role 'control' and wraps its own label, so the label registers a frame after
// the element referencing it renders. The reference resolves reactively; read it after a frame.
async function settle() {
	await new Promise((resolve) => requestAnimationFrame(resolve));
	await new Promise((resolve) => requestAnimationFrame(resolve));
}

const ids = () => {
	const step = document.querySelector<HTMLElement>('[data-testid="step"]')!;
	return {
		step,
		title: document.querySelector<HTMLElement>('[data-testid="title"]')!,
		description: document.querySelector<HTMLElement>('[data-testid="description"]')!
	};
};

describe('Step labelling', () => {
	it('labels the step group from the rendered title and description ids', async () => {
		const { unmount } = render(StepLabellingTest);
		await settle();
		const { step, title, description } = ids();

		expect(title.id).toBeTruthy();
		expect(step.getAttribute('role')).toBe('group');
		expect(step.getAttribute('aria-labelledby')).toBe(title.id);
		expect(step.getAttribute('aria-describedby')).toBe(description.id);

		unmount();
	});

	it('follows a consumer-supplied id, which wins on the element it is passed to', async () => {
		const { unmount } = render(StepLabellingTest, { titleId: 'my-own-title' });
		await settle();
		const { step, title } = ids();

		expect(title.id).toBe('my-own-title');
		// The previous `step-title-${bond.id}` template pointed at a non-existent element here.
		expect(step.getAttribute('aria-labelledby')).toBe('my-own-title');

		unmount();
	});
});
