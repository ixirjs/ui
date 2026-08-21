<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = { children: Snippet; class?: string; id?: string };

	let { children, class: className = '', id: idProp = '' }: Props = $props();

	let el = $state<HTMLHeadingElement | undefined>(undefined);
	let derivedSlug = $state('');
	const slug = $derived(idProp || derivedSlug);

	// The id is what the TOC and the `#` anchor both key off, so it is derived from the rendered
	// text rather than restated at every call site.
	$effect(() => {
		if (!el) return;
		derivedSlug =
			el.textContent
				?.trim()
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-|-$/g, '') || '';
	});
</script>

<h2
	bind:this={el}
	id={slug || undefined}
	class={[
		'text-foreground font-display m-0 flex items-baseline gap-2 text-[19px] font-semibold tracking-[-0.015em]',
		className
	]}
>
	{@render children()}
	{#if slug}
		<a
			href="#{slug}"
			data-anchor
			aria-label="Link to this section"
			class="text-fg-faint hover:text-primary font-mono text-[13px] transition-colors">#</a
		>
	{/if}
</h2>
