import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import {
	Atom,
	Bond,
	BondState,
	DATA_STATE,
	capabilityKey,
	ariaRole,
	defineAtom,
	dataState,
	defineCapability,
	defineAtomCapability,
	elementRef,
	focusable,
	pressable,
	type BondStateProps
} from './index';
import AtomProbe from './atom-probe.svelte';

const MODEL = capabilityKey<{ value: number }>('atom-test-model');

class LegacyState extends BondState<BondStateProps> {
	constructor(props: BondStateProps = {}) {
		super(props);
	}
}

class TestBond extends Bond<BondStateProps> {
	constructor(stateOrProps: LegacyState | BondStateProps = {}) {
		super(stateOrProps as LegacyState, 'atom-test');
	}
}

class TestAtom extends Atom<TestBond> {
	constructor(bond: TestBond, key = 'root') {
		super(bond, key);
	}
}

describe('Atom', () => {
	it('creates fixed-key atom classes with setup behavior', () => {
		const ButtonAtom = defineAtom<TestBond, HTMLButtonElement>('button', (atom) => {
			atom.capability(ariaRole('button'));
			atom.capability(dataState('ready'));
		});
		const bond = new TestBond(new LegacyState({ id: 'button-id' }));
		const atom = new ButtonAtom(bond);

		expect(atom).toBeInstanceOf(Atom);
		expect(atom.name).toBe('button');
		expect(atom.id).toBe('atom-test-button-button-id');
		expect(atom.spread.role).toBe('button');
		expect(atom.spread['data-state']).toBe('ready');
	});

	it('creates atom classes by extending an existing atom class', () => {
		const EnhancedAtom = defineAtom(TestAtom, (atom) => {
			atom.capability(dataState('enhanced'));
		});
		const bond = new TestBond(new LegacyState({ id: 'enhanced-id' }));
		const atom = new EnhancedAtom(bond);

		expect(atom).toBeInstanceOf(TestAtom);
		expect(atom.name).toBe('root');
		expect(atom.spread['data-state']).toBe('enhanced');
	});

	it('can exist without a Bond', () => {
		const node = new Atom(undefined, 'root', {
			namespace: 'standalone',
			id: 'node-id'
		});

		expect(node.id).toBe('standalone-root-node-id');
		expect(node.kind).toBe('standalone-root');
		expect(node.preset).toBe('standalone');
		expect(node.spread['data-kind']).toBe('standalone-root');
		expect(node.spread['data-bond']).toBeUndefined();

		expect(() => node.role('trigger')).not.toThrow();
		expect(node.hasRole('trigger')).toBe(true);
	});

	it('preserves stable attachment keys across spread reads', () => {
		const node = new Atom(undefined, 'item');

		const first = Object.getOwnPropertySymbols(node.spread);
		const second = Object.getOwnPropertySymbols(node.spread);

		expect(second).toEqual(first);
	});

	it('clears its mounted element when the attachment is destroyed', () => {
		const node = new Atom(undefined, 'root');
		const attachmentKey = Object.getOwnPropertySymbols(node.spread)[0]!;
		const attach = node.spread[attachmentKey] as (element: HTMLDivElement) => () => void;
		const element = document.createElement('div');

		const cleanup = attach(element);

		expect(node.element).toBe(element);

		cleanup();

		expect(node.element).toBeUndefined();
	});

	it('hosts bondless atom capabilities in spread', () => {
		const onPress = vi.fn();
		const node = new Atom(undefined, 'trigger', {
			namespace: 'node-cap',
			id: 'trigger-id'
		});

		node.capability(ariaRole('tab'));
		node.capability(dataState('active'));
		node.capability(focusable({ tabindex: 2 }));
		node.capability(pressable({ role: false, tabindex: false, onPress }));

		expect(node.spread.role).toBe('tab');
		expect(node.spread['data-state']).toBe('active');
		expect(node.spread['data-focusable']).toBe('');
		expect(node.spread.tabindex).toBe(2);

		const click = node.spread.onclick as (event: MouseEvent) => void;
		click(new MouseEvent('click'));

		const keydown = node.spread.onkeydown as (event: KeyboardEvent) => void;
		keydown(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }));

		expect(onPress).toHaveBeenCalledTimes(2);
		expect(node.capability(DATA_STATE)?.meta).toMatchObject({ kind: 'projection' });
		expect(node.describeCapabilities().map((capability) => capability.description)).toContain(
			'@svelte-atoms/atom:data-state'
		);
	});

	it('replaces atom capabilities by slot without keeping stale spread behavior', () => {
		const SLOT = capabilityKey<{ value: string }>('replaceable-atom-capability');
		const node = new Atom(undefined, 'root');

		node.capability(
			defineAtomCapability({
				slot: SLOT,
				surface: { value: 'first' },
				behavior: { attrs: () => ({ 'data-first': '' }) }
			})
		);
		node.capability(
			defineAtomCapability({
				slot: SLOT,
				surface: { value: 'second' },
				behavior: { attrs: () => ({ 'data-second': '' }) }
			})
		);

		expect(node.get(SLOT)).toEqual({ value: 'second' });
		expect(node.spread['data-first']).toBeUndefined();
		expect(node.spread['data-second']).toBe('');
	});

	it('runs atom capability mount callbacks with cleanup', () => {
		const seen: Array<Element | undefined> = [];
		const node = new Atom(undefined, 'root');
		node.capability(elementRef((element) => seen.push(element as Element | undefined)));

		const element = document.createElement('div');
		const cleanups = Object.getOwnPropertySymbols(node.spread)
			.map((key) => (node.spread[key] as (element: HTMLDivElement) => void | (() => void))(element))
			.filter((cleanup): cleanup is () => void => typeof cleanup === 'function');

		expect(node.element).toBe(element);
		expect(seen).toContain(element);

		for (let i = cleanups.length - 1; i >= 0; i--) cleanups[i]!();

		expect(node.element).toBeUndefined();
		expect(seen.at(-1)).toBeUndefined();
	});
});

describe('Atom compatibility', () => {
	it('is still a bonded Atom with the legacy attrs', () => {
		const bond = new TestBond(new LegacyState({ id: 'legacy-id' }));
		const atom = new TestAtom(bond);

		expect(atom).toBeInstanceOf(Atom);
		expect(atom.id).toBe('atom-test-root-legacy-id');
		expect(atom.spread['data-bond']).toBe('atom-test');
		expect(atom.spread['data-kind']).toBe('atom-test-root');
	});
});

describe('Bond registered Atom APIs', () => {
	it('registers, looks up, and unregisters a component-owned node', () => {
		const bond = new TestBond(new LegacyState({ id: 'registered-id' }));
		const node = new Atom(bond, 'trigger');

		const unregister = bond.register(node);

		expect(bond.node('trigger')).toBe(node);
		expect(bond.nodes()).toEqual([node]);
		expect(bond.elements.trigger).toBeUndefined();

		unregister();

		expect(bond.node('trigger')).toBeUndefined();
		expect(bond.nodes()).toEqual([]);
	});

	it('warns for duplicate single-node registrations', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const bond = new TestBond(new LegacyState());

		bond.register(new Atom(bond, 'content'));
		bond.register(new Atom(bond, 'content'));

		expect(warn).toHaveBeenCalledWith(expect.stringContaining('multiple nodes'));
		warn.mockRestore();
	});

	it('supports many-node registration', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const bond = new TestBond(new LegacyState());
		const first = new Atom(bond, 'item');
		const second = new Atom(bond, 'item');

		bond.register(first, { cardinality: 'many' });
		bond.register(second, { cardinality: 'many' });

		expect(bond.nodes('item')).toEqual([first, second]);
		expect(warn).not.toHaveBeenCalled();
		warn.mockRestore();
	});

	it('finds component-owned atoms by role', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const bond = new TestBond(new LegacyState());
		const node = new Atom(bond, 'header').role('trigger');

		bond.register(node, { key: 'header' });

		expect(bond.atomByRole('trigger')).toBe(node);

		warn.mockRestore();
	});
});

describe('merged Bond authoring facade', () => {
	it('constructs a Bond directly from props and adopts legacy state props', () => {
		const direct = new TestBond({ id: 'direct-id' });
		const legacy = new TestBond(new LegacyState({ id: 'legacy-id' }));

		expect(direct.id).toBe('direct-id');
		expect(direct.props.id).toBe('direct-id');
		expect(legacy.id).toBe('legacy-id');
		expect(legacy.props.id).toBe('legacy-id');
		expect(legacy.state).toBe(legacy);
	});

	it('exposes capability lookup on Bond', () => {
		const bond = new TestBond({ id: 'capability-id' });
		const surface = { value: 42 };

		bond.capability(
			defineCapability({
				slot: MODEL,
				surface
			})
		);

		expect(bond.get(MODEL)).toBe(surface);
		expect(bond.require(MODEL)).toBe(surface);
		expect(bond.capabilities).toHaveLength(1);
	});
});

describe('createAtomInstance', () => {
	it('registers during component init and unregisters on destroy', () => {
		const bond = new TestBond({ id: 'helper-id' });
		const { unmount } = render(AtomProbe, { bond, nodeKey: 'content' });

		const node = bond.node('content');
		expect(node).toBeInstanceOf(Atom);
		expect(node?.kind).toBe('atom-test-content');

		unmount();

		expect(bond.node('content')).toBeUndefined();
	});

	it('installs atom capabilities and tears setup down on destroy', () => {
		const bond = new TestBond({ id: 'helper-capability-id' });
		const cleanup = vi.fn();
		const setup = vi.fn(() => cleanup);

		const { unmount } = render(AtomProbe, {
			bond,
			nodeKey: 'trigger',
			capabilities: [
				defineAtomCapability({
					behavior: { attrs: () => ({ 'data-helper': 'ready' }) },
					setup
				})
			]
		});

		const node = bond.node('trigger');
		expect(node?.spread['data-helper']).toBe('ready');
		expect(setup).toHaveBeenCalledWith(node, bond);

		unmount();

		expect(cleanup).toHaveBeenCalledTimes(1);
		expect(bond.node('trigger')).toBeUndefined();
	});
});
