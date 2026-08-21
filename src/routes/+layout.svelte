<script lang="ts">
	import { Root } from '$lib';
	import { setPreset } from '$lib/preset';
	import { Theme } from './theme.svelte';
	import Header from './header.svelte';
	import Footer from './footer.svelte';
	import { preset } from './preset';
	import { createSearch } from '$docs/search.svelte';

	import '$lib/components/root/root.css';
	import '../app.css';

	let { children } = $props();

	setPreset(preset);

	new Theme().share();
	createSearch();
</script>

<Root
	class={['bg-background relative min-h-screen w-full justify-normal p-0 font-sans antialiased']}
>
	<div class="flex min-h-screen w-full flex-col">
		<Header />

		<main class="flex-1">
			{@render children?.()}
		</main>

		<Footer />
	</div>
</Root>
