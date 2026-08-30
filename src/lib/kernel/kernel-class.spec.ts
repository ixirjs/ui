import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import { Card } from '$ixirjs/ui/components/card';

function classOf(body: string): string {
	return body.match(/class="([^"]*)"/)![1]!;
}

// A part's own `attrs.class` is a state class: it lands after the base, before the consumer's
// class, and never replaces the resolved class (2026-08-26: `Card.Root disabled class="x"`
// rendered `class="opacity-50 cursor-not-allowed"` alone).
describe('Kernel.element class composition', () => {
	it('keeps base, own state and consumer classes, in that order', () => {
		const { body } = render(Card.Root as never, {
			props: { disabled: true, class: 'consumer-x' } as never
		});
		const klass = classOf(body);
		expect(klass.indexOf('card')).toBeLessThan(klass.indexOf('opacity-50'));
		expect(klass.indexOf('opacity-50')).toBeLessThan(klass.indexOf('consumer-x'));
	});

	it('renders class first even when the consumer passed other attributes', () => {
		const { body } = render(Card.Root as never, {
			props: { 'data-probe': 'x', class: 'consumer-x' } as never
		});
		expect(body.indexOf('class=')).toBeLessThan(body.indexOf('data-probe='));
		expect(classOf(body)).toContain('consumer-x');
	});
});
