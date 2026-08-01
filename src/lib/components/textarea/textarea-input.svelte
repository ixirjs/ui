<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ClassValue } from '$ixirjs/ui/utils';
	import type { PresetKey } from '$ixirjs/ui/preset';
	import { createPresentation } from '$ixirjs/ui/components/atom/presentation.svelte';
	import type { TextareaInputProps } from './types';

	let {
		class: klass = '',
		value = $bindable(),
		autoResize = false,
		preset: presetKey = 'textarea',
		...restProps
	}: TextareaInputProps &
		HTMLAttributes<HTMLTextAreaElement> & {
			class?: ClassValue;
			preset?: PresetKey;
		} = $props();

	let textareaEl = $state<HTMLTextAreaElement>();

	$effect(() => {
		if (!autoResize || !textareaEl) return;
		void value;
		textareaEl.style.height = 'auto';
		textareaEl.style.height = `${textareaEl.scrollHeight}px`;
	});

	const presentation = createPresentation({
		preset: () => presetKey,
		class: () => ['border-border w-full p-2 outline-none', klass],
		restProps: () => restProps
	});
</script>

<textarea
	bind:this={textareaEl}
	bind:value
	oninput={() => {
		if (!autoResize || !textareaEl) return;
		textareaEl.style.height = 'auto';
		textareaEl.style.height = `${textareaEl.scrollHeight}px`;
	}}
	class={presentation.class}
	{...presentation.attrs}></textarea>
