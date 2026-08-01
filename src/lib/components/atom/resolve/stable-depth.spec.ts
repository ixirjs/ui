import { describe, expect, it } from 'vitest';
import { stabilizePresetRecord } from './stable';

// Pins the depth asymmetry the single-pass refactor must preserve: the whole-record equality
// check compares fields at `MAX_DEPTH - 1`, while the field-graft compare runs one level deeper
// at `MAX_DEPTH`. A field can therefore be judged "changed" by the record compare yet still be
// grafted by the deeper field compare. If the graft ever regressed to the shallower budget, the
// first test below would fail.

const NO_BOND = null;

describe('stabilizePresetRecord — record-vs-field depth asymmetry', () => {
	it('grafts a field equal at the deeper field budget even when the record compare sees it changed', () => {
		const entry = () => {};
		const make = () => ({ variants: { size: { sm: { nested: { deep: 'v' } } } } });

		const first = stabilizePresetRecord(entry, NO_BOND, make());
		const second = stabilizePresetRecord(entry, NO_BOND, make());

		// The graph is a fresh set of references nested past the record-compare budget, so the
		// whole-record compare treats the record as changed → a fresh record is returned.
		expect(second).not.toBe(first);
		// But the field is structurally equal at the deeper graft budget, so its reference is
		// grafted (would fail if the graft used the shallower record budget).
		expect((second as { variants: unknown }).variants).toBe(
			(first as { variants: unknown }).variants
		);
	});

	it('returns the previous record when a deep graph is fully identical within budget', () => {
		const entry = () => {};
		const make = () => ({ variants: { size: { sm: 'text-sm' } } });

		const first = stabilizePresetRecord(entry, NO_BOND, make());
		const second = stabilizePresetRecord(entry, NO_BOND, make());

		expect(second).toBe(first);
	});

	it('does not graft a field whose content genuinely changed', () => {
		const entry = () => {};
		const first = stabilizePresetRecord(entry, NO_BOND, {
			class: 'a',
			variants: { size: { sm: 'text-sm' } }
		});
		const second = stabilizePresetRecord(entry, NO_BOND, {
			class: 'b',
			variants: { size: { sm: 'text-lg' } }
		});

		expect(second).not.toBe(first);
		expect((second as { variants: unknown }).variants).not.toBe(
			(first as { variants: unknown }).variants
		);
	});

	it('grafts unchanged siblings (reusing the record-walk verdict) when a later field changed', () => {
		const entry = () => {};
		// `class` is placed last so the record walk proves variants/defaults equal (and remembers
		// them) before hitting the changed field — exercising the reuse path.
		const first = stabilizePresetRecord(entry, NO_BOND, {
			variants: { size: { sm: 'text-sm' } },
			defaults: { size: 'sm' },
			class: 'a'
		});
		const second = stabilizePresetRecord(entry, NO_BOND, {
			variants: { size: { sm: 'text-sm' } },
			defaults: { size: 'sm' },
			class: 'CHANGED'
		});

		expect(second).not.toBe(first);
		expect((second as { variants: unknown }).variants).toBe(
			(first as { variants: unknown }).variants
		);
		expect((second as { defaults: unknown }).defaults).toBe(
			(first as { defaults: unknown }).defaults
		);
		expect((second as { class: unknown }).class).toBe('CHANGED');
	});
});
