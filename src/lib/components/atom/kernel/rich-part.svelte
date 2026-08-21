<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import { useKernelElement } from './element.svelte';
	import { branchForMode } from './element-render.svelte';
	import type { KernelNode } from './index.svelte';

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	type Body = Snippet<[any]> | Snippet;

	let {
		node,
		body = undefined,
		bodyArg = undefined
	}: { node: KernelNode; body?: Body; bodyArg?: unknown } = $props();

	// LATE escalation only. A part that is rich when it initializes builds its element through the
	// leaf seam, where init is still open and no component boundary is needed; this file is reached
	// when a consumer's props turn rich AFTER init, which is the one case that genuinely needs a
	// deferred rune-init context — and a component is the only one Svelte offers.
	//
	// The node IS the seam: it already exposes `atom` (a lazy getter over the descriptor, so nothing
	// materializes earlier than the presentation that reads it), `bond`, `preset` and `presetLayer`
	// with exactly the fallbacks this file used to restate. It also owns `elementConfig`, so the init
	// and late lanes cannot describe the same element two different ways.
	const initial = untrack(() => node);
	const el = useKernelElement(initial, initial.elementConfig);
</script>

{@render branchForMode(el.mode())(el, body, bodyArg)}
