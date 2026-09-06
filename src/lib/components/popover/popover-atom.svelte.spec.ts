import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Probe, {
	capturedBond,
	resetCapturedBond
} from '$ixirjs/ui/test/components/popover/popover-atom-probe.test.svelte';
import LayerProbe from '$ixirjs/ui/test/components/popover/popover-preset-probe.test.svelte';
import { PopupBond } from '$ixirjs/ui/components/overlay/popup/bond.svelte';

/**
 * DOM-level: the family no longer registers Atoms, so what used to be asserted on `nodeByPart`
 * instances and their `spread` is asserted on the rendered elements and the ids the parts announce.
 */
describe('Popover rendered parts', () => {
	beforeEach(resetCapturedBond);

	it('renders every part with its id, ARIA and state, and releases the ids on unmount', () => {
		const { unmount } = render(Probe);
		const popover = capturedBond;

		expect(popover).toBeDefined();
		expect(popover).toBeInstanceOf(PopupBond);
		expect(popover?.isOpen).toBe(true);
		expect(popover?.shouldTrackPosition).toBe(true);

		const parts = ['trigger', 'overlay', 'content', 'tail', 'indicator'] as const;
		for (const part of parts) {
			expect(popover?.partId(part), part).toBe(`popover-${part}-${popover?.id}`);
			expect(popover?.element(part), part).toBeInstanceOf(HTMLElement);
		}

		const trigger = popover!.element('trigger')!;
		const overlay = popover!.element('overlay')!;
		const content = popover!.element('content')!;
		const tail = popover!.element('tail')!;
		const indicator = popover!.element('indicator')!;

		expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
		expect(trigger.getAttribute('aria-expanded')).toBe('true');
		expect(trigger.getAttribute('aria-controls')).toBe(content.id);
		expect(overlay.getAttribute('role')).toBe('dialog');
		expect(overlay.getAttribute('aria-labelledby')).toBe(trigger.id);
		expect(overlay.dataset.active).toBe('true');
		expect(content.dataset.active).toBe('true');
		expect(content.dataset.state).toBe('open');
		expect(tail.getAttribute('role')).toBe('presentation');
		expect(tail.getAttribute('aria-hidden')).toBe('true');
		expect(indicator.getAttribute('aria-hidden')).toBe('true');
		expect(indicator.getAttribute('aria-live')).toBe('polite');

		unmount();

		for (const part of parts) {
			expect(popover?.partId(part), part).toBeUndefined();
		}
	});

	it('applies root-owned layers to every bonded Popover part', async () => {
		const { unmount, rerender } = render(LayerProbe, {
			presets: {
				trigger: { class: 'instance-trigger', attrs: { 'data-instance': 'trigger' } },
				overlay: { class: 'instance-overlay', attrs: { 'data-instance': 'overlay' } },
				content: { class: 'instance-content', attrs: { 'data-instance': 'content' } },
				tail: { class: 'instance-tail', attrs: { 'data-instance': 'tail' } },
				indicator: { class: 'instance-indicator', attrs: { 'data-instance': 'indicator' } }
			}
		});

		for (const [name, value] of [
			['trigger', 'trigger'],
			['overlay', 'overlay'],
			['content', 'content'],
			['tail', 'tail'],
			['indicator', 'indicator']
		] as const) {
			const node = document.querySelector(`[data-instance="${value}"]`);
			expect(node, name).not.toBeNull();
		}

		await rerender({
			presets: { trigger: { class: 'instance-trigger-next', attrs: { 'data-instance': 'next' } } }
		});
		expect(document.querySelector('.instance-trigger-next[data-instance="next"]')).not.toBeNull();
		unmount();
	});
});
