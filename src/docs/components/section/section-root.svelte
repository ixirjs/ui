<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = { children: Snippet; class?: string };

	let { children, class: className = '' }: Props = $props();
</script>

<!--
	44px above the rule, and 14px between blocks inside it — the design's section rhythm.

	Spacing is margin between children rather than a flex `gap`, because a section body is often bare
	prose with inline `<code>` in it: as flex items each of those fragments became its own line.
-->
<section
	class={[
		'doc-prose text-muted-foreground mt-11 text-[14.5px] leading-[1.65] [&>*+*]:mt-3.5',
		className
	]}
>
	{@render children()}
</section>
