<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ExampleLoader } from '$docs/utils/example-loader';
	import { getDocMode } from '$docs/context/doc-mode.svelte';
	import DemoExample from './demo-example.svelte';
	import { codeBlock, newLine } from '$docs/md/template';

	let {
		title,
		description = undefined,
		code = undefined,
		lang = 'svelte',
		// Lazy component loader from createExampleLoader(). Renders the example file in HTML mode.
		component = undefined,
		// Inline preview — fallback when no component loader is provided.
		children = undefined,
	}: {
		title: string;
		description?: string;
		code?: string;
		lang?: string;
		component?: ExampleLoader;
		children?: Snippet;
	} = $props();

	const mode = getDocMode();
</script>

{#if mode === 'html'}
	<DemoExample {title} {description} {code} {component}>
		{#if children}
			{@render children()}
		{/if}
	</DemoExample>
{:else}
{newLine()}### {title}
{#if description}

{newLine()}{description}
{/if}
{#if code}

{newLine(2)}{codeBlock(code, lang)}
{/if}
{/if}
