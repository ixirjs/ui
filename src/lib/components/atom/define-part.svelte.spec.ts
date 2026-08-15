import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { Bond } from '$ixirjs/ui/shared/bond';
import { missingRootMessage } from '$ixirjs/ui/shared/authoring/metadata';
import Probe from '$ixirjs/ui/test/components/atom/define-part-probe.test.svelte';
import InertProbe from '$ixirjs/ui/test/components/atom/inert-part-probe.test.svelte';
import InertProbeBondless from '$ixirjs/ui/test/components/atom/inert-part-bondless-probe.test.svelte';

/**
 * `definePart` reproduces a destructure it no longer performs: the props object goes to the seam
 * whole, and `as`/`class` are written over the top. These pin the four things that swap had to
 * preserve, because thirty-six parts now depend on it and the rest of their coverage is their rendered
 * output.
 */
describe('definePart', () => {
	it('derives missing-root messages from definition and slot names', () => {
		expect(missingRootMessage('part-probe', 'trigger')).toBe(
			'[ixirjs] <PartProbe.Trigger /> must be used within a <PartProbe.Root />'
		);
		expect(missingRootMessage('accordion-item', 'header')).toBe(
			'[ixirjs] <AccordionItem.Header /> must be used within an <AccordionItem.Root />'
		);
	});

	function probe(props: Record<string, unknown> = {}) {
		render(Probe, { 'data-testid': 'part', ...props });
		return document.querySelector('[data-testid="part"]')!;
	}

	it('renders the declared default tag, and lets a consumer `as` win', () => {
		expect(probe().tagName).toBe('H3');
		document.body.innerHTML = '';
		expect(probe({ as: 'h1' }).tagName).toBe('H1');
	});

	it('composes base → $preset → consumer class, so the consumer class comes last', () => {
		const el = probe({ class: 'consumer-class' });
		const classes = el.getAttribute('class') ?? '';
		expect(classes).toContain('probe-base');
		expect(classes).toContain('consumer-class');
		expect(classes.indexOf('probe-base')).toBeLessThan(classes.indexOf('consumer-class'));
	});

	it('forwards unknown props as element attributes and swallows the named ones', () => {
		const el = probe({ 'aria-label': 'titled', preset: undefined });
		expect(el.getAttribute('aria-label')).toBe('titled');
		// `preset` and `class` are Kernel render props, never element attributes.
		expect(el.hasAttribute('preset')).toBe(false);
	});

	it('renders bondless under `context: optional` rather than throwing', () => {
		// The probe is mounted with no <Card.Root> above it. A required part would throw here, which
		// is the whole reason the option is forwarded.
		expect(() => probe()).not.toThrow();
	});
});

/**
 * The inert-part fast path: a slot declaring neither `atom` nor `role` renders without registering
 * its Atom. These pin the contract line — what skipping registration may change (part queries) and
 * what it must not (ids, classes, and the role-carrying siblings' ARIA wiring).
 */
describe('definePart — inert fast path', () => {
	const flush = () => new Promise((resolve) => setTimeout(resolve));

	async function renderCard() {
		let bond: Bond | undefined;
		render(InertProbe, { onbond: (b: unknown) => (bond = b as Bond) });
		// Registration commits are batched per microtask turn; ARIA projection lands after it.
		await flush();
		return {
			bond: bond!,
			root: document.querySelector('[data-testid="root"]')!,
			header: document.querySelector('[data-testid="header"]')!,
			title: document.querySelector('[data-testid="title"]')!
		};
	}

	it('does not register an inert part — the deliberate contract change', async () => {
		const { bond } = await renderCard();
		// A slot that needs querying declares an `atom` or a `role`; `header`/`content` declare
		// neither, so they are presentation-only and invisible to part queries.
		expect(bond.nodeByPart('header')).toBeUndefined();
		expect(bond.nodeByPart('content')).toBeUndefined();
		expect(Object.keys(bond.elements)).not.toContain('header');
	});

	it('keeps role-carrying siblings registered and the root ARIA wiring intact', async () => {
		const { bond, root, title } = await renderCard();
		expect(bond.nodeByRole('label')).toBeDefined();
		expect(bond.nodeByRole('description')).toBeDefined();
		// `labelledControl` projects the registered label/description ids onto the root.
		expect(root.getAttribute('aria-labelledby')).toBe(title.id);
		expect(root.getAttribute('aria-describedby')).toBe(
			document.querySelector('[data-testid="description"]')!.id
		);
	});

	it('renders the same bonded id shape the constructed path produced', async () => {
		const { bond, header } = await renderCard();
		// Atom identity: `<kind>-<bond id>` where kind is `card-header`.
		expect(header.id).toBe(`card-header-${bond.id}`);
	});

	it('renders the same bondless id shape the constructed path produced', () => {
		render(InertProbeBondless, {});
		const el = document.querySelector('[data-testid="lone-header"]')!;
		expect(el.id).toMatch(/^card-header-ix\d+$/);
	});
});
