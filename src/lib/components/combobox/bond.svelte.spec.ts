import { describe, it, expect } from 'vitest';
import { ComboboxBond } from './bond.svelte';

// Verifies that query (filter box) and value (trigger box) are independent stores — editing one
// must not affect the other. They were a single shared store before this fix. Read through
// `bond.input` since the Kernel migration; the capability surface it used to hang off is gone.
describe('Combobox input model — query vs value are separate stores', () => {
	it('set(query) filters without touching value; set(value) selects without touching query', () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const props: any = { query: '', values: [], multiple: false };
		const bond = ComboboxBond.create(props);
		const input = bond.input;

		// Type in the search box → only `query` changes.
		input.set('gb', 'query');
		expect(props.query).toBe('gb');
		expect(input.get('query')).toBe('gb');
		expect(input.get('value')).toBe(''); // value box untouched by filtering
		expect(props.values).toEqual([]);

		// Pick / set the value box → only the selection changes.
		input.set('eur', 'value');
		expect(props.values).toEqual(['eur']);
		expect(input.get('value')).toBe('eur'); // value box shows the selected item value
		expect(input.get('query')).toBe('gb'); // search box untouched by selecting
	});
});
