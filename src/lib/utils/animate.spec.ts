import { afterEach, describe, expect, it, vi } from 'vitest';
import { animate } from './animate';

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

	it('reads no computed style when the run will not animate', () => {
		const style = createStyleDeclaration();
		const computed = vi.fn(() => ({ getPropertyValue: () => '0px' }));
		vi.stubGlobal('getComputedStyle', computed);

		const node = {
			style,
			scrollHeight: 42,
			getBoundingClientRect: () => ({ height: 42, width: 0 }),
			animate: vi.fn()
		} as unknown as HTMLElement;

		// A zero-duration phase only ever commits final styles, and those come from the target
		// value. Reading the element's current one forces a style flush per call, which is what
		// made a `Collapsible.Body` cost 3x its upstream equivalent to mount.
		animate(node, { opacity: 0, height: 0 }, { duration: 0 });

		expect(computed).not.toHaveBeenCalled();
		expect(node.animate).not.toHaveBeenCalled();
		expect(style.height).toBe('0px');
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
