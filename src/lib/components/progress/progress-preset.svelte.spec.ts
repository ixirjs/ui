import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ProgressPresetProbe from '$ixirjs/ui/test/components/progress/progress-preset.test.svelte';

describe('progress presentation seam', () => {
	it('applies nested HTML and SVG presets without leaking configuration props', () => {
		render(ProgressPresetProbe);

		const linearTrack = document.querySelector<HTMLElement>(
			'[data-testid="linear"] .progress-track'
		);
		const linearFill = document.querySelector<HTMLElement>('[data-testid="linear"] .progress-fill');
		const circular = document.querySelector<HTMLElement>('[data-testid="circular"]');
		const circles = circular?.querySelectorAll('circle');

		expect(linearTrack).toHaveAttribute('data-track-theme', 'linear');
		expect(linearFill).toHaveAttribute('data-fill-theme', 'linear');
		expect(linearTrack?.className).toContain('linear-track-theme');
		expect(linearFill?.className).toContain('linear-fill-theme');
		expect(linearTrack).not.toHaveAttribute('preset');
		expect(linearTrack?.className).not.toContain('$preset');

		expect(circles).toHaveLength(2);
		expect(circles?.[0]).toHaveAttribute('data-track-theme', 'circular');
		expect(circles?.[1]).toHaveAttribute('data-fill-theme', 'circular');
		expect(circles?.[0]?.className.baseVal).toContain('circular-track-theme');
		expect(circles?.[1]?.className.baseVal).toContain('circular-fill-theme');
		expect(circles?.[0]).not.toHaveAttribute('preset');
		expect(circles?.[1]).not.toHaveAttribute('preset');
	});
});
