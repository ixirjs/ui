import { page } from '@vitest/browser/context';
import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Probe, {
	capturedBond,
	resetCapturedBond
} from '$ixirjs/ui/test/components/collapsible/collapsible-atom-probe.test.svelte';
import Header from './collapsible-header.svelte';
import { CollapsibleBond, type CollapsibleBondProps } from './bond.svelte';

// Replaces the Atom-registry spec (`nodeByPart`, `register`, capability slots): the same rendered
// outcome — every part carries its seeded id, the header names the body it controls, and the
// disabled projection reaches the element.
function makeBond(initial: Partial<CollapsibleBondProps> = {}) {
	const props = $state<CollapsibleBondProps>({ open: false, disabled: false, ...initial });
	return { bond: CollapsibleBond.create(props), props };
}

describe('Collapsible Bond interface', () => {
	beforeEach(resetCapturedBond);

	it('self-constructs and exposes predicate state', () => {
		const { bond, props } = makeBond({ disabled: true });

		expect(bond).toBeInstanceOf(CollapsibleBond);
		expect(bond.props.open).toBe(false);
		expect(bond.isOpen).toBe(false);
		expect(bond.isDisabled).toBe(true);

		props.open = true;
		expect(bond.isOpen).toBe(true);
	});

	it('mutates open state through methods', () => {
		const { bond, props } = makeBond();

		bond.open();
		expect(props.open).toBe(true);
		bond.close();
		expect(props.open).toBe(false);
		bond.toggle();
		expect(props.open).toBe(true);
	});

	it('toggles from a rendered click', async () => {
		const { unmount } = render(Probe);

		await page.getByText('Toggle').click();
		expect(capturedBond?.isOpen).toBe(false);

		await page.getByText('Toggle').click();
		expect(capturedBond?.isOpen).toBe(true);
		unmount();
	});

	it('renders every part with its id and cross-part ARIA', () => {
		const { unmount } = render(Probe);
		const bond = capturedBond!;
		const byId = (id: string) => document.getElementById(id)!;

		const root = byId(bond.rootId);
		const header = byId(bond.headerId);
		const body = byId(bond.bodyId);
		const indicator = byId(bond.indicatorId);

		for (const node of [root, header, body, indicator]) expect(node).not.toBeNull();
		expect(header.getAttribute('role')).toBe('button');
		expect(header.getAttribute('tabindex')).toBe('0');
		expect(header.getAttribute('aria-disabled')).toBe('false');
		expect(header.getAttribute('aria-controls')).toBe(bond.bodyId);
		expect(header.getAttribute('aria-expanded')).toBe('true');
		expect(body.getAttribute('role')).toBe('region');
		expect(body.getAttribute('aria-labelledby')).toBe(bond.headerId);
		expect(body.hasAttribute('inert')).toBe(false);
		expect(indicator.getAttribute('role')).toBe('icon');

		unmount();
	});

	it('rejects descendant parts outside a root context', () => {
		expect(() => render(Header as never)).toThrow(
			'<Collapsible.Header /> must be used within a <Collapsible.Root />'
		);
	});
});
