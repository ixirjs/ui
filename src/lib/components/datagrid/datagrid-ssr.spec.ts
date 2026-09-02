import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import Fixture from '$ixirjs/ui/test/components/datagrid/datagrid-ssr.test.svelte';

describe('DataGrid SSR', () => {
	it('renders body content without JavaScript and applies initial hidden-column projection', () => {
		const { body } = render(Fixture);

		expect(body).toContain('Alice');
		expect(body).toContain('Active');
		expect(body).toContain('Bob');
		expect(body).toContain('Pending');
		// A hidden column's cell is rendered with `hidden` rather than omitted: the cell is a literal
		// tag with no block of its own (ADR 0008, 2026-08-30), and `hidden` keeps it out of the
		// layout and the accessibility tree alike.
		expect(body).toMatch(/role="gridcell" hidden=""><!---->classified</);
		expect(body).toMatch(/role="gridcell" hidden=""><!---->private</);
	});

	it('uses the explicit fallback template during server rendering', () => {
		const { body } = render(Fixture);
		expect(body).toContain('--template-columns:repeat(3, minmax(0, 1fr))');
	});

	it('is deterministic across independent server renders', () => {
		expect(render(Fixture).body).toBe(render(Fixture).body);
	});
});
