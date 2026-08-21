<script lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { mergePresetProps } from '$ixirjs/ui/components/atom';
	import { useControl } from './shared';
	import type { InputFileControlProps } from './types';

	// The Atom goes on the hidden native input, not the visible trigger: that input is the control
	// the bond should hold, and it is what reports `type === 'file'` to Input.Placeholder. The
	// The trigger uses Kernel.static as a preset-driven presentational element — the Button shape,
	// not a bonded part.
	let {
		class: klass = '',
		files = $bindable<File[]>([]),
		accept = undefined,
		multiple = false,
		disabled = false,
		placeholder = 'Choose file…',
		triggerContent = undefined,
		preset = undefined,
		onchange = undefined,
		oninput = undefined,
		onfileschange = undefined,
		...restProps
	}: InputFileControlProps = $props();

	// restProps belongs to the hidden native input — that is the real form control, and what
	// consumers target with `name`, `required`, `data-testid` and friends. The visible trigger is
	// presentation, so it gets the preset only; spreading restProps onto both put the consumer's
	// `id`/`aria-*`/`data-*` on two elements at once.
	const control = useControl({ preset: () => undefined, restProps: () => restProps });
	const fileControlProps = $derived(mergePresetProps(preset, 'input.file', {}));

	let inputEl = $state<HTMLInputElement>();

	const hasFiles = $derived(files.length > 0);

	function formatSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
		return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
	}

	function handleChange(event: Event) {
		onchange?.(event);
		if (event.defaultPrevented) return;

		files = Array.from((event.currentTarget as HTMLInputElement).files ?? []);
		control.setFiles(files);
		control.notify(onfileschange, files, event, 'change');
	}

	function openPicker() {
		if (!disabled) inputEl?.click();
	}

	function clearFiles(event: MouseEvent) {
		event.stopPropagation();
		files = [];
		if (inputEl) inputEl.value = '';
		control.setFiles(files);
		control.notify(onfileschange, files, event, 'clear');
	}

	// Element seam instead of a component boundary; key order matches the previous call exactly.
	const el = Kernel.element(Kernel.static, () => ({
		as: 'button',
		type: 'button',
		disabled,
		onclick: openPicker,
		class: [
			'text-foreground flex h-full w-full flex-1 cursor-pointer items-center gap-2 bg-transparent px-2 text-left outline-none disabled:cursor-not-allowed',
			'$preset',
			klass
		],
		...fileControlProps
	}));
</script>

<!-- hidden native file input -->
<input
	bind:this={inputEl}
	type="file"
	{accept}
	{multiple}
	{disabled}
	class="sr-only"
	{...control.attrs}
	onchange={handleChange}
	{oninput}
/>

{@render Kernel.render(el)(el, triggerContent ?? (hasFiles ? filesSummary : emptyPrompt), {
	files,
	hasFiles,
	open: openPicker
})}

{#snippet filesSummary()}
	{@render (files.length === 1 ? singleFile : multipleFiles)()}
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
{/snippet}

{#snippet singleFile()}
	{@const f = files[0]!}
	{@const ext = f.name.split('.').pop()?.toUpperCase() ?? ''}
	<span class="bg-primary/10 text-primary rounded px-1.5 py-0.5 font-mono text-xs font-medium">
		{ext}
	</span>
	<span class="min-w-0 flex-1 truncate text-sm">{f.name}</span>
	<span class="text-muted-foreground shrink-0 text-xs">{formatSize(f.size)}</span>
{/snippet}

{#snippet multipleFiles()}
	<span class="min-w-0 flex-1 truncate text-sm">{files.length} files selected</span>
	<span class="text-muted-foreground shrink-0 text-xs">
		{formatSize(files.reduce((a, f) => a + f.size, 0))}
	</span>
{/snippet}

{#snippet emptyPrompt()}
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
{/snippet}
