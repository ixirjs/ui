<script lang="ts">
	import { mergePresetProps, HtmlAtom } from '$svelte-atoms/core/components/atom';
	import { InputBond } from './bond.svelte';
	import type { InputFileControlProps } from './types';

	const bond = InputBond.get();

	let {
		class: klass = '',
		files = $bindable<File[]>(),
		accept = undefined,
		multiple = false,
		disabled = false,
		placeholder = 'Choose file…',
		triggerContent = undefined,
		preset = undefined,
		onchange = undefined,
		...restProps
	}: InputFileControlProps = $props();

	const fileControlProps = $derived(mergePresetProps(preset, 'input.file', restProps));

	let inputEl = $state<HTMLInputElement>();

	const hasFiles = $derived(files.length > 0);

	function formatSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
		return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
	}

	function handleChange(ev: Event) {
		const input = ev.currentTarget as HTMLInputElement;
		files = Array.from(input.files ?? []);
		if (bond) bond.state.props.files = files;
		onchange?.(ev, { files });
	}

	function openPicker() {
		if (!disabled) inputEl?.click();
	}

	function clearFiles(ev: MouseEvent) {
		ev.stopPropagation();
		files = [];
		if (inputEl) inputEl.value = '';
		if (bond) bond.state.props.files = [];
		onchange?.(ev, { files: [] });
	}
</script>

<!-- hidden native file input -->
<input
	bind:this={inputEl}
	type="file"
	{accept}
	{multiple}
	{disabled}
	class="sr-only"
	onchange={handleChange}
	{...restProps}
/>

<HtmlAtom
	as="button"
	type="button"
	{disabled}
	onclick={openPicker}
	class={[
		'text-foreground flex h-full w-full flex-1 cursor-pointer items-center gap-2 bg-transparent px-2 text-left outline-none disabled:cursor-not-allowed',
		'$preset',
		klass
	]}
	{...fileControlProps}
>
	{#if triggerContent}
		{@render triggerContent({ files, hasFiles, open: openPicker })}
	{:else if hasFiles}
		{#if files.length === 1}
			{@const f = files[0]!}
			{@const ext = f.name.split('.').pop()?.toUpperCase() ?? ''}
			{@const size = formatSize(f.size)}
			<span class="bg-primary/10 text-primary rounded px-1.5 py-0.5 font-mono text-xs font-medium">
				{ext}
			</span>
			<span class="min-w-0 flex-1 truncate text-sm">{f.name}</span>
			<span class="text-muted-foreground shrink-0 text-xs">{size}</span>
		{:else}
			<span class="min-w-0 flex-1 truncate text-sm">{files.length} files selected</span>
			<span class="text-muted-foreground shrink-0 text-xs">
				{formatSize(files.reduce((a, f) => a + f.size, 0))}
			</span>
		{/if}
		<button
			type="button"
			onclick={clearFiles}
			aria-label="Clear file selection"
			class="text-muted-foreground hover:text-foreground shrink-0 transition-colors"
		>
			<svg viewBox="0 0 16 16" fill="none" class="h-3.5 w-3.5" aria-hidden="true">
				<path
					d="M3 3l10 10M13 3L3 13"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
				/>
			</svg>
		</button>
	{:else}
		<svg
			viewBox="0 0 16 16"
			fill="none"
			class="text-muted-foreground h-4 w-4 shrink-0"
			aria-hidden="true"
		>
			<path
				d="M2 12V9l4-4 3 3 2-2 3 3v3H2z"
				stroke="currentColor"
				stroke-width="1.2"
				stroke-linejoin="round"
			/>
			<circle cx="11" cy="4" r="1.5" stroke="currentColor" stroke-width="1.2" />
		</svg>
		<span class="text-muted-foreground flex-1 text-sm">{placeholder}</span>
	{/if}
</HtmlAtom>
