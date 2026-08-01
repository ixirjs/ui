<script lang="ts">
	import { Button } from '$lib/components/button';
	import { Icon } from '$lib/components/icon';
	import { createHighlighter, type Highlighter, type BundledLanguage } from 'shiki';
	import { onMount } from 'svelte';

	type Props = {
		code: string;
		langs?: BundledLanguage[];
		lang: BundledLanguage;
	};

	let { code = '', langs = ['svelte'], lang = 'svelte' }: Props = $props();

	let copySuccess = $state(false);

	let highlighter: Highlighter | undefined = $state();
	let highlightedCode = $derived(
		highlighter?.codeToHtml(code, { lang: 'svelte', theme: 'github-dark' })
	);

	onMount(() => {
		createHighlighter({
			themes: ['github-light', 'github-dark'],
			langs: langs as BundledLanguage[]
		}).then(async (h: Highlighter) => {
			await Promise.all([h.loadLanguage(lang), h.loadTheme('github-dark')]);

			highlighter = h;
		});
	});

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text);
		copySuccess = true;

		setTimeout(() => (copySuccess = false), 2000);
	}
</script>

<div class="code relative overflow-hidden rounded-lg font-mono text-sm shadow-sm">
	{@html highlightedCode}

	<Button
		class="bg-background/5 hover:bg-background/10 active:bg-background/15 absolute top-2 right-2 flex cursor-pointer items-center justify-center p-2 text-gray-400 transition-colors hover:text-white"
		onclick={() => copyToClipboard(highlightedCode ?? '')}
	>
		<Icon class="h-4">
			{#if copySuccess}
				<svg class="text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M5 13l4 4L19 7"
					/>
				</svg>
			{:else}
				<svg class="" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
					/>
				</svg>
			{/if}
		</Icon>
	</Button>
</div>

<style>
	.code > :global(pre) {
		padding: calc(var(--spacing) * 4) !important;
	}
</style>
