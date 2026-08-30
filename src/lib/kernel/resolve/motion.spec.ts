import { describe, expect, it } from 'vitest';
import { extractMotion, mergeMotionConfig, resolveMotionLayers } from './motion';

describe('motion presentation channel', () => {
	it('prefers nested phases and lets undefined inherit legacy flat phases', () => {
		const flatEnter = () => ({ duration: 100 });
		const nestedExit = () => ({ duration: 200 });

		expect(
			extractMotion({
				enter: flatEnter,
				exit: () => ({}),
				motion: { enter: undefined, exit: nestedExit }
			})
		).toEqual({ enter: flatEnter, exit: nestedExit });
	});

	it('preserves a global disable when later layers replace individual phases', () => {
		const exit = () => ({ duration: 200 });
		const merged = mergeMotionConfig(null, { exit });

		expect(merged).toEqual({ initial: null, enter: null, exit, animate: null });
	});

	it('resolves undefined as inherit and null as disable', () => {
		const enter = () => ({ duration: 100 });
		const animate = () => undefined;

		expect(
			resolveMotionLayers([
				{ enter, exit: () => ({}) },
				{ enter: undefined, exit: null, animate }
			])
		).toEqual({ enter, animate });
	});
});
