<script lang="ts">
	import HtmlAtom from '$ixirjs/ui/components/atom/html-atom.svelte';

	let { lifecycleProps = {}, ...rest } = $props();
</script>

<HtmlAtom {...rest} {...lifecycleProps}>hello-ssr</HtmlAtom>
