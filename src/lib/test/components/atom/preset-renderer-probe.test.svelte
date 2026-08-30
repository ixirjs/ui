<script lang="ts">
	import { componentBase } from '$ixirjs/ui/authoring';
	import KernelElement from '$ixirjs/ui/test/components/atom/kernel-element.test.svelte';
	import { setPreset } from '$ixirjs/ui/preset';
	import CustomRenderer from './custom-renderer.test.svelte';

	// A renderer named by the PRESET rather than by the call site — `render.base`, the sibling of the
	// `render.as` every preset can already set. The atom below passes no `base` at all, so the only
	// thing that can mount `CustomRenderer` is preset resolution.
	//
	// This is the shape that makes `presentation.base` load-bearing in Kernel's dispatch.
	// Reading the destructured `base` prop instead — which is `undefined` here — routes the atom to
	// the plain `div` leaf, where it renders the preset's CLASSES correctly and silently drops the
	// preset's RENDERER. Correct-looking output, wrong element, invisible in a class diff.
	let { received = [] }: { received?: string[] } = $props();

	// `button` only because `PresetKey` is the closed union of shipped module names — nothing here is
	// about buttons. `variant-selectors.test.svelte` borrows the same key for the same reason.
	setPreset({
		button: () => ({
			class: 'from-preset',
			render: { base: componentBase(CustomRenderer) }
		})
	});
</script>

<KernelElement preset="button" data-testid="preset-renderer" {received} />
