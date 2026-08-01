<script lang="ts">
	import { Root, setPreset } from '$lib';
	import { Theme } from './theme.svelte';
	import Header from './header.svelte';
	import Footer from './footer.svelte';
	import { preset } from './preset';
	import { page } from '$app/stores';

	import '$lib/components/root/root.css';
	import '../app.css';

	let { children } = $props();

	setPreset(preset);

	new Theme().share();

	const isDocsPage = $derived($page.url.pathname.startsWith('/docs'));
</script>

<Root
	class={['bg-background relative min-h-screen w-full justify-normal p-0 font-sans antialiased']}
>
	<div class="flex w-full flex-col">
		<Header />

		<main class="flex-1">
			{@render children?.()}
		</main>

		{#if !isDocsPage}
			<Footer />
		{/if}
	</div>
</Root>
