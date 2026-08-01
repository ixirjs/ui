import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import BindHarness from '$ixirjs/ui/test/shared/bond/bind-harness.test.svelte';
import { bindBond } from './bind.svelte';
import { Bond } from './bond.svelte';
import type { BondStateProps } from './types';

type Props = BondStateProps & {
	open?: boolean;
	label?: string;
	locked?: boolean;
	presets?: Record<string, unknown>;
};

class ProbeBond extends Bond<Props> {
	constructor(props: Props) {
		super(props, 'bind-props-probe');
	}
}

/**
 * The props object a root hands its Bond is assembled from property descriptors, so these assert
 * the descriptor contract directly rather than only the values it happens to produce. Enumerability
 * decides what a `stateProps` spread forwards to the DOM, and the identity seed must never be part
 * of that.
 */
describe('bindBond props assembly', () => {
	// bindBond owns an onDestroy, so every binding is created inside a component.
	function inComponent<T>(create: () => T): T {
		let value: T | undefined;
		render(BindHarness, {
			run: () => {
				value = create();
			}
		});
		return value as T;
	}

	function bind(overrides: Parameters<typeof bindBond<ProbeBond>>[2] = {}) {
		let open = false;
		return inComponent(() =>
			bindBond<ProbeBond>(
				(props) => new ProbeBond(props),
				{
					open: [
						() => open,
						(value) => {
							open = value ?? false;
						}
					],
					label: () => 'read-only'
				},
				overrides
			)
		);
	}

	it('exposes read/write cells and read-only cells as live accessors', () => {
		const binding = bind();
		const props = binding.bond.props;

		expect(props.open).toBe(false);
		props.open = true;
		expect(props.open).toBe(true);
		expect(props.label).toBe('read-only');
	});

	it('keeps a read-only cell read-only', () => {
		const props = bind().bond.props;
		const descriptor = Object.getOwnPropertyDescriptor(props, 'label');
		expect(typeof descriptor?.get).toBe('function');
		expect(descriptor?.set).toBeUndefined();
	});

	it('makes every cell enumerable so state props forward to the element', () => {
		const props = bind().bond.props;
		expect(Object.keys(props).sort()).toEqual(['label', 'open']);
	});

	// The seed is SSR-deterministic identity, not a DOM id. If it were enumerable it would ride a
	// stateProps spread onto the element and collide with the consumer's own id.
	it('defines the identity seed non-enumerably and keeps it off spreads', () => {
		const binding = bind({ id: () => 'seed-1' });
		const props = binding.bond.props;

		expect(props.id).toBe('seed-1');
		expect(Object.keys(props)).not.toContain('id');
		expect({ ...binding.stateProps }).not.toHaveProperty('id');
		expect(Object.getOwnPropertyDescriptor(props, 'id')?.enumerable).toBe(false);
	});

	it('lets a declared id cell win over the identity seed', () => {
		const binding = inComponent(() =>
			bindBond<ProbeBond>(
				(props) => new ProbeBond(props),
				{ id: () => 'declared' },
				{ id: () => 'seed' }
			)
		);
		expect(binding.bond.props.id).toBe('declared');
		expect(Object.keys(binding.bond.props)).toContain('id');
	});

	it('layers static base values under the cells that override them', () => {
		const binding = inComponent(() =>
			bindBond<ProbeBond>(
				(props) => new ProbeBond(props),
				{ label: () => 'from-cell' },
				{ base: () => ({ label: 'from-base', locked: true }) }
			)
		);
		const props = binding.bond.props;

		expect(props.label).toBe('from-cell');
		expect(props.locked).toBe(true);
		// A base entry the cells did not claim stays an ordinary writable data property.
		const descriptor = Object.getOwnPropertyDescriptor(props, 'locked');
		expect(descriptor?.writable).toBe(true);
		expect(descriptor?.get).toBeUndefined();
	});

	it('honours a cell config that opts into configurability', () => {
		const binding = inComponent(() =>
			bindBond<ProbeBond>(
				(props) => new ProbeBond(props),
				{ label: [() => 'x', () => {}, { configurable: true, enumerable: false }] },
				{}
			)
		);
		const descriptor = Object.getOwnPropertyDescriptor(binding.bond.props, 'label');
		expect(descriptor?.configurable).toBe(true);
		expect(descriptor?.enumerable).toBe(false);
	});

	// Bond-owned presentation maps are consumed through bond.presetLayer(), never forwarded.
	it('keeps presets out of stateProps', () => {
		const binding = inComponent(() =>
			bindBond<ProbeBond>(
				(props) => new ProbeBond(props),
				{ presets: () => ({ title: { class: 'x' } }) },
				{}
			)
		);
		expect(binding.stateProps).not.toHaveProperty('presets');
		expect(binding.bond.props.presets).toEqual({ title: { class: 'x' } });
	});
});
