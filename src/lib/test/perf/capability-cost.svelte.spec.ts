import { describe, expect, it } from 'vitest';
import { DialogBond, type DialogBondProps } from '$ixirjs/ui/components/dialog/bond.svelte';
import { PopoverBond } from '$ixirjs/ui/components/popover/bond.svelte';
import { CollapsibleBond } from '$ixirjs/ui/components/collapsible/bond.svelte';
import { CardBond } from '$ixirjs/ui/components/card/bond.svelte';
import type { Capability } from '$ixirjs/ui/shared/capability';

/**
 * Phase A probe for the on-demand-init study: prices what a *closed* overlay registers.
 *
 * Not a perf test — it counts descriptors and setups, which are deterministic. The claim under
 * examination is that a closed overlay misses `CapabilityRuntime`'s setup-free fast path and pays
 * an `$effect.root` plus one effect per setup-declaring capability, to observe a state it is not in.
 */

function census(capabilities: readonly Capability[]) {
	const withSetup = capabilities.filter((capability) => capability.setup !== undefined);
	return {
		total: capabilities.length,
		setups: withSetup.length,
		setupSlots: withSetup.map((capability) =>
			String(capability.slot.description ?? capability.slot)
		)
	};
}

function report(label: string, capabilities: readonly Capability[]) {
	const c = census(capabilities);
	console.log(
		`${label.padEnd(12)} total=${c.total} setups=${c.setups}  ${c.setupSlots.join(', ')}`
	);
	return c;
}

describe('capability registration census (closed / inert bonds)', () => {
	it('a closed Dialog registers setup-declaring capabilities it cannot yet use', () => {
		const props = $state<DialogBondProps>({ open: false, disabled: false });
		const bond = DialogBond.create(props);
		const c = report('dialog', bond.capabilities);

		expect(bond.isOpen).toBe(false);
		// The premise: a closed dialog is not setup-free, so activation must allocate a lifecycle owner.
		expect(c.setups).toBeGreaterThan(0);
	});

	it('a closed Popover registers setup-declaring capabilities it cannot yet use', () => {
		const props = $state({ open: false, disabled: false });
		// Only `open`/`disabled` are read here; the positioning props are irrelevant to the census.
		const bond = PopoverBond.create(props as never);
		const c = report('popover', bond.capabilities);

		expect(bond.isOpen).toBe(false);
		expect(c.setups).toBeGreaterThan(0);
	});

	it('a Collapsible is setup-free — Population A, no lifecycle owner to defer', () => {
		const props = $state({ open: false, disabled: false });
		const bond = CollapsibleBond.create(props);
		const c = report('collapsible', bond.capabilities);

		expect(c.setups).toBe(0);
	});

	it('Card defers its only capability and allocates no host at all', () => {
		const bond = CardBond.create({ disabled: false, clickable: false });
		// Reading `capabilities` is itself what materializes the deferred thunk, so this measures the
		// post-observation count; the point is the shape, not that it stayed at zero.
		const c = report('card', bond.capabilities);

		expect(c.setups).toBe(0);
	});
});
