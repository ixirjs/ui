import { describe, expect, it } from 'vitest';
import { TreeBond, type ITreeNode, type TreeBondProps } from './bond.svelte';

function node(id: string, parent?: TreeBond, props: Partial<TreeBondProps> = {}) {
	const value = new TreeBond({ id, open: true, ...props }, parent);
	value.headerId = id;
	parent?.attachChild(id, value);
	return value;
}

class CustomTree extends TreeBond {
	override get visibleHeaderIds() {
		return ['custom'];
	}
}

describe('visible tree traversal', () => {
	it('keeps preorder, prunes collapsed/disabled branches and reads plain mutations live', () => {
		const root = node('root');
		root.headerId = undefined;
		const a = node('a', root);
		node('a1', a);
		node('hidden', node('b', root, { open: false }));
		node('disabled-child', node('c', root, { disabled: true }));
		const headerless = node('d', root);
		headerless.headerId = undefined;
		node('d1', headerless);
		expect(root.visibleHeaderIds).toEqual(['a', 'a1', 'b', 'd1']);
		a.props.open = false;
		expect(root.visibleHeaderIds).toEqual(['a', 'b', 'd1']);
		headerless.props.disabled = true;
		expect(root.visibleHeaderIds).toEqual(['a', 'b']);
		const late = node('late', root);
		const detach = root.attachChild('late', late);
		expect(root.visibleHeaderIds).toEqual(['a', 'b', 'late']);
		detach();
		expect(root.visibleHeaderIds).toEqual(['a', 'b']);
	});

	it('honors subclass, instance and structural node visibility contracts', () => {
		const root = node('root');
		root.attachChild('custom', new CustomTree({ open: false, disabled: true }, root));
		const own = node('own', root);
		Object.defineProperty(own, 'visibleHeaderIds', { get: () => ['instance'] });
		const adapter: ITreeNode = {
			keyboardOwner: root,
			focusedId: null,
			props: { open: false, disabled: true },
			headerId: undefined,
			isOpen: false,
			visibleHeaderIds: ['adapter'],
			attachChild: () => () => {},
			notifyFocused() {},
			focusNode() {},
			move: () => false
		};
		root.attachChild('adapter', adapter);
		expect(root.visibleHeaderIds).toEqual(['root', 'custom', 'instance', 'adapter']);
	});

	it('walks a 10,000-level native chain without recursive calls', () => {
		const root = node('0');
		let parent = root;
		for (let i = 1; i < 10000; i++) parent = node(String(i), parent);
		const ids = root.visibleHeaderIds;
		expect(ids).toHaveLength(10000);
		expect(ids[0]).toBe('0');
		expect(ids[9999]).toBe('9999');
	});

	it('copies each visible header only once on deep native chains', () => {
		for (const n of [100, 200, 400]) {
			const root = node('0');
			let parent = root;
			for (let i = 1; i < n; i++) parent = node(String(i), parent);
			let copies = 0;
			const push = Array.prototype.push;
			let ids: readonly string[];
			try {
				Array.prototype.push = function (...values) {
					for (const value of values) if (typeof value === 'string') copies++;
					return push.apply(this, values);
				};
				ids = root.visibleHeaderIds;
			} finally {
				Array.prototype.push = push;
			}
			expect(ids).toEqual(Array.from({ length: n }, (_, i) => String(i)));
			expect(copies).toBeLessThanOrEqual(n);
		}
	});
});
