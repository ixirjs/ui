import { describe, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import { Bond, BondState, Atom, bondContextKey, type BondStateProps } from '../../bond';
import { createDisclosure, disclosureCapability, DISCLOSURE } from './disclosure.svelte';
import {
	triggerContentLink,
	labelledControl,
	tabPanelLink,
	errorMessageLink,
	activeDescendantLink,
	rowColumnCellLink,
	treeItemGroupLink,
	menuSubmenuRelationship,
	optionCollectionRelationship,
	headingSectionRelationship,
	liveRegionRelationship,
	TRIGGER_CONTENT,
	TAB_PANEL,
	ERROR_MESSAGE,
	ROW_COLUMN_CELL,
	TREE_ITEM_GROUP,
	ACTIVE_DESCENDANT,
	MENU_SUBMENU,
	OPTION_COLLECTION,
	HEADING_SECTION,
	LIVE_REGION
} from './relationship.svelte';

class TestState extends BondState<BondStateProps> {
	open = $state(false);
	selected = $state(false);
	invalid = $state(false);
	activeId = $state<string | undefined>();
	disclosure = createDisclosure({
		get: () => this.open,
		set: (v) => (this.open = v)
	});
	constructor() {
		super({});
	}
}

class TestBond extends Bond<BondStateProps> {
	static CONTEXT_KEY = bondContextKey('test-relationship');
	constructor(state: TestState) {
		super(state, 'test');
	}

	override get state(): TestState {
		return super.state as TestState;
	}

	// Register a TestAtom under `key` playing `role` via the production registry path.
	addAtom(key: string, role: string, ctx?: unknown) {
		const atom = new TestAtom(this, key).role(role, ctx);
		this.register(atom, { key });
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
	bond.state.capability(disclosureCapability(bond.state.disclosure));
	bond.state.capability(triggerContentLink(bond.state.disclosure, { contentRole: 'region' }));
	return bond;
}

describe('triggerContentLink — reusable trigger ↔ content a11y linkage', () => {
	it('is annotated as a Layer 1 relationship between trigger and content roles', () => {
		const bond = new TestBond(new TestState());
		const cap = triggerContentLink(bond.state.disclosure);
		expect(cap.meta).toMatchObject({
			layer: 1,
			kind: 'relationship',
			projects: ['trigger', 'content'],
			requiresRoles: ['trigger', 'content']
		});
		expect(cap.slot).toBe(TRIGGER_CONTENT);
		expect(cap.requires).toEqual([DISCLOSURE]);
		expect(cap.surface).toBeUndefined();
	});

	it('cross-references ids both ways via atomByRole', () => {
		const bond = makeBond();
		const trigger = bond.addAtom('trigger-btn', 'trigger');
		const content = bond.addAtom('panel', 'content');

		// trigger points at content's id; content points back at trigger's id
		expect(trigger.spread['aria-controls']).toBe(content.spread.id);
		expect(content.spread['aria-labelledby']).toBe(trigger.spread.id);
		expect(content.spread.id).not.toBe(trigger.spread.id); // distinct atoms
	});

	it('projects aria-expanded from the disclosure, reactively', () => {
		const bond = makeBond();
		const trigger = bond.addAtom('trigger-btn', 'trigger');
		bond.addAtom('panel', 'content');

		expect(trigger.spread['aria-expanded']).toBe(false);
		bond.state.disclosure.open();
		expect(trigger.spread['aria-expanded']).toBe(true);

		// reactive: a $derived over the spread recomputes on toggle
		let expanded: unknown;
		const dispose = $effect.root(() => {
			$effect(() => {
				expanded = trigger.spread['aria-expanded'];
			});
		});
		flushSync();
		bond.state.disclosure.close();
		flushSync();
		expect(expanded).toBe(false);
		dispose();
	});

	it('applies options (contentRole, haspopup)', () => {
		const bond = new TestBond(new TestState());
		bond.state.capability(disclosureCapability(bond.state.disclosure));
		bond.state.capability(
			triggerContentLink(bond.state.disclosure, { haspopup: 'menu', contentRole: 'region' })
		);
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
			layer: 1,
			kind: 'relationship',
			projects: ['tab', 'tabpanel'],
			requiresRoles: ['tab', 'tabpanel']
		});
	});

	it('cross-references ids and reflects active panel state', () => {
		const state = new TestState();
		const bond = new TestBond(state);
		bond.state.capability(tabPanelLink({ selected: (bond) => (bond.state as TestState).selected }));
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
			layer: 1,
			kind: 'relationship',
			projects: ['control', 'error'],
			requiresRoles: ['control', 'error']
		});
	});

	it('emits errormessage only while invalid and can mark the message as live', () => {
		const state = new TestState();
		const bond = new TestBond(state);
		bond.state.capability(
			errorMessageLink({ invalid: (bond) => (bond.state as TestState).invalid, live: true })
		);
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
			layer: 1,
			kind: 'relationship',
			projects: ['row', 'column', 'cell'],
			requiresRoles: ['row', 'column', 'cell']
		});
	});

	it('labels a cell from row and column headers', () => {
		const bond = new TestBond(new TestState());
		bond.state.capability(rowColumnCellLink());
		const row = bond.addAtom('row', 'row');
		const column = bond.addAtom('column', 'column');
		const cell = bond.addAtom('cell', 'cell');

		expect(row.spread.role).toBe('row');
		expect(column.spread.role).toBe('columnheader');
		expect(cell.spread.role).toBe('gridcell');
		expect(cell.spread.headers).toBe(`${row.spread.id} ${column.spread.id}`);
	});
});

describe('treeItemGroupLink — treeitem ↔ child group linkage', () => {
	it('is annotated as a Layer 1 relationship between treeitem and treegroup roles', () => {
		const state = new TestState();
		const cap = treeItemGroupLink(state.disclosure);
		expect(cap.slot).toBe(TREE_ITEM_GROUP);
		expect(cap.requires).toEqual([DISCLOSURE]);
		expect(cap.meta).toMatchObject({
			layer: 1,
			kind: 'relationship',
			projects: ['treeitem', 'treegroup'],
			requiresRoles: ['treeitem', 'treegroup']
		});
	});

	it('cross-references ids and reflects disclosure expansion', () => {
		const state = new TestState();
		const bond = new TestBond(state);
		bond.state.capability(disclosureCapability(state.disclosure));
		bond.state.capability(treeItemGroupLink(state.disclosure));
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

describe('activeDescendantLink — control/container → active item linkage', () => {
	it('is annotated as a Layer 1 relationship for active descendant ownership', () => {
		const cap = activeDescendantLink();
		expect(cap.slot).toBe(ACTIVE_DESCENDANT);
		expect(cap.meta).toMatchObject({
			layer: 1,
			kind: 'relationship',
			projects: ['control', 'container', 'item'],
			requiresRoles: ['control', 'container', 'item']
		});
	});

	it('points control and container roles at the active item id', () => {
		const state = new TestState();
		const bond = new TestBond(state);
		bond.state.capability(activeDescendantLink({ activeId: () => state.activeId }));
		const control = bond.addAtom('control', 'control');
		const container = bond.addAtom('container', 'container');
		const item = bond.addAtom('item', 'item', 'item-a');

		state.activeId = item.spread.id as string;
		expect(control.spread['aria-activedescendant']).toBe(item.spread.id);
		expect(container.spread['aria-activedescendant']).toBe(item.spread.id);
	});
});

describe('menuSubmenuRelationship — menuitem ↔ submenu linkage', () => {
	it('cross-references ids and reflects expanded state', () => {
		const state = new TestState();
		const bond = new TestBond(state);
		const cap = menuSubmenuRelationship({ expanded: () => state.open });
		bond.state.capability(cap);
		const item = bond.addAtom('item', 'menuitem');
		const submenu = bond.addAtom('submenu', 'submenu');

		expect(cap.slot).toBe(MENU_SUBMENU);
		expect(cap.meta).toMatchObject({
			layer: 1,
			kind: 'relationship',
			projects: ['menuitem', 'submenu']
		});
		expect(item.spread.role).toBe('menuitem');
		expect(item.spread['aria-controls']).toBe(submenu.spread.id);
		expect(item.spread['aria-haspopup']).toBe('menu');
		expect(item.spread['aria-expanded']).toBe(false);
		expect(submenu.spread.role).toBe('menu');
		expect(submenu.spread['aria-labelledby']).toBe(item.spread.id);

		state.open = true;
		expect(item.spread['aria-expanded']).toBe(true);
	});
});

describe('optionCollectionRelationship — option ↔ collection linkage', () => {
	it('projects collection/option roles and optional ownership ids', () => {
		const bond = new TestBond(new TestState());
		const cap = optionCollectionRelationship({
			collectionRole: 'radiogroup',
			optionRole: 'radio',
			optionIds: () => ['one', 'two']
		});
		bond.state.capability(cap);
		const collection = bond.addAtom('collection', 'collection');
		const option = bond.addAtom('option', 'option');

		expect(cap.slot).toBe(OPTION_COLLECTION);
		expect(cap.meta).toMatchObject({
			layer: 1,
			kind: 'relationship',
			projects: ['collection', 'option']
		});
		expect(collection.spread.role).toBe('radiogroup');
		expect(collection.spread['aria-owns']).toBe('one two');
		expect(option.spread.role).toBe('radio');
	});
});

describe('headingSectionRelationship — heading/description → section linkage', () => {
	it('labels section and surface roles from heading and description ids', () => {
		const bond = new TestBond(new TestState());
		const cap = headingSectionRelationship({ targetRole: 'region' });
		bond.state.capability(cap);
		const heading = bond.addAtom('heading', 'heading');
		const description = bond.addAtom('description', 'description');
		const section = bond.addAtom('section', 'section');
		const surface = bond.addAtom('surface', 'surface');

		expect(cap.slot).toBe(HEADING_SECTION);
		expect(cap.meta).toMatchObject({
			layer: 1,
			kind: 'relationship',
			projects: ['section', 'surface', 'heading', 'description']
		});
		expect(section.spread.role).toBe('region');
		expect(section.spread['aria-labelledby']).toBe(heading.spread.id);
		expect(section.spread['aria-describedby']).toBe(description.spread.id);
		expect(surface.spread['aria-labelledby']).toBe(heading.spread.id);
	});
});

describe('liveRegionRelationship — labelled live region linkage', () => {
	it('labels a live region and configures announcement attrs', () => {
		const bond = new TestBond(new TestState());
		const cap = liveRegionRelationship({ politeness: 'assertive', relevant: 'additions text' });
		bond.state.capability(cap);
		const title = bond.addAtom('title', 'title');
		const description = bond.addAtom('description', 'description');
		const live = bond.addAtom('live', 'live');
		bond.addAtom('content', 'content');

		expect(cap.slot).toBe(LIVE_REGION);
		expect(cap.meta).toMatchObject({
			layer: 1,
			kind: 'relationship',
			projects: ['live', 'title', 'description', 'content']
		});
		expect(live.spread.role).toBe('status');
		expect(live.spread['aria-live']).toBe('assertive');
		expect(live.spread['aria-atomic']).toBe('true');
		expect(live.spread['aria-relevant']).toBe('additions text');
		expect(live.spread['aria-labelledby']).toBe(title.spread.id);
		expect(live.spread['aria-describedby']).toBe(description.spread.id);
	});
});

describe('labelledControl — label/description → control (field pattern)', () => {
	function fieldBond(opts = {}) {
		const bond = new TestBond(new TestState());
		bond.state.capability(labelledControl(opts));
		return bond;
	}

	it('is annotated as a Layer 1 relationship for control labelling', () => {
		expect(labelledControl().meta).toMatchObject({
			layer: 1,
			kind: 'relationship',
			projects: ['control', 'description'],
			requiresRoles: ['control', 'label']
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
