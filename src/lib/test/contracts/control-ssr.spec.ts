import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import Probe, { type Control } from './control-ssr-probe.test.svelte';

/**
 * Server-render fidelity for the control, form and portal shapes.
 *
 * `family-ssr.spec.ts` covers bonded compound families. This complements it with form controls,
 * the file input, portal host, QR code, and stepper content host.
 *
 * When a snapshot moves, read the diff. A migration that is equivalence-preserving does not change
 * a byte; a changed `role`, a dropped `aria-*` or a class landing on the wrong side of the
 * consumer's own is the failure this exists to catch.
 */
const CONTROLS: Control[] = [
	'switch',
	'slider',
	'checkbox',
	'radio',
	'form',
	'input-file',
	'portal-host',
	'qr-code',
	'container',
	'stepper-content'
];

describe('control SSR fidelity', () => {
	for (const control of CONTROLS) {
		it(`renders ${control} identically`, () => {
			expect(render(Probe, { props: { control } }).body).toMatchSnapshot();
		});
	}
});
