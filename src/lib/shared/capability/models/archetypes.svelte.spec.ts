import { describe, expect, it } from 'vitest';
import {
	FILTERABLE_COLLECTION,
	NAVIGABLE_COLLECTION,
	ROW_COLUMN_CELL,
	SELECTABLE_COLLECTION,
	STATUS,
	TAB_PANEL,
	TREE_ITEM_GROUP,
	TYPEAHEAD,
	DISCLOSURE,
	DISCLOSURE_CLOSE,
	DISCLOSURE_TRIGGER,
	TRIGGER_CONTENT,
	VALIDATED_CONTROL,
	collectionSlot,
	createDisclosure,
	createInput,
	createRovingFocus,
	createSelection,
	createStatus,
	createValidation,
	datePickerCapabilities,
	fieldCapabilities,
	gridCapabilities,
	listboxCapabilities,
	menuCapabilities,
	tabsCapabilities,
	toastCapabilities,
	treeCapabilities
} from '.';

function selection() {
	let values: string[] = [];
	return createSelection<string>({
		get: () => values,
		set: (next) => (values = next),
		mode: () => 'multiple'
	});
}

function roving() {
	return createRovingFocus({ ids: () => ['rust', 'go'] });
}

describe('Layer 3 archetype capability bundles', () => {
	it('listboxCapabilities composes selectable, navigable, and optional filterable collection bundles', () => {
		let query = '';
		const caps = listboxCapabilities({
			kind: 'option',
			selection: selection(),
			roving: roving(),
			input: createInput({
				query: {
					get: () => query,
					set: (next) => (query = next)
				}
			})
		});
		const slots = caps.map((cap) => cap.slot);

		expect(caps.meta).toMatchObject({ layer: 3, kind: 'archetype' });
		expect(slots).toContain(collectionSlot('option'));
		expect(slots).toContain(SELECTABLE_COLLECTION);
		expect(slots).toContain(NAVIGABLE_COLLECTION);
		expect(slots).toContain(FILTERABLE_COLLECTION);
	});

	it('menuCapabilities composes navigable collection plus typeahead', () => {
		const caps = menuCapabilities({
			kind: 'item',
			roving: roving()
		});
		const slots = caps.map((cap) => cap.slot);

		expect(caps.meta).toMatchObject({ layer: 3, kind: 'archetype' });
		expect(slots).toContain(NAVIGABLE_COLLECTION);
		expect(slots).toContain(TYPEAHEAD);
	});

	it('tabsCapabilities composes selectable collection and tab/panel relationship wiring', () => {
		const caps = tabsCapabilities({
			kind: 'tab',
			selection: selection()
		});
		const slots = caps.map((cap) => cap.slot);

		expect(caps.meta).toMatchObject({ layer: 3, kind: 'archetype' });
		expect(slots).toContain(SELECTABLE_COLLECTION);
		expect(slots).toContain(TAB_PANEL);
	});

	it('treeCapabilities composes collection behavior and tree item/group relationships', () => {
		let open = false;
		const disclosure = createDisclosure({
			get: () => open,
			set: (next) => (open = next)
		});
		const caps = treeCapabilities({
			kind: 'item',
			selection: selection(),
			roving: roving(),
			disclosure
		});
		const slots = caps.map((cap) => cap.slot);

		expect(caps.meta).toMatchObject({ layer: 3, kind: 'archetype' });
		expect(slots).toContain(SELECTABLE_COLLECTION);
		expect(slots).toContain(NAVIGABLE_COLLECTION);
		expect(slots).toContain(TREE_ITEM_GROUP);
	});

	it('gridCapabilities composes row/column/cell relationships with optional collection behaviors', () => {
		const caps = gridCapabilities({
			kind: 'row',
			selection: selection(),
			roving: roving()
		});
		const slots = caps.map((cap) => cap.slot);

		expect(caps.meta).toMatchObject({ layer: 3, kind: 'archetype' });
		expect(slots).toContain(ROW_COLUMN_CELL);
		expect(slots).toContain(SELECTABLE_COLLECTION);
		expect(slots).toContain(NAVIGABLE_COLLECTION);
	});

	it('toastCapabilities composes disclosure, close activation, label linkage, and optional status', () => {
		let open = true;
		const disclosure = createDisclosure({
			get: () => open,
			set: (next) => (open = next)
		});
		const status = createStatus({ open: () => disclosure.isOpen });
		const caps = toastCapabilities({ disclosure, status });
		const slots = caps.map((cap) => cap.slot);

		expect(caps.meta).toMatchObject({ layer: 3, kind: 'archetype' });
		expect(slots).toContain(DISCLOSURE);
		expect(slots).toContain(DISCLOSURE_CLOSE);
		expect(slots).toContain(STATUS);
	});

	it('fieldCapabilities composes labelled field and validated control bundles', () => {
		const validation = createValidation({
			validate: () => ({ success: true, errors: [] })
		});
		const status = createStatus({ disabled: () => false, readonly: () => false });
		const caps = fieldCapabilities({ validation, status });
		const slots = caps.map((cap) => cap.slot);

		expect(caps.meta).toMatchObject({ layer: 3, kind: 'archetype' });
		expect(slots).toContain(VALIDATED_CONTROL);
		expect(slots).toContain(STATUS);
	});

	it('datePickerCapabilities composes disclosure trigger/content wiring with optional calendar grid', () => {
		let open = false;
		const disclosure = createDisclosure({
			get: () => open,
			set: (next) => (open = next)
		});
		const caps = datePickerCapabilities({
			disclosure,
			grid: {
				kind: 'day',
				selection: selection(),
				roving: roving()
			}
		});
		const slots = caps.map((cap) => cap.slot);

		expect(caps.meta).toMatchObject({ layer: 3, kind: 'archetype' });
		expect(slots).toContain(DISCLOSURE);
		expect(slots).toContain(TRIGGER_CONTENT);
		expect(slots).toContain(DISCLOSURE_TRIGGER);
		expect(slots).toContain(DISCLOSURE_CLOSE);
		expect(slots).toContain(ROW_COLUMN_CELL);
	});
});
