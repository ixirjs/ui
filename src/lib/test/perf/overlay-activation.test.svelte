<script module lang="ts">
	import { DialogBond, type DialogBondProps } from '$ixirjs/ui/components/dialog/bond.svelte';
	import { ESCAPE } from '$ixirjs/ui/components/overlay/policies/escape.svelte';
	import { FOCUS } from '$ixirjs/ui/components/overlay/policies/focus.svelte';
	import { BODY_SCROLL_LOCK, INERT_SIBLINGS } from '$ixirjs/ui/shared/capability/models';
	import { defineCapability } from '$ixirjs/ui/shared/capability';

	export type ActivationArm = 'construct' | 'activate' | 'stripped';

	// Setup-free stand-ins at the same four slots. Last-wins registration replaces the bundle's
	// effectful policies, so the `stripped` arm measures the floor a perfect deferral could reach for
	// an overlay that is never opened: same Bond, same atoms, same context — no lifecycle owner.
	const INERT_STANDINS = [
		defineCapability({ slot: ESCAPE, surface: (() => undefined) as never }),
		defineCapability({
			slot: FOCUS,
			surface: { restoreFocus: 'none', captureFocusOnOpen: false } as never
		}),
		defineCapability({ slot: BODY_SCROLL_LOCK, surface: { locked: false } as never }),
		defineCapability({ slot: INERT_SIBLINGS, surface: undefined as never })
	];
</script>

<script lang="ts">
	import { untrack } from 'svelte';

	let { n = 100, arm = 'construct' }: { n?: number; arm?: ActivationArm } = $props();

	// The whole measurement runs in the component's init context: `escapePolicy`'s setup reads
	// context through `Bond.get()`, which throws outside one. Both props are read through `untrack`
	// because this is a one-shot measurement — a reactive read would re-run it.
	const bonds: DialogBond[] = [];
	const start = performance.now();
	untrack(() => {
		for (let i = 0; i < n; i++) {
			const props = $state<DialogBondProps>({ open: false, disabled: false });
			const bond = DialogBond.create(props);
			if (arm === 'stripped') for (const standin of INERT_STANDINS) bond.capability(standin);
			if (arm !== 'construct') bond.activateCapabilities();
			bonds.push(bond);
		}
	});
	export const elapsed = performance.now() - start;
	export const teardown = () => {
		for (const bond of bonds) bond.destroy();
	};
</script>
