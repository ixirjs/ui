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

	it('deduplicates node/axis writes while preserving every read, restore and start', async () => {
		const events: string[] = [];
		const a = batchNode('a', events);
		const b = batchNode('b', events, 0);
		a.style.height = '11px';
		a.style.width = '12px';
		b.style.height = '21px';
		b.style.width = '22px';
		events.length = 0;
		const complete = vi.fn();
		const options = { duration: 0.2, delay: 0.1, onComplete: complete };
		const first = animate(
			a.node,
			{ height: [0, 'auto'], maxHeight: [0, 'auto'], width: [0, 'auto'] },
			options
		);
		const duplicate = animate(
			a.node,
			{ minHeight: [0, 'auto'], 'min-width': [0, 'auto'] },
			options
		);
		const second = animate(b.node, { width: [0, 'auto'], height: [0, 'auto'] }, options);
		expect(events).toEqual([]);
		await Promise.all([first.finished, duplicate.finished, second.finished]);
		expect(events).toEqual([
			'write:a:height:auto',
			'write:a:width:auto',
			'write:b:width:auto',
			'write:b:height:auto',
			'read:a:height',
			'read:a:height',
			'read:a:width',
			'read:a:height',
			'read:a:width',
			'read:b:width',
			'rect:b',
			'read:b:height',
			'rect:b',
			'write:a:height:11px',
			'write:a:width:12px',
			'write:b:width:22px',
			'write:b:height:21px',
			'start:a',
			'start:a',
			'start:b'
		]);
		expect(a.start.mock.calls[0]).toEqual([
			{ height: ['0px', '42px'], maxHeight: ['0px', '42px'], width: ['0px', '42px'] },
			{ duration: 200, delay: 100, easing: 'linear', fill: 'both' }
		]);
		expect(b.start.mock.calls[0]?.[0]).toEqual({ width: ['0px', '84px'], height: ['0px', '84px'] });
		expect(a.style.height).toBe('auto');
		expect(b.style.width).toBe('auto');
		expect(complete).toHaveBeenCalledTimes(3);
		expect(a.cancel).toHaveBeenCalledTimes(2);
		expect(b.cancel).toHaveBeenCalledOnce();

		// Batch-local membership must not suppress a later measurement of the same node/axis.
		events.length = 0;
		await animate(a.node, { height: [0, 'auto'] }, options).finished;
		expect(events).toEqual([
			'write:a:height:auto',
			'read:a:height',
			'write:a:height:auto',
			'start:a'
		]);
	});

	it('skips stopped queued runs without suppressing an active run on the same node', async () => {
		const events: string[] = [];
		const a = batchNode('a', events);
		const b = batchNode('b', events);
		const complete = vi.fn();
		const stopped = animate(
			a.node,
			{ height: [0, 'auto'] },
			{ duration: 0.2, onComplete: complete }
		);
		const skipped = animate(
			b.node,
			{ width: [0, 'auto'] },
			{ duration: 0.2, onComplete: complete }
		);
		stopped.stop();
		skipped.stop();
		const active = animate(a.node, { height: [0, 'auto'] }, { duration: 0.2 });
		await Promise.all([stopped.finished, skipped.finished, active.finished]);
		expect(events).toEqual(['write:a:height:auto', 'read:a:height', 'write:a:height:', 'start:a']);
		expect(a.start).toHaveBeenCalledOnce();
		expect(b.start).not.toHaveBeenCalled();
		expect(complete).not.toHaveBeenCalled();
	});

	it('cancels a started run without committing stale final styles or invoking completion', async () => {
		let finish!: () => void;
		const finished = new Promise<void>((resolve) => {
			finish = resolve;
		});
		const a = batchNode('a', []);
		a.start.mockReturnValue({ finished, cancel: a.cancel });
		a.style.height = '13px';
		const complete = vi.fn();
		const controller = animate(
			a.node,
			{ height: [0, 'auto'] },
			{ duration: 0.2, onComplete: complete }
		);
		await Promise.resolve(); // Start the batch, but leave WAAPI unsettled.
		controller.stop();
		finish();
		await controller.finished;
		expect(a.start).toHaveBeenCalledOnce();
		expect(a.cancel).toHaveBeenCalledOnce();
		expect(a.style.height).toBe('13px');
		expect(complete).not.toHaveBeenCalled();
	});

	it('settles a rejected WAAPI promise without committing final styles', async () => {
		const a = batchNode('a', []);
		a.start.mockImplementation(() => ({
			finished: Promise.reject(new Error('cancelled')),
			cancel: a.cancel
		}));
		const complete = vi.fn();
		const controller = animate(
			a.node,
			{ height: [0, 'auto'] },
			{ duration: 0.2, onComplete: complete }
		);
		await expect(controller.finished).resolves.toBeUndefined();
		expect(a.style.height).toBe('');
		expect(complete).not.toHaveBeenCalled();
	});

	it('bounds deduplication work linearly across increasing batch sizes', async () => {
		for (const n of [100, 200, 400]) {
			let flush!: () => void;
			vi.stubGlobal('queueMicrotask', (callback: () => void) => {
				flush = callback;
			});
			const controllers = Array.from({ length: n }, () =>
				animate(
					batchNode('node', []).node,
					{
						height: [0, 'auto'],
						maxHeight: [0, 'auto'],
						width: [0, 'auto'],
						minWidth: [0, 'auto']
					},
					{ duration: 0.2 }
				)
			);
			let comparisons = 0;
			let membership = 0;
			const some = Array.prototype.some;
			const has = Set.prototype.has;
			try {
				Array.prototype.some = function (callback, receiver) {
					return some.call(this, (value, index, array) => {
						comparisons++;
						return callback.call(receiver, value, index, array);
					});
				};
				Set.prototype.has = function (value) {
					if (typeof value === 'object' && value !== null) membership++;
					return has.call(this, value);
				};
				flush();
			} finally {
				Array.prototype.some = some;
				Set.prototype.has = has;
				vi.unstubAllGlobals();
			}
			await Promise.all(controllers.map((controller) => controller.finished));
			expect(comparisons).toBe(0);
			expect(membership).toBeGreaterThan(0);
			expect(membership).toBeLessThanOrEqual(4 * n);
		}
	});

	it.each(['reduced motion', 'missing WAAPI'])(
		'does not batch or measure with %s',
		async (mode) => {
			const events: string[] = [];
			const a = batchNode('a', events);
			const queued = vi.fn();
			const complete = vi.fn();
			vi.stubGlobal('queueMicrotask', queued);
			if (mode === 'reduced motion') {
				vi.stubGlobal('window', { matchMedia: () => ({ matches: true }) });
				vi.stubGlobal('document', {});
			} else Object.defineProperty(a.node, 'animate', { value: undefined });
			const controller = animate(
				a.node,
				{ height: [0, 'auto'], width: [0, 'auto'] },
				{ duration: 0.2, onComplete: complete }
			);
			expect(complete).toHaveBeenCalledOnce();
			await controller.finished;
			expect(queued).not.toHaveBeenCalled();
			expect(a.start).not.toHaveBeenCalled();
			expect(events).toEqual([]);
			expect(a.style.height).toBe('auto');
			expect(a.style.width).toBe('auto');
		}
	);

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

function createStyleDeclaration(onAxisWrite?: (prop: string, value: string) => void) {
	const values: Record<string, string> = {};
	return {
		get height() {
			return values.height ?? '';
		},
		set height(value: string) {
			values.height = value;
			onAxisWrite?.('height', value);
		},
		get width() {
			return values.width ?? '';
		},
		set width(value: string) {
			values.width = value;
			onAxisWrite?.('width', value);
		},
		setProperty(prop: string, value: string) {
			values[prop] = value;
		}
	} as CSSStyleDeclaration;
}

function batchNode(name: string, events: string[], size = 42) {
	const style = createStyleDeclaration((prop, value) =>
		events.push(`write:${name}:${prop}:${value}`)
	);
	const cancel = vi.fn();
	const start = vi.fn((_frames: unknown, _options: unknown) => {
		events.push(`start:${name}`);
		return { finished: Promise.resolve(), cancel };
	});
	const node = {
		style,
		get scrollHeight() {
			events.push(`read:${name}:height`);
			return size;
		},
		get scrollWidth() {
			events.push(`read:${name}:width`);
			return size;
		},
		getBoundingClientRect() {
			events.push(`rect:${name}`);
			return { height: 84, width: 84 };
		},
		animate: start
	} as unknown as HTMLElement;
	return { node, style, start, cancel };
}
