<script lang="ts">
	import { Container } from '$lib/components/container';

	let width = $state(0);
</script>

<Container type="inline-size" bind:clientWidth={width} class="resize-x overflow-auto border p-4">
	<p class="text-sm">This box is a container query context.</p>
	<code class="text-muted-foreground text-xs">clientWidth = {Math.round(width)}px</code>
</Container>
