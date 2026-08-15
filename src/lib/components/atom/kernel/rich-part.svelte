<script lang="ts">
	import { onDestroy, untrack, type Snippet } from 'svelte';
	import type { Bond } from '$ixirjs/ui/shared/bond';
	import type { PresetKey, PresetLike } from '$ixirjs/ui/preset';
	import { useKernelElement, type KernelElementSeam } from './element.svelte';
	import { renderKernelElement } from './element-render.svelte';
	import type { KernelNode } from './index.svelte';

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	type Body = Snippet<[any]> | Snippet;

	let {
		node,
		body = undefined,
		bodyArg = undefined
	}: { node: KernelNode; body?: Body; bodyArg?: unknown } = $props();

	const initial = untrack(() => node);
	const atom = initial.descriptor?.materialize() ?? initial.plan.node.create(initial.bond as Bond);
	if (!initial.descriptor) {
		atom.activateCapabilities(initial.bond);
		onDestroy(() => atom.destroyCapabilities());
	}
	const seam: KernelElementSeam = {
		atom,
		bond: initial.bond,
		get preset() {
			return (node.source.preset ?? atom.preset) as PresetKey | undefined;
		},
		get presetLayer() {
			return (node.source.presetLayer ?? initial.bond?.presetLayer(initial.plan.slot)) as
				| PresetLike
				| undefined;
		}
	};
	const el = useKernelElement(seam, () => {
		const source = node.source;
		return {
			...source,
			as: source.as ?? initial.plan.as,
			class: [initial.plan.class, node.beforePreset(), '$preset', source.class]
		};
	});
</script>

{@render renderKernelElement(el, body, bodyArg)}
