<script lang="ts">
	import { getDocMode } from '$docs/context/doc-mode.svelte';
	import CodeBlock from './code-block.svelte';
	import { codeBlock } from '$docs/md/template';

	let {
		code,
		lang = 'svelte'
	}: {
		code: string;
		lang?: string;
	} = $props();

	const mode = getDocMode();
</script>

{#if mode === 'html'}
	<CodeBlock {lang} {code} />
{:else}
	{codeBlock(code, lang)}
{/if}
