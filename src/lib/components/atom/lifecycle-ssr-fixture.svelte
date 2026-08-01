<script lang="ts">
	import HtmlAtom from './html-atom.svelte';

	let { lifecycleProps = {}, ...rest } = $props();
</script>

<HtmlAtom {...rest} {...lifecycleProps}>hello-ssr</HtmlAtom>
