<script lang="ts">
	import KernelElement from '$ixirjs/ui/test/components/atom/kernel-element.test.svelte';

	let { lifecycleProps = {}, ...rest } = $props();
</script>

<KernelElement {...rest} {...lifecycleProps}>hello-ssr</KernelElement>
