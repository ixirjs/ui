<script lang="ts">
	import { copy } from '$docs/utils/clipboard.svelte';

	let { code, restProps } = $props();

	let isCopied: boolean | undefined = $state(undefined);

	async function copyToClipboard(text: string) {
		await copy(text);

		isCopied = true;

		await new Promise((resolve) => setTimeout(resolve, 2000));

		isCopied = undefined;
	}
</script>

<div class="bg-gray-900 p-4" {...restProps}>
	<div class="mb-2 flex items-center justify-between">
		<span class="text-sm text-gray-400">Code</span>
		<button
			class="text-gray-400 transition-colors hover:text-white"
			onclick={() => copyToClipboard(code)}
		>
			{#if isCopied}
				<svg class="h-4 w-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M5 13l4 4L19 7"
					/>
				</svg>
			{:else}
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
					/>
				</svg>
			{/if}
		</button>
	</div>

	<pre class="overflow-x-auto font-mono text-sm text-white">{code}</pre>
</div>
