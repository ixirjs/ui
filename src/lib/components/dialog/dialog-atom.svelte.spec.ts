import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Probe, { capturedBond, resetCapturedBond } from './dialog-atom-probe.svelte';
import { Atom } from '$svelte-atoms/core/shared/bond';
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

		const root = dialog?.node('root');
		const content = dialog?.node('content');
		const header = dialog?.node('header');
		const title = dialog?.node('title');
		const description = dialog?.node('description');
		const body = dialog?.node('body');
		const footer = dialog?.node('footer');
		const close = dialog?.node('close');

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
		expect(dialog?.nodes()).toHaveLength(8);

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

		expect(typeof dialog?.root).toBe('function');
		expect(typeof dialog?.content).toBe('function');
		expect(typeof dialog?.close).toBe('function');
		expect(typeof dialog?.closeButton).toBe('function');
		const legacyNodes = [
			dialog?.root(),
			dialog?.content(),
			dialog?.header(),
			dialog?.title(),
			dialog?.description(),
			dialog?.body(),
			dialog?.footer(),
			dialog?.closeButton()
		];
		for (const node of legacyNodes) {
			expect(node).toBeInstanceOf(Atom);
		}
		expect(legacyNodes[0]).toBeInstanceOf(DialogRootAtom);
		expect(legacyNodes[1]).toBeInstanceOf(DialogContentAtom);
		expect(legacyNodes[7]).toBeInstanceOf(DialogCloseAtom);

		unmount();

		expect(dialog?.nodes()).toEqual([]);
	});
});
