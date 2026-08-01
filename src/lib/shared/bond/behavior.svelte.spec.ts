import { describe, expect, it, vi } from 'vitest';
import { Bond, Atom, type Behavior, type BondStateProps } from './index';
import { clickTrigger } from '$svelte-atoms/core/components/portal/host/policies/trigger.svelte';

// Specs for Atom.behavior() — the generic behavior-composition seam.
// The last describe proves the real ClickTrigger policy works through use() and coexists with the atom's own handler.

class TestBond extends Bond<BondStateProps> {
	toggles = 0;

	constructor() {
		super({ id: 'test' }, 'test');
	}

	toggle() {
		this.toggles++;
	}

	share(): this {
		return this;
	}
}

class TestAtom extends Atom<TestBond> {
	clicks = 0;

	constructor(bond: TestBond) {
		super(bond, 'root');
	}

	override get attrs() {
		return { ...super.attrs, role: 'button', 'data-own': 'atom' };
	}

	override get handlers(): Record<string, unknown> {
		return {
			onclick: () => {
				this.clicks++;
			}
		};
	}
}

class PreventingAtom extends TestAtom {
	override get handlers() {
		return {
			onclick: (event: MouseEvent) => {
				this.clicks++;
				event.preventDefault();
			}
		};
	}
}

const newAtom = () => new TestAtom(new TestBond());

describe('Atom.use — attrs', () => {
	it('merges behaviour attrs over the atom with a dev conflict diagnostic', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const atom = newAtom().behavior({
			attrs: () => ({ 'data-own': 'behavior', 'data-extra': '1' })
		});

		const s = atom.spread;
		expect(s['data-own']).toBe('behavior'); // behaviour overrode the atom's value
		expect(s['data-extra']).toBe('1'); // behaviour-only attr present
		expect(s.role).toBe('button'); // untouched atom attr survives
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('data attribute "data-own"'));
		warn.mockRestore();
	});
});

describe('Atom.use — handlers', () => {
	it('CHAINS a colliding handler — atom first, then behaviour; both run', () => {
		const atom = newAtom();
		let behaviorClicks = 0;
		atom.behavior({ handlers: () => ({ onclick: () => behaviorClicks++ }) });

		(atom.spread.onclick as () => void)();

		expect(atom.clicks).toBe(1); // atom's own handler still fired
		expect(behaviorClicks).toBe(1); // behaviour's handler also fired
	});

	it('layers multiple behaviours in registration order', () => {
		const order: string[] = [];
		const atom = newAtom()
			.behavior({ handlers: () => ({ onclick: () => order.push('a') }) })
			.behavior({ handlers: () => ({ onclick: () => order.push('b') }) });

		(atom.spread.onclick as () => void)();

		// atom handler (clicks) + a + b, in order
		expect(order).toEqual(['a', 'b']);
		expect(atom.clicks).toBe(1);
	});

	it('skips internal behaviour handlers once the atom handler prevents default', () => {
		const atom = new PreventingAtom(new TestBond());
		let behaviorClicks = 0;
		atom.behavior({ handlers: () => ({ onclick: () => behaviorClicks++ }) });

		(atom.spread.onclick as (event: MouseEvent) => void)(
			new MouseEvent('click', { cancelable: true })
		);

		expect(atom.clicks).toBe(1);
		expect(behaviorClicks).toBe(0);
	});
});

describe('Atom.use — onmount', () => {
	it('runs the behaviour onmount via a spread attachment and honours cleanup', () => {
		let mounted = 0;
		let cleaned = 0;
		const atom = newAtom().behavior({
			onmount: () => {
				mounted++;
				return () => cleaned++;
			}
		});

		const s = atom.spread;
		const cleanups = Object.getOwnPropertySymbols(s).map((sym) =>
			(s[sym] as (node: Element) => void | (() => void))({} as Element)
		);
		expect(mounted).toBe(1);

		cleanups.forEach((c) => typeof c === 'function' && c());
		expect(cleaned).toBe(1);
	});
});

describe('Atom.use — reuse across atoms', () => {
	it('the same behaviour object applies to unrelated atoms', () => {
		const tag: Behavior<TestBond> = { attrs: () => ({ 'data-reused': 'yes' }) };
		const a1 = newAtom().behavior(tag);
		const a2 = newAtom().behavior(tag);

		expect(a1.spread['data-reused']).toBe('yes');
		expect(a2.spread['data-reused']).toBe('yes');
	});
});

describe('proof: clickTrigger behavior re-expressed through use()', () => {
	it('the real Overlay policy behavior toggles the bond AND chains with the atom handler', () => {
		const bond = new TestBond();
		const atom = new TestAtom(bond);
		// Extract the trigger role's behavior from the click policy and apply it directly.
		atom.behavior(clickTrigger().behavior!('trigger')! as unknown as Behavior<TestBond>);

		(atom.spread.onclick as (ev: MouseEvent) => void)({
			button: 0,
			defaultPrevented: false
		} as MouseEvent);

		expect(bond.toggles).toBe(1); // strategy ran through the generic seam
		expect(atom.clicks).toBe(1); // atom's own onclick was NOT clobbered
	});
});
