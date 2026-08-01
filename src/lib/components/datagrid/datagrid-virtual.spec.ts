import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import Fixture from '$ixirjs/ui/test/components/datagrid/datagrid-virtual.test.svelte';

describe('DataGrid.VirtualBody SSR', () => {
	it('bounds rendered rows independently of a 10k-item dataset', () => {
		const { body } = render(Fixture, { props: { count: 10_000 } });
		expect(body).toContain('aria-rowcount="10000"');
		expect((body.match(/data-row=/g) ?? []).length).toBeLessThan(10);
		expect(body).toContain('data-row="row-0"');
		expect(body).not.toContain('data-row="row-99"');
	});

	it('retains an active row outside the ordinary window', () => {
		const { body } = render(Fixture, { props: { count: 100, activeKey: 'row-99' } });
		expect(body).toContain('data-row="row-99"');
	});
});
