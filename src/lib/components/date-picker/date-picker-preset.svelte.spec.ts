import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Probe from '$ixirjs/ui/test/components/date-picker/date-picker-preset-probe.test.svelte';
import type { DatePickerPresets } from './types';

describe('DatePicker root presets', () => {
	it('routes the typed trigger layer through the composed Popover part', () => {
		const presets: DatePickerPresets = {
			trigger: { class: 'instance-trigger', attrs: { 'data-instance': 'trigger' } },
			calendar: { class: 'instance-calendar', attrs: { 'data-instance': 'calendar' } }
		};
		const { unmount } = render(Probe, { presets });

		expect(document.querySelector('.instance-trigger[data-instance="trigger"]')).not.toBeNull();
		expect(document.querySelector('.instance-calendar[data-instance="calendar"]')).not.toBeNull();
		expect(document.querySelector('[presets]')).toBeNull();

		unmount();
	});
});
