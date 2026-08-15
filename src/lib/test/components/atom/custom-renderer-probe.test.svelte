<script lang="ts">
	import { componentBase } from '$ixirjs/ui/components/atom';
	import KernelElement from '$ixirjs/ui/test/components/atom/kernel-element.test.svelte';
	import CustomRenderer from './custom-renderer.test.svelte';

	// `received` is filled by the custom renderer with the prop names it was handed, so the spec can
	// assert on HtmlElement-private props leaking across the `base` seam.
	let { received = [] }: { received?: string[] } = $props();
</script>

<KernelElement
	base={componentBase(CustomRenderer)}
	class="probe-class"
	data-testid="custom"
	{received}
/>
