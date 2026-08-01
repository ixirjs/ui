import { createSelection } from './selection.svelte';

// Disclosure — open/closed state as a degenerate SelectionModel over {self}.
// open ≡ self is selected; thin facade (open/close/toggle/isOpen) reuses the selection algebra.
export interface Disclosure {
	readonly isOpen: boolean;
	open(): void;
	close(): void;
	toggle(): void;
}

// Boolean storage seam — the bond supplies reactive accessors over `props.open`.
export interface DisclosureBacking {
	get(): boolean;
	set(open: boolean): void;
}

// The sentinel "value" whose selectedness is the open state.
const SELF = 'open';

// Build a Disclosure as a single-mode createSelection over {SELF}.
// The boolean backing adapts to the array surface: open ↔ [SELF].
export function createDisclosure(backing: DisclosureBacking): Disclosure {
	const selection = createSelection<string>({
		get: () => (backing.get() ? [SELF] : []),
		set: (values) => backing.set(values.length > 0),
		mode: () => 'single'
	});

	return {
		get isOpen() {
			return selection.isSelected(SELF);
		},
		open: () => selection.select(SELF),
		close: () => selection.deselect(SELF),
		toggle: () => selection.toggle(SELF)
	};
}
