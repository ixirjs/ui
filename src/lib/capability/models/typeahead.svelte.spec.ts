import { describe, expect, it, vi, afterEach } from 'vitest';
import { createRovingFocus } from './roving.svelte';
import { createTypeahead, type TypeaheadSource } from './typeahead.svelte';

type Item = {
	label: string;
	element?: Element;
};

// A mount-ordered Map is what a migrated family registers its children into; `entries`/`indexOf`
// is all typeahead reads of it.
class ItemSource implements TypeaheadSource<Item> {
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	readonly items = $state(new Map<string, Item>());

	get entries() {
		return [...this.items.entries()];
	}
	indexOf(id: string) {
		return this.entries.findIndex(([key]) => key === id);
	}
	get keys() {
		return [...this.items.keys()];
	}
}

function fixture() {
	const source = new ItemSource();
	const nativeDisabled = document.createElement('button');
	nativeDisabled.setAttribute('disabled', '');
	source.items.set('alpha', { label: 'Alpha' });
	source.items.set('beta', { label: 'Beta', element: nativeDisabled });
	source.items.set('bravo', { label: 'Bravo' });
	source.items.set('charlie', { label: 'Charlie' });

	const roving = createRovingFocus<Item>({
		ids: () => source.keys,
		item: (id) => source.items.get(id)
	});
	return { source, roving, typeahead: createTypeahead(source, roving) };
}

function key(
	surface: { handleKeydown(ev: KeyboardEvent): string | null },
	k: string,
	extra: Partial<KeyboardEvent> = {}
) {
	const ev = {
		key: k,
		defaultPrevented: false,
		altKey: false,
		ctrlKey: false,
		metaKey: false,
		preventDefault: vi.fn(),
		...extra
	} as unknown as KeyboardEvent;
	surface.handleKeydown(ev);
	return ev;
}

afterEach(() => {
	vi.useRealTimers();
});

describe('createTypeahead', () => {
	it('buffers printable keys and moves the roving focus to the matching item', () => {
		vi.useFakeTimers();
		const { roving, typeahead } = fixture();

		const b = key(typeahead, 'b');
		expect(roving.activeId).toBe('bravo');
		expect(b.preventDefault).toHaveBeenCalled();
		expect(typeahead.buffer).toBe('b');

		key(typeahead, 'r');
		expect(roving.activeId).toBe('bravo');
		expect(typeahead.buffer).toBe('br');

		vi.advanceTimersByTime(700);
		expect(typeahead.buffer).toBe('');

		key(typeahead, 'a');
		expect(roving.activeId).toBe('alpha');
	});

	it('falls back to a fresh one-character search when the buffered query misses', () => {
		const { roving, typeahead } = fixture();

		key(typeahead, 'x');
		expect(roving.activeId).toBeNull();
		key(typeahead, 'c');
		expect(roving.activeId).toBe('charlie');
		expect(typeahead.buffer).toBe('c');
	});

	it('ignores default-prevented, modified, non-printable, and disabled searches', () => {
		const { roving, typeahead } = fixture();

		key(typeahead, 'ArrowDown');
		expect(roving.activeId).toBeNull();
		key(typeahead, 'b', { ctrlKey: true });
		expect(roving.activeId).toBeNull();
		key(typeahead, 'b', { defaultPrevented: true });
		expect(roving.activeId).toBeNull();

		// 'beta' carries a natively-disabled element, so 'b' must skip it for 'bravo'.
		key(typeahead, 'b');
		expect(roving.activeId).toBe('bravo');
	});

	it('destroy clears the buffer and the pending timeout', () => {
		vi.useFakeTimers();
		const { typeahead } = fixture();

		key(typeahead, 'a');
		expect(typeahead.buffer).toBe('a');

		typeahead.destroy();
		expect(typeahead.buffer).toBe('');
		expect(vi.getTimerCount()).toBe(0);
	});
});
