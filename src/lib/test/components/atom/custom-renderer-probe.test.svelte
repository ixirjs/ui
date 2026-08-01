<script lang="ts">
	import { HtmlAtom, componentBase } from '$ixirjs/ui/components/atom';
	import CustomRenderer from './custom-renderer.test.svelte';

	// `received` is filled by the custom renderer with the prop names it was handed, so the spec can
	// assert on HtmlElement-private props leaking across the `base` seam.
	let { received = [] }: { received?: string[] } = $props();
</script>

<HtmlAtom
	base={componentBase(CustomRenderer)}
	class="probe-class"
	data-testid="custom"
	{received}
/>
