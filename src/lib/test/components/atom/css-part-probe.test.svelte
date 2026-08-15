<script lang="ts">
	import KernelElement from '$ixirjs/ui/test/components/atom/kernel-element.test.svelte';

	// `part` is a named rich prop that must still reach the DOM as the CSS shadow-parts attribute.
	let { part = undefined }: { part?: string | undefined } = $props();
</script>

<KernelElement {part} class="seam-probe" data-testid="seam" />
