<script lang="ts">
	import { getDocMode } from '$docs/context/doc-mode.svelte';
	import CodeBlock from './code-block.svelte';
	import { codeBlock } from '$docs/md/template';
	import { createCopier } from '$docs/utils';

	let {
		code,
		lang = 'svelte',
		/** Filename strip; omitted the language name is enough context. */
		filepath = undefined
	}: {
		code: string;
		lang?: string;
		filepath?: string | undefined;
	} = $props();

	const mode = getDocMode();

	const copier = createCopier();
</script>

{#if mode === 'html'}
	<div class="border-border bg-code-bg overflow-hidden rounded-[9px] border">
		<div class="border-border flex items-center justify-between gap-3 border-b px-3 py-[7px]">
			<span class="text-muted-foreground min-w-0 truncate font-mono text-[11px]"
				>{filepath ?? lang}</span
			>
			<button
				type="button"
				onclick={() => copier.run(code)}
				class="border-border bg-surface text-muted-foreground hover:text-foreground shrink-0 cursor-pointer rounded-md border px-2 py-[3px] text-[11px] transition-colors"
				>{copier.label()}</button
			>
		</div>
		<CodeBlock {lang} {code} showLeftBorder={false} />
	</div>
{:else}
	{codeBlock(code, lang)}
{/if}
