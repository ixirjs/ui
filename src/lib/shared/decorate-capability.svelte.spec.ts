import { describe, it, expect } from 'vitest';
import {
	Bond,
	BondState,
	sharedCapabilityKey,
	decorateCapability,
	type Behavior,
	type Capability,
	type BondStateProps
} from './bond.svelte';

// decorateCapability lets a later registration WRAP the prior holder at a slot (delegate the rest)
// instead of the default blind last-wins replace — the capability-layer dual of atom behavior chaining.
const SLOT = sharedCapabilityKey<{ name: string }>('@svelte-atoms/test:decorate');

class S extends BondState<BondStateProps> {
	constructor() {
		super({});
	}
}

// Stand-in for a base policy (e.g. clickTrigger): projects on 'trigger' and 'label', has surface + requires.
function baseCapability(): Capability<{ name: string }> {
	return {
		slot: SLOT,
		surface: { name: 'base' },
		requires: [SLOT],
		behavior(role): Behavior | undefined {
			if (role === 'trigger') {
				return {
					attrs: () => ({ 'data-base': 1, 'aria-pressed': false }),
					handlers: () => ({ onclick: () => {} })
				};
			}
			if (role === 'label') return { attrs: () => ({ 'data-label': 1 }) };
			return undefined;
		}
	};
}

// behaviorsForRole returns Behavior[]; attrs/handlers take the bond, which these probes ignore.
const noBond = {} as Bond;

describe('decorateCapability', () => {
	it('overrides one role while delegating the rest, keeping a single holder at the slot', () => {
		const state = new S();
		state.capability(baseCapability());
		state.capability(
			decorateCapability(SLOT, {
				behavior: (role, _ctx, base) =>
					role !== 'trigger'
						? base
						: { ...base, attrs: (b) => ({ ...base?.attrs?.(b), 'data-extra': 2 }) }
			})
		);

		// Still exactly one capability projecting 'trigger' (wrapped, not appended).
		const trigger = state.behaviorsForRole('trigger');
		expect(trigger).toHaveLength(1);
		// Base attrs preserved AND the decoration's addition present.
		expect(trigger[0]!.attrs!(noBond)).toMatchObject({
			'data-base': 1,
			'aria-pressed': false,
			'data-extra': 2
		});
		// Handlers delegated straight through from the base (gesture untouched).
		expect(typeof (trigger[0]!.handlers!(noBond) as { onclick: unknown }).onclick).toBe('function');

		// A role the decoration doesn't touch delegates to the base unchanged.
		const label = state.behaviorsForRole('label');
		expect(label[0]!.attrs!(noBond)).toEqual({ 'data-label': 1 });
	});

	it('preserves the prior surface and requires by default', () => {
		const state = new S();
		state.capability(baseCapability());
		state.capability(decorateCapability(SLOT, { behavior: (_r, _c, base) => base }));

		const live = state.capability(SLOT)!;
		expect(live.surface).toEqual({ name: 'base' });
		expect(live.requires).toEqual([SLOT]);
	});

	it('wraps the surface when a surface decoration is supplied', () => {
		const state = new S();
		state.capability(baseCapability());
		state.capability(
			decorateCapability(SLOT, { surface: (base) => ({ name: `${base?.name ?? ''}+dec` }) })
		);

		expect(state.capability(SLOT)!.surface).toEqual({ name: 'base+dec' });
	});

	it('still supports blind replace for a plain (compose-less) capability', () => {
		const state = new S();
		state.capability(baseCapability());
		state.capability({
			slot: SLOT,
			surface: { name: 'replacement' },
			behavior: () => undefined
		} satisfies Capability<{ name: string }>);

		const live = state.capability(SLOT)!;
		expect(live.surface).toEqual({ name: 'replacement' });
		// Base 'trigger' projection is gone — full replacement, not a wrap.
		expect(state.behaviorsForRole('trigger')).toHaveLength(0);
	});
});
