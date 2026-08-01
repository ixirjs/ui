import { afterEach, describe, expect, it, vi } from 'vitest';
import { animate } from './animation';

describe('animate', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('releases WAAPI fill after committing final styles so auto-height containers can resize', async () => {
		const style = createStyleDeclaration();
		const cancel = vi.fn();
		const animation = { finished: Promise.resolve(), cancel };
		const node = {
			style,
			scrollHeight: 42,
			getBoundingClientRect: () => ({ height: 42, width: 0 }),
			animate: vi.fn(() => animation)
		} as unknown as HTMLElement;

		vi.stubGlobal('getComputedStyle', () => ({
			getPropertyValue: (prop: string) => (prop === 'height' ? '0px' : '')
		}));

		const controller = animate(node, { height: 'auto' }, { duration: 0.2 });
		await controller.finished;

		expect(style.height).toBe('auto');
		expect(cancel).toHaveBeenCalledOnce();
	});
});

function createStyleDeclaration() {
	const values: Record<string, string> = {};
	return {
		get height() {
			return values.height ?? '';
		},
		set height(value: string) {
			values.height = value;
		},
		get width() {
			return values.width ?? '';
		},
		set width(value: string) {
			values.width = value;
		},
		setProperty(prop: string, value: string) {
			values[prop] = value;
		}
	} as CSSStyleDeclaration;
}
