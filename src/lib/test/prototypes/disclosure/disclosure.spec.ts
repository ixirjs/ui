import { describe, expect, it, vi } from 'vitest';
import { render } from 'svelte/server';
import { CollapsibleBond } from '$ixirjs/ui/components/collapsible/bond.svelte';
import { AccordionBond } from '$ixirjs/ui/components/accordion/bond.svelte';
import { AccordionItemBond } from '$ixirjs/ui/components/accordion/item/bond.svelte';
import Prototype from '$ixirjs/ui/test/prototypes/disclosure/disclosure-root.test.svelte';
import Reference from '$ixirjs/ui/test/prototypes/disclosure/reference.test.svelte';
import { disclosureHtml } from './ssr-html';
import { controlledDisclosure, createDisclosureBond, type DisclosureChange } from './bond';

const identity = { name: 'test', seed: 'seed', disabled: () => false };

function semanticHtml(body: string) {
	const seed = body.match(/id="collapsible-root-([^"]+)"/)?.[1];
	if (!seed) throw new Error('Missing root identity');
	const normalized = body.replaceAll(seed, 'SEED');
	return ['root', 'header', 'body'].map((part) => {
		const tag = normalized.match(new RegExp(`<[^>]+id="collapsible-${part}-SEED"[^>]*>`))?.[0];
		if (!tag) throw new Error(`Missing ${part}`);
		return Object.fromEntries(
			[...tag.matchAll(/([\w:-]+)(?:="([^"]*)")?/g)]
				.filter(
					([, name]) =>
						name === 'id' ||
						name === 'role' ||
						name === 'tabindex' ||
						name === 'inert' ||
						name?.startsWith('aria-') ||
						name?.startsWith('data-state')
				)
				.map(([, name, value]) => [name, value ?? ''])
		);
	});
}

describe('canonical disclosure prototype', () => {
	it('pins real SSR bytes for the browser hydration check without adding anchors', () => {
		const candidate = render(Prototype, { props: { open: true } }).body;
		const reference = render(Reference, { props: { open: true } }).body;
		expect(candidate).toBe(disclosureHtml);
		expect([...candidate.matchAll(/<!--/g)].length).toBeLessThanOrEqual(
			[...reference.matchAll(/<!--/g)].length
		);
	});
	it('matches standalone commands and commits before notifying the public owner', () => {
		const oldProps = { open: false };
		const reference = CollapsibleBond.create(oldProps);
		const oldTrace: boolean[] = [];
		reference.bindCommit((next) => {
			oldProps.open = next;
			oldTrace.push(reference.isOpen);
		});
		let open = false;
		const owner = { name: 'public-adapter' };
		const trace: boolean[] = [];
		const notify = vi.fn((next: boolean, context: { bond?: typeof owner }) => {
			trace.push(bond.isOpen);
			expect(bond.isOpen).toBe(next);
			expect(context.bond).toBe(owner);
		});
		const bond = createDisclosureBond({
			...identity,
			state: controlledDisclosure(
				{
					get: () => open,
					set: (next) => {
						open = next;
					}
				},
				() => owner,
				notify
			)
		});
		expect(notify).not.toHaveBeenCalled();
		for (const command of ['close', 'open', 'open', 'toggle', 'toggle', 'close'] as const) {
			reference[command]();
			bond[command]();
			expect(bond.isOpen).toBe(reference.isOpen);
		}
		expect(trace).toEqual(oldTrace);
	});

	it.each([false, true])('delegates Accordion policy with collapsible=%s', (collapsible) => {
		function group() {
			const props = { values: [] as string[], multiple: false, collapsible };
			const parent = AccordionBond.create(props);
			parent.bindCommit((next) => {
				props.values = next;
			});
			return { parent, props };
		}
		const old = group();
		const reference = new AccordionItemBond({ value: 'item' }, old.parent);
		const next = group();
		const bond = createDisclosureBond({
			...identity,
			state: {
				get: () => next.parent.isValueOpen('item'),
				set: (open) => (open ? next.parent.open(['item']) : next.parent.close(['item'])),
				toggle: () => next.parent.toggle('item')
			}
		});
		for (const multiple of [false, true]) {
			old.props.multiple = next.props.multiple = multiple;
			for (const command of ['open', 'toggle', 'close', 'toggle', 'toggle'] as const) {
				reference[command]();
				bond[command]();
				expect(next.props.values).toEqual(old.props.values);
				expect(bond.isOpen).toBe(reference.isOpen);
			}
		}
	});

	it('does not retain no-op, rejected, throwing or nested change metadata', () => {
		let open = false;
		let reject = false;
		let fail = false;
		const trace: DisclosureChange[] = [];
		const bond = createDisclosureBond({
			...identity,
			state: {
				get: () => open,
				set(next, change) {
					if (fail) throw new Error('write failed');
					if (reject) return;
					open = next;
					trace.push(change);
					if (change.reason === 'outer') bond.close({ reason: 'nested' });
				}
			}
		});
		bond.close({ reason: 'noop' });
		reject = true;
		bond.open({ reason: 'rejected' });
		reject = false;
		fail = true;
		expect(() => bond.open({ reason: 'throw' })).toThrow('write failed');
		fail = false;
		bond.open({ reason: 'outer' });
		bond.open();
		expect(trace).toEqual([{ reason: 'outer' }, { reason: 'nested' }, {}]);
		expect(bond.isOpen).toBe(true);
	});

	it('does not notify rejected writes or swallow callback failures', () => {
		let open = false;
		let reject = true;
		const notify = vi.fn(() => {
			throw new Error('callback failed');
		});
		const port = controlledDisclosure(
			{
				get: () => open,
				set: (next) => {
					if (!reject) open = next;
				}
			},
			() => ({}),
			notify
		);
		port.set(true, {});
		expect(notify).not.toHaveBeenCalled();
		reject = false;
		expect(() => port.set(true, {})).toThrow('callback failed');
		expect(open).toBe(true);
		port.set(true, {});
		expect(notify).toHaveBeenCalledTimes(1);
	});

	it.each([false, true])('matches reference SSR semantics when open=%s', (open) => {
		for (const disabled of [false, true]) {
			const reference = render(Reference, { props: { open, disabled } }).body;
			const candidate = render(Prototype, { props: { open, disabled } }).body;
			expect(semanticHtml(candidate)).toEqual(semanticHtml(reference));
		}
	});
});
