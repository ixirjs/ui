<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ExampleLoader } from '$docs/utils/example-loader';
	import CodeBlock from './code-block.svelte';

	type Props = {
		title: string;
		description?: string | undefined;
		code?: string | undefined;
		// Lazy component file loader — renders the example .svelte file in the preview area
		component?: ExampleLoader | undefined;
		children?: Snippet;
	};

	let { title, description, code, component, children }: Props = $props();

	let activeTab = $state<'preview' | 'code'>('preview');
	let copySuccess = $state(false);

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text);
		copySuccess = true;
		setTimeout(() => (copySuccess = false), 2000);
	}
</script>

<div class="border-border overflow-hidden rounded-lg border">
	<!-- Header -->
	<div class="border-border bg-muted/40 flex items-center justify-between border-b px-5 py-3">
		<div>
			<h3 class="text-foreground text-sm font-semibold">{title}</h3>
			{#if description}
				<p class="text-muted-foreground mt-0.5 text-xs">{description}</p>
			{/if}
		</div>
		{#if code}
			<div class="bg-background border-border flex items-center gap-0.5 rounded-md border p-0.5">
				<button
					class={[
						'rounded px-3 py-1.5 text-xs font-medium transition-all duration-150',
						activeTab === 'preview'
							? 'bg-primary text-primary-foreground shadow-sm'
							: 'text-muted-foreground hover:text-foreground'
					]}
					onclick={() => (activeTab = 'preview')}
				>
					Preview
				</button>
				<button
					class={[
						'rounded px-3 py-1.5 text-xs font-medium transition-all duration-150',
						activeTab === 'code'
							? 'bg-primary text-primary-foreground shadow-sm'
							: 'text-muted-foreground hover:text-foreground'
					]}
					onclick={() => (activeTab = 'code')}
				>
					Code
				</button>
			</div>
		{/if}
	</div>

	<!-- Preview -->
	{#if activeTab === 'preview'}
		<div class="bg-dot-grid relative min-h-32 p-8">
			<div class="flex items-center justify-center">
				{#if component}
					{#await component()}
						<div class="bg-muted h-8 w-32 animate-pulse rounded"></div>
					{:then mod}
						{@const Example = mod.default}
						<Example />
					{/await}
				{:else if children}
					{@render children()}
				{/if}
			</div>
		</div>
	{/if}

	<!-- Code -->
	{#if code && activeTab === 'code'}
		<div class="border-border border-t">
			<div class="flex items-center justify-between px-4 py-2">
				<span class="text-xs text-zinc-500">svelte</span>
				<button
					class={[
						'transition-colors',
						copySuccess ? 'text-green-400' : 'text-zinc-500 hover:text-zinc-300'
					]}
					onclick={() => copyToClipboard(code)}
				>
					{#if copySuccess}
						<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 13l4 4L19 7"
							/>
						</svg>
					{:else}
						<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
			<CodeBlock lang="svelte" {code} showLeftBorder={false} />
		</div>
	{/if}
</div>
