import { beforeEach, describe, expect, it } from 'vitest';
import { page } from '@vitest/browser/context';
import { render } from 'vitest-browser-svelte';
import MotionPresentationProbe, {
	motionPresentationCount,
	resetMotionPresentationProbe
} from '$ixirjs/ui/test/components/element/motion-presentation-probe.test.svelte';

describe('motion presentation adapters', () => {
	beforeEach(resetMotionPresentationProbe);

	it('delivers preset motion through HTML, Atom, and SVG adapters without DOM leakage', async () => {
		render(MotionPresentationProbe);

		for (const id of ['html-motion', 'atom-motion', 'svg-motion']) {
			await expect.poll(() => motionPresentationCount(id, 'initial')).toBe(1);
			await expect.poll(() => motionPresentationCount(id, 'animate')).toBe(1);
			const node = document.querySelector(`[data-testid="${id}"]`);
			expect(node).not.toHaveAttribute('motion');
			expect(node).not.toHaveAttribute('initial');
			expect(node).not.toHaveAttribute('animate');
		}
	});

	it('supports phase and global null disables', async () => {
		render(MotionPresentationProbe);

		await expect.poll(() => motionPresentationCount('phase-disabled', 'initial')).toBe(1);
		expect(motionPresentationCount('phase-disabled', 'animate')).toBe(0);
		expect(motionPresentationCount('all-disabled', 'initial')).toBe(0);
		expect(motionPresentationCount('all-disabled', 'animate')).toBe(0);
	});

	it('does not restart animate when an unrelated attribute changes', async () => {
		render(MotionPresentationProbe);
		await expect.poll(() => motionPresentationCount('html-motion', 'animate')).toBe(1);
		await expect.poll(() => motionPresentationCount('svg-motion', 'animate')).toBe(1);

		await page.getByTestId('tick').click();

		expect(motionPresentationCount('html-motion', 'animate')).toBe(1);
		expect(motionPresentationCount('html-motion', 'cleanup')).toBe(0);
		expect(motionPresentationCount('svg-motion', 'animate')).toBe(1);
		expect(motionPresentationCount('svg-motion', 'cleanup')).toBe(0);
	});

	it('keeps resolved transitions live through HTML and SVG outro completion', async () => {
		render(MotionPresentationProbe);
		await page.getByTestId('hide-exiting-elements').click();

		await expect.poll(() => motionPresentationCount('html-exit', 'exitend')).toBe(1);
		await expect.poll(() => motionPresentationCount('svg-exit', 'exitend')).toBe(1);
	});
});
