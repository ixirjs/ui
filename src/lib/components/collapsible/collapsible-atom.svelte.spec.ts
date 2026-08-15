import { page } from '@vitest/browser/context';
import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Probe, {
	capturedBond,
	resetCapturedBond
} from '$ixirjs/ui/test/components/collapsible/collapsible-atom-probe.test.svelte';
import { Atom } from '$ixirjs/ui/shared/bond';
import { disclosureTrigger } from '$ixirjs/ui/shared/capability/models/disclosure.svelte';
import Header from './collapsible-header.svelte';
import {
	CollapsibleBond,
	CollapsibleBodyAtom,
	CollapsibleHeaderAtom,
	CollapsibleIndicatorAtom,
	CollapsibleRootAtom,
	type CollapsibleStateProps
} from './bond.svelte';

function makeBond(initial: Partial<CollapsibleStateProps> = {}) {
	const props = $state<CollapsibleStateProps>({ open: false, disabled: false, ...initial });
	return { bond: CollapsibleBond.create(props), props };
}

function clickEvent(): MouseEvent {
	return { button: 0, defaultPrevented: false } as MouseEvent;
}

describe('Collapsible Bond interface', () => {
	beforeEach(resetCapturedBond);

	it('self-constructs without generated Atom methods and exposes predicate state', () => {
		const { bond, props } = makeBond({ disabled: true });

		expect(bond).toBeInstanceOf(CollapsibleBond);
		expect(bond.props.open).toBe(false);
		expect(bond.isOpen).toBe(false);
		expect(bond.isDisabled).toBe(true);
		expect((bond as unknown as Record<string, unknown>).header).toBeUndefined();

		props.open = true;
		expect(bond.isOpen).toBe(true);
	});

	it('mutates open state through methods and trigger handlers', () => {
		const { bond, props } = makeBond();
		const header = new CollapsibleHeaderAtom(bond).role('trigger');

		bond.open();
		expect(props.open).toBe(true);
		bond.close();
		expect(props.open).toBe(false);
		bond.toggle();
		expect(props.open).toBe(true);

		(header.spread.onclick as (event: MouseEvent) => void)(clickEvent());
		expect(props.open).toBe(false);
	});

	it('toggles from a rendered click', async () => {
		const { unmount } = render(Probe);

		await page.getByText('Toggle').click();
		expect(capturedBond?.isOpen).toBe(false);

		await page.getByText('Toggle').click();
		expect(capturedBond?.isOpen).toBe(true);
		unmount();
	});

	it('projects reactive capability and relationship attrs onto registered Atoms', () => {
		const { bond, props } = makeBond({ disabled: true });
		const header = new CollapsibleHeaderAtom(bond).role('trigger');
		const body = new CollapsibleBodyAtom(bond).role('content');
		const indicator = new CollapsibleIndicatorAtom(bond);
		bond.register(header);
		bond.register(body);

		expect(header?.capabilities.map((cap) => cap.slot.description)).toContain(
			'@ixirjs/collapsible:header'
		);
		expect(body?.capabilities.map((cap) => cap.slot.description)).toContain(
			'@ixirjs/collapsible:body'
		);
		expect(header.spread.role).toBe('button');
		expect(header.spread.tabindex).toBe(-1);
		expect(header.spread['aria-disabled']).toBe('true');
		expect(header.spread['aria-controls']).toBe(body.id);
		expect(header.spread['aria-expanded']).toBe(false);
		expect(body.spread.role).toBe('region');
		expect(body.spread['aria-labelledby']).toBe(header.id);
		expect(body.spread.inert).toBe(true);
		expect(indicator.spread.role).toBe('icon');

		props.disabled = false;
		props.open = true;
		expect(header.spread['aria-disabled']).toBe('false');
		expect(header.spread.tabindex).toBe(0);
		expect(header.spread['aria-expanded']).toBe(true);
		expect(body.spread.inert).toBeUndefined();
	});

	it('allows a last-wins trigger policy replacement', () => {
		const { bond, props } = makeBond();
		bond.capability(disclosureTrigger({ disabled: true }));
		const header = new CollapsibleHeaderAtom(bond).role('trigger');

		(header.spread.onclick as (event: MouseEvent) => void)(clickEvent());
		expect(props.open).toBe(false);
	});

	it('registers rendered part Atoms once and cleans them up on unmount', () => {
		const { unmount } = render(Probe);
		const bond = capturedBond;

		expect(bond).toBeDefined();
		expect(bond?.nodeByPart('root')).toBeInstanceOf(CollapsibleRootAtom);
		expect(bond?.nodeByPart('header')).toBeInstanceOf(CollapsibleHeaderAtom);
		expect(bond?.nodeByPart('body')).toBeInstanceOf(CollapsibleBodyAtom);
		expect(bond?.nodeByPart('indicator')).toBeInstanceOf(CollapsibleIndicatorAtom);
		expect(bond?.nodeByPart('header')).toBe(bond?.nodeByPart('header'));
		expect(bond?.nodesByPart('header')).toHaveLength(1);
		expect(
			[
				bond?.nodeByPart('root'),
				bond?.nodeByPart('header'),
				bond?.nodeByPart('body'),
				bond?.nodeByPart('indicator')
			].every((node) => node instanceof Atom)
		).toBe(true);

		unmount();
		expect(bond?.nodesByPart('root')).toEqual([]);
		expect(bond?.nodesByPart('header')).toEqual([]);
		expect(bond?.nodesByPart('body')).toEqual([]);
		expect(bond?.nodesByPart('indicator')).toEqual([]);
	});

	it('rejects descendant parts outside a root context', () => {
		// `Header`'s props carry `BasePropsOf<B>`, a conditional over its own generic, so svelte2tsx
		// emits a component type structurally unrelated to `render`'s parameter. Runtime is what this
		// asserts; the cast only gets the call past that identity mismatch.
		expect(() => render(Header as never)).toThrow(
			'<Collapsible.Header /> must be used within a <Collapsible.Root />'
		);
	});
});
