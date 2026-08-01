import { describe, expect, it } from 'vitest';
import {
	BACKDROP_PRESS,
	ESCAPE,
	OUTSIDE_PRESS,
	dismissPolicy
} from '$svelte-atoms/core/components/portal/host';

describe('dismissPolicy', () => {
	it('composes Escape, outside press, and backdrop press as a Layer 2 focused bundle', () => {
		const caps = dismissPolicy();
		const slots = caps.map((cap) => cap.slot);

		expect(caps.meta).toMatchObject({
			layer: 2,
			kind: 'focused',
			projects: ['surface', 'backdrop']
		});
		expect(slots).toContain(ESCAPE);
		expect(slots).toContain(OUTSIDE_PRESS);
		expect(slots).toContain(BACKDROP_PRESS);
	});

	it('can omit individual dismissal primitives', () => {
		const caps = dismissPolicy({ outsidePress: false, backdropPress: false });
		const slots = caps.map((cap) => cap.slot);

		expect(slots).toContain(ESCAPE);
		expect(slots).not.toContain(OUTSIDE_PRESS);
		expect(slots).not.toContain(BACKDROP_PRESS);
	});
});
