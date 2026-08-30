import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Probe, {
	capturedBond,
	resetCapturedBond
} from '$ixirjs/ui/test/components/dialog/dialog-atom-probe.test.svelte';
import LayerProbe from '$ixirjs/ui/test/components/dialog/dialog-preset-probe.test.svelte';
import { DialogBond } from './bond.svelte';

// Replaces the Atom-registry spec (`nodeByPart`, `instanceof DialogRootAtom`): the same rendered
// outcome — every part carries its seeded id and role, the root's relationship ARIA points at the
// title and description that rendered, and a part's id is released when it unmounts.
describe('Dialog rendered parts', () => {
	beforeEach(resetCapturedBond);

	it('renders every part with its id, role and cross-part ARIA', () => {
		const { unmount } = render(Probe);
		const dialog = capturedBond;

		expect(dialog).toBeInstanceOf(DialogBond);
		expect(dialog?.isOpen).toBe(true);

		const seed = dialog!.id;
		const byPart = (part: string) => document.getElementById(`dialog-${part}-${seed}`);
		const root = byPart('root')!;
		const content = byPart('content')!;
		const header = byPart('header')!;
		const title = byPart('title')!;
		const description = byPart('description')!;
		const body = byPart('body')!;
		const footer = byPart('footer')!;
		const close = byPart('close')!;

		for (const node of [root, content, header, title, description, body, footer, close]) {
			expect(node).not.toBeNull();
		}
		expect(dialog?.element('root')).toBe(root);
		expect(dialog?.element('content')).toBe(content);

		expect(root.getAttribute('role')).toBe('dialog');
		expect(root.getAttribute('aria-modal')).toBe('true');
		expect(root.getAttribute('aria-labelledby')).toBe(title.id);
		expect(root.getAttribute('aria-describedby')).toBe(description.id);
		expect(root.dataset.open).toBe('true');
		expect(content.getAttribute('role')).toBe('document');
		expect(header.getAttribute('role')).toBe('banner');
		expect(title.getAttribute('role')).toBe('heading');
		expect(body.getAttribute('role')).toBe('region');
		expect(footer.getAttribute('role')).toBe('contentinfo');

		unmount();

		for (const part of ['content', 'title', 'description'] as const) {
			expect(dialog?.partId(part)).toBeUndefined();
		}
	});

	it('applies root-owned layers to every bonded Dialog part', () => {
		const { unmount } = render(LayerProbe, {
			presets: {
				root: { class: 'instance-root', attrs: { 'data-instance': 'root' } },
				content: { class: 'instance-content', attrs: { 'data-instance': 'content' } },
				header: { class: 'instance-header', attrs: { 'data-instance': 'header' } },
				title: { class: 'instance-title', attrs: { 'data-instance': 'title' } },
				description: { class: 'instance-description', attrs: { 'data-instance': 'description' } },
				body: { class: 'instance-body', attrs: { 'data-instance': 'body' } },
				footer: { class: 'instance-footer', attrs: { 'data-instance': 'footer' } },
				closeButton: { class: 'instance-close', attrs: { 'data-instance': 'close' } }
			}
		});

		expect(document.querySelector('[data-instance="root"]')?.hasAttribute('presets')).toBe(false);

		for (const value of [
			'root',
			'content',
			'header',
			'title',
			'description',
			'body',
			'footer',
			'close'
		]) {
			expect(document.querySelector(`[data-instance="${value}"]`), value).not.toBeNull();
		}

		unmount();
	});
});
