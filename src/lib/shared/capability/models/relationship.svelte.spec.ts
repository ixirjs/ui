import { describe, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import { Bond, Atom, bondContextKey, type BondStateProps } from '$ixirjs/ui/shared/bond';
import { createDisclosure, disclosureCapability, DISCLOSURE } from './disclosure.svelte';
import {
	triggerContentLink,
	labelledControl,
	tabPanelLink,
	errorMessageLink,
	rowColumnCellLink,
	treeItemGroupLink,
	liveRegionRelationship,
	TRIGGER_CONTENT,
	TAB_PANEL,
	ERROR_MESSAGE,
	ROW_COLUMN_CELL,
	TREE_ITEM_GROUP,
	LIVE_REGION
} from './relationship.svelte';

class TestState {
	open = $state(false);
	selected = $state(false);
	invalid = $state(false);
	disclosure = createDisclosure({
		get: () => this.open,
		set: (v) => (this.open = v)
	});
}

class TestBond extends Bond<BondStateProps> {
	static CONTEXT_KEY = bondContextKey('test-relationship');
	readonly model: TestState;

	constructor(readonly state: TestState) {
		super({}, 'test');
		this.model = state;
	}

	// Register a TestAtom under `key` playing `role` via the production registry path.
	addAtom(key: string, role: string, ctx?: unknown, cardinality: 'single' | 'many' = 'single') {
		const atom = new TestAtom(this, key).role(role, ctx);
		this.register(atom, { key, cardinality });
		return atom;
	}
}

class TestAtom extends Atom<TestBond> {
	constructor(bond: TestBond, key: string) {
		super(bond, key);
	}
}

function makeBond() {
	const bond = new TestBond(new TestState());
	bond.capability(disclosureCapability(bond.model.disclosure));
	bond.capability(triggerContentLink({ contentRole: 'region' }));
	return bond;
}

describe('triggerContentLink — reusable trigger ↔ content a11y linkage', () => {
	it('is annotated as a Layer 1 relationship between trigger and content roles', () => {
		const cap = triggerContentLink();
		expect(cap.meta).toMatchObject({
			projects: ['trigger', 'content']
		});
		expect(cap.slot).toBe(TRIGGER_CONTENT);
		expect(cap.requires).toEqual([DISCLOSURE]);
		expect(cap.surface).toBeUndefined();
	});

	it('cross-references ids both ways via nodeByRole', () => {
		const bond = makeBond();
		const trigger = bond.addAtom('trigger-btn', 'trigger');
		const content = bond.addAtom('panel', 'content');

		// trigger points at content's id; content points back at trigger's id
		expect(trigger.spread['aria-controls']).toBe(content.spread.id);
		expect(content.spread['aria-labelledby']).toBe(trigger.spread.id);
		expect(content.spread.id).not.toBe(trigger.spread.id); // distinct atoms
	});

	it('projects data-state onto both trigger and content — the CSS-animation hook', () => {
		const bond = makeBond();
		const trigger = bond.addAtom('trigger-btn', 'trigger');
		const content = bond.addAtom('panel', 'content');

		expect(trigger.spread['data-state']).toBe('closed');
		expect(content.spread['data-state']).toBe('closed');
		bond.model.disclosure.open();
		expect(trigger.spread['data-state']).toBe('open');
		expect(content.spread['data-state']).toBe('open');
	});

	it('projects aria-expanded from the disclosure, reactively', () => {
		const bond = makeBond();
		const trigger = bond.addAtom('trigger-btn', 'trigger');
		bond.addAtom('panel', 'content');

		expect(trigger.spread['aria-expanded']).toBe(false);
		bond.model.disclosure.open();
		expect(trigger.spread['aria-expanded']).toBe(true);

		// reactive: a $derived over the spread recomputes on toggle
		let expanded: unknown;
		const dispose = $effect.root(() => {
			$effect(() => {
				expanded = trigger.spread['aria-expanded'];
			});
		});
		flushSync();
		bond.model.disclosure.close();
		flushSync();
		expect(expanded).toBe(false);
		dispose();
	});

	it('applies options (contentRole, haspopup)', () => {
		const bond = new TestBond(new TestState());
		bond.capability(disclosureCapability(bond.model.disclosure));
		bond.capability(triggerContentLink({ haspopup: 'menu', contentRole: 'region' }));
		const trigger = bond.addAtom('trigger-btn', 'trigger');
		const content = bond.addAtom('panel', 'content');
		expect(trigger.spread['aria-haspopup']).toBe('menu');
		expect(content.spread.role).toBe('region');
	});

	it('resolves regardless of registration order', () => {
		const bond = makeBond();
		// content declared BEFORE trigger
		const content = bond.addAtom('panel', 'content');
		const trigger = bond.addAtom('trigger-btn', 'trigger');
		expect(trigger.spread['aria-controls']).toBe(content.spread.id);
		expect(content.spread['aria-labelledby']).toBe(trigger.spread.id);
	});
});

describe('tabPanelLink — tab ↔ tabpanel linkage', () => {
	it('is annotated as a Layer 1 relationship between tab and tabpanel roles', () => {
		const cap = tabPanelLink();
		expect(cap.slot).toBe(TAB_PANEL);
		expect(cap.meta).toMatchObject({
			projects: ['tab', 'tabpanel']
		});
	});

	it('cross-references ids and reflects active panel state', () => {
		const state = new TestState();
		const bond = new TestBond(state);
		bond.capability(tabPanelLink({ selected: () => state.selected }));
		const tab = bond.addAtom('tab', 'tab');
		const panel = bond.addAtom('panel', 'tabpanel');

		expect(tab.spread.role).toBe('tab');
		expect(tab.spread['aria-controls']).toBe(panel.spread.id);
		expect(tab.spread['aria-selected']).toBe(false);
		expect(panel.spread.role).toBe('tabpanel');
		expect(panel.spread['aria-labelledby']).toBe(tab.spread.id);
		expect(panel.spread.hidden).toBe(true);
		expect(panel.spread.tabindex).toBe(-1);

		state.selected = true;
		expect(tab.spread['aria-selected']).toBe(true);
		expect(panel.spread.hidden).toBeUndefined();
		expect(panel.spread.tabindex).toBe(0);
	});
});

describe('errorMessageLink — error message ↔ control linkage', () => {
	it('is annotated as a Layer 1 relationship between control and error roles', () => {
		const cap = errorMessageLink();
		expect(cap.slot).toBe(ERROR_MESSAGE);
		expect(cap.meta).toMatchObject({
			projects: ['control', 'error']
		});
	});

	it('emits errormessage only while invalid and can mark the message as live', () => {
		const state = new TestState();
		const bond = new TestBond(state);
		bond.capability(errorMessageLink({ invalid: () => state.invalid, live: true }));
		const control = bond.addAtom('ctl', 'control');
		const error = bond.addAtom('err', 'error');

		expect(control.spread['aria-errormessage']).toBeUndefined();
		expect(control.spread['aria-invalid']).toBeUndefined();
		expect(error.spread.role).toBe('alert');

		state.invalid = true;
		expect(control.spread['aria-errormessage']).toBe(error.spread.id);
		expect(control.spread['aria-invalid']).toBe('true');
	});
});

describe('rowColumnCellLink — row/column/cell grid linkage', () => {
	it('is annotated as a Layer 1 relationship across row, column, and cell roles', () => {
		const cap = rowColumnCellLink();
		expect(cap.slot).toBe(ROW_COLUMN_CELL);
		expect(cap.meta).toMatchObject({
			projects: ['row', 'column', 'cell']
		});
	});

	it('labels a cell from row and column headers', () => {
		const bond = new TestBond(new TestState());
		bond.capability(rowColumnCellLink());
		const row = bond.addAtom('row', 'row');
		const column = bond.addAtom('column', 'column');
		const cell = bond.addAtom('cell', 'cell');

		expect(row.spread.role).toBe('row');
		expect(column.spread.role).toBe('columnheader');
		expect(cell.spread.role).toBe('gridcell');
		expect(cell.spread['aria-labelledby']).toBe(`${row.spread.id} ${column.spread.id}`);
		expect(cell.spread.headers).toBeUndefined();
	});
});

describe('treeItemGroupLink — treeitem ↔ child group linkage', () => {
	it('is annotated as a Layer 1 relationship between treeitem and treegroup roles', () => {
		const cap = treeItemGroupLink();
		expect(cap.slot).toBe(TREE_ITEM_GROUP);
		expect(cap.requires).toEqual([DISCLOSURE]);
		expect(cap.meta).toMatchObject({
			projects: ['treeitem', 'treegroup']
		});
	});

	it('cross-references ids and reflects disclosure expansion', () => {
		const state = new TestState();
		const bond = new TestBond(state);
		bond.capability(disclosureCapability(state.disclosure));
		bond.capability(treeItemGroupLink());
		const item = bond.addAtom('item', 'treeitem');
		const group = bond.addAtom('group', 'treegroup');

		expect(item.spread.role).toBe('treeitem');
		expect(item.spread['aria-controls']).toBe(group.spread.id);
		expect(item.spread['aria-expanded']).toBe(false);
		expect(group.spread.role).toBe('group');
		expect(group.spread['aria-labelledby']).toBe(item.spread.id);

		state.disclosure.open();
		expect(item.spread['aria-expanded']).toBe(true);
	});
});

describe('liveRegionRelationship — live region announcement attrs', () => {
	it('configures announcement attrs on the default live role', () => {
		const bond = new TestBond(new TestState());
		const cap = liveRegionRelationship({
			politeness: 'assertive',
			atomic: true,
			relevant: 'additions text'
		});
		bond.capability(cap);
		const live = bond.addAtom('live', 'live');

		expect(cap.slot).toBe(LIVE_REGION);
		expect(cap.meta).toMatchObject({ projects: ['live'] });
		expect(live.spread.role).toBe('status');
		expect(live.spread['aria-live']).toBe('assertive');
		expect(live.spread['aria-atomic']).toBe('true');
		expect(live.spread['aria-relevant']).toBe('additions text');
	});

	// Toast and Alert announce from the same atom `labelledControl` labels, so the projected role
	// is configurable and labelling stays with labelledControl.
	it('announces from a caller-named role and emits only the attrs asked for', () => {
		const bond = new TestBond(new TestState());
		bond.capability(labelledControl());
		bond.capability(liveRegionRelationship({ role: 'control', liveRole: 'alert' }));
		const label = bond.addAtom('label', 'label');
		const control = bond.addAtom('control', 'control');

		expect(control.spread.role).toBe('alert');
		// role="alert" already implies assertive/atomic — neither is duplicated onto the element.
		expect(control.spread['aria-live']).toBeUndefined();
		expect(control.spread['aria-atomic']).toBeUndefined();
		// Labelling still comes from labelledControl, not from the live region.
		expect(control.spread['aria-labelledby']).toBe(label.spread.id);
	});
});

describe('labelledControl — label/description → control (field pattern)', () => {
	function fieldBond(opts = {}) {
		const bond = new TestBond(new TestState());
		bond.capability(labelledControl(opts));
		return bond;
	}

	it('is annotated as a Layer 1 relationship for control labelling', () => {
		expect(labelledControl().meta).toMatchObject({
			projects: ['control', 'label', 'description']
		});
		expect(labelledControl({ nativeFor: true }).meta).toMatchObject({
			projects: ['control', 'label', 'description']
		});
	});

	it('control references its label and description ids', () => {
		const bond = fieldBond();
		const label = bond.addAtom('lbl', 'label');
		const control = bond.addAtom('ctl', 'control');
		const description = bond.addAtom('desc', 'description');

		expect(control.spread['aria-labelledby']).toBe(label.spread.id);
		expect(control.spread['aria-describedby']).toBe(description.spread.id);
	});

	it('omits a reference when the sibling is absent', () => {
		const bond = fieldBond();
		const label = bond.addAtom('lbl', 'label');
		const control = bond.addAtom('ctl', 'control');
		// no description atom
		expect(control.spread['aria-labelledby']).toBe(label.spread.id);
		expect(control.spread['aria-describedby']).toBeUndefined();
	});

	it('nativeFor emits `for` on the label pointing at the control', () => {
		const bond = fieldBond({ nativeFor: true });
		const label = bond.addAtom('lbl', 'label');
		const control = bond.addAtom('ctl', 'control');
		expect(label.spread.for).toBe(control.spread.id);
	});
});
