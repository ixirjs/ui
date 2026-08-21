<script lang="ts">
	// A code panel with the design's chrome: filename strip, copy button, code-bg body.
	import CodeBlock from './code-block.svelte';
	import { createCopier } from '$docs/utils';

	interface Props {
		filepath: string;
		language: string;
		code: string;
	}

	let { filepath, language, code }: Props = $props();

	const copier = createCopier();
</script>

<div class="border-border bg-code-bg overflow-hidden rounded-[9px] border">
	<div class="border-border flex items-center justify-between gap-3 border-b px-3 py-[7px]">
		<span class="text-muted-foreground min-w-0 truncate font-mono text-[11px]">{filepath}</span>
		<button
			type="button"
			onclick={() => copier.run(code)}
			class="border-border bg-surface text-muted-foreground hover:text-foreground shrink-0 cursor-pointer rounded-md border px-2 py-[3px] text-[11px] transition-colors"
			>{copier.label()}</button
		>
	</div>
	<CodeBlock lang={language} {code} showLeftBorder={false} />
</div>
