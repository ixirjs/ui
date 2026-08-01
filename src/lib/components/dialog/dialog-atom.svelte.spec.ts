import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Probe, {
	capturedBond,
	resetCapturedBond
} from '$ixirjs/ui/test/components/dialog/dialog-atom-probe.test.svelte';
import LayerProbe from '$ixirjs/ui/test/components/dialog/dialog-preset-probe.test.svelte';
import { Atom } from '$ixirjs/ui/shared/bond';
import {
	DialogBodyAtom,
	DialogBond,
	DialogCloseAtom,
	DialogContentAtom,
	DialogDescriptionAtom,
	DialogFooterAtom,
	DialogHeaderAtom,
	DialogRootAtom,
	DialogTitleAtom
} from './bond.svelte';

describe('Dialog component-owned Atoms', () => {
	beforeEach(resetCapturedBond);

	it('registers rendered dialog nodes', () => {
		const { unmount } = render(Probe);
		const dialog = capturedBond;

		expect(dialog).toBeDefined();
		expect(dialog).toBeInstanceOf(DialogBond);
		expect(dialog?.isOpen).toBe(true);

		const root = dialog?.nodeByPart('root');
		const content = dialog?.nodeByPart('content');
		const header = dialog?.nodeByPart('header');
		const title = dialog?.nodeByPart('title');
		const description = dialog?.nodeByPart('description');
		const body = dialog?.nodeByPart('body');
		const footer = dialog?.nodeByPart('footer');
		const close = dialog?.nodeByPart('close');

		expect(root).toBeInstanceOf(DialogRootAtom);
		expect(content).toBeInstanceOf(DialogContentAtom);
		expect(header).toBeInstanceOf(DialogHeaderAtom);
		expect(title).toBeInstanceOf(DialogTitleAtom);
		expect(description).toBeInstanceOf(DialogDescriptionAtom);
		expect(body).toBeInstanceOf(DialogBodyAtom);
		expect(footer).toBeInstanceOf(DialogFooterAtom);
		expect(close).toBeInstanceOf(DialogCloseAtom);
		for (const node of [root, content, header, title, description, body, footer, close]) {
			expect(node).toBeInstanceOf(Atom);
		}
		for (const [part, node] of [
			['root', root],
			['content', content],
			['header', header],
			['title', title],
			['description', description],
			['body', body],
			['footer', footer],
			['close', close]
		] as const) {
			expect(dialog?.nodesByPart(part)).toEqual([node]);
		}

		expect(root?.spread.role).toBe('dialog');
		expect(root?.spread['aria-modal']).toBe(true);
		expect(root?.spread['aria-labelledby']).toBe(title?.id);
		expect(root?.spread['aria-describedby']).toBe(description?.id);
		expect(root?.spread['data-open']).toBe(true);
		expect(content?.spread.role).toBe('document');
		expect(header?.spread.role).toBe('banner');
		expect(title?.spread.role).toBe('heading');
		expect(body?.spread.role).toBe('region');
		expect(footer?.spread.role).toBe('contentinfo');

		unmount();

		for (const part of [
			'root',
			'content',
			'header',
			'title',
			'description',
			'body',
			'footer',
			'close'
		]) {
			expect(dialog?.nodesByPart(part)).toEqual([]);
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
