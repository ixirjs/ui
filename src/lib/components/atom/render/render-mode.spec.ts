import { describe, expect, it } from 'vitest';
import { renderMode, type RenderMode, type RenderModeInput } from './render-mode';

/**
 * Direct coverage for the render-mode predicate.
 *
 * This exists because the predicate shipped without it and two defects rode along: `global`
 * defaulted to local where `html-element.svelte` defaults it to true, and an `animate`-only part was
 * routed by "any motion key" rather than by `enter ?? exit`. Both are pure-function properties that
 * a table test catches instantly, and neither was reachable from any component, so nothing else in
 * the suite could have caught them.
 */
const base: RenderModeInput = {
	isDiv: true,
	motion: {},
	attrs: {},
	base: undefined,
	canLeafTransition: true
};

const mode = (over: Partial<RenderModeInput>): RenderMode => renderMode({ ...base, ...over });

describe('renderMode', () => {
	it('sends a plain element to the literal-div leaf, and a non-div tag to the dynamic one', () => {
		expect(mode({})).toBe('div');
		expect(mode({ isDiv: false })).toBe('dynamic');
	});

	it('escalates to a renderer for a base, which only a component can mount', () => {
		expect(mode({ base: {} })).toBe('renderer');
	});

	// `oninit` and symbol lifecycle used to escalate. They are init-time work, and the seam runs at
	// init — Kernel calls `runLifecycle` itself — so they must NOT cost a component
	// boundary. They are not inputs to this predicate at all any more; this pins that they cannot
	// creep back in through the attrs path either.
	it('does not escalate for oninit or lifecycle symbols', () => {
		expect(mode({ attrs: { oninit: () => {} } })).toBe('div');
		expect(mode({ attrs: { [Symbol('@ixirjs/lifecycle/mount')]: () => {} } })).toBe('div');
	});

	// A preset is resolved before this predicate runs, so a preset-only element still reaches a leaf.
	// Escalating on it would put most of the library back on the component path.
	it('does not escalate for a preset alone', () => {
		expect(mode({ attrs: { class: 'x' } })).toBe('div');
	});

	describe('transitions', () => {
		const enter = { enter: () => ({}) };

		// The default is GLOBAL, matching html-element.svelte's `global = true`. Getting this backwards
		// stops consumer transitions playing on an ancestor's enter/exit — silently.
		it('defaults to the global leaf when `global` is absent', () => {
			expect(mode({ motion: enter })).toBe('divGlobal');
			expect(mode({ motion: enter, isDiv: false })).toBe('dynamicGlobal');
		});

		it('honours an explicit global', () => {
			expect(mode({ motion: enter, attrs: { global: true } })).toBe('divGlobal');
		});

		it('selects the local leaf only when `global` is explicitly false', () => {
			expect(mode({ motion: enter, attrs: { global: false } })).toBe('divLocal');
			expect(mode({ motion: enter, isDiv: false, attrs: { global: false } })).toBe('dynamicLocal');
		});

		it('routes on exit alone, not just enter', () => {
			expect(mode({ motion: { exit: () => ({}) } })).toBe('divGlobal');
		});

		// No rune, no leaf: a part whose transition appeared after init escalates as it always has.
		it('escalates when no motion instance exists to drive the leaf', () => {
			expect(mode({ motion: enter, canLeafTransition: false })).toBe('element');
		});
	});

	// `animate` drives measured geometry through an effect graph; only a transition gets a leaf.
	it('sends animate-only motion to HtmlElement, not a transition leaf', () => {
		expect(mode({ motion: { animate: () => {} } })).toBe('element');
	});

	it('sends a motionless element carrying renderer lifecycle attrs to HtmlElement', () => {
		for (const key of ['onmount', 'ondestroy', 'onintroend', 'onexitend', 'global']) {
			expect(mode({ attrs: { [key]: () => {} } })).toBe('element');
		}
	});
});
