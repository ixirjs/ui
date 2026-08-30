<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ClassValue } from '$ixirjs/ui/utils';
	import type { PresetKey } from '$ixirjs/ui/preset';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { TextareaInputProps } from './types';

	let {
		value = $bindable(),
		autoResize = false,
		...restProps
	}: TextareaInputProps &
		HTMLAttributes<HTMLTextAreaElement> & {
			class?: ClassValue;
			preset?: PresetKey;
		} = $props();

	let textareaEl = $state<HTMLTextAreaElement>();

	function resize() {
		if (!autoResize || !textareaEl) return;
		textareaEl.style.height = 'auto';
		textareaEl.style.height = `${textareaEl.scrollHeight}px`;
	}

	$effect(() => {
		void value;
		resize();
	});

	const el = Kernel.element(() => restProps, {
		preset: 'textarea',
		class: 'border-border w-full p-2 outline-none',
		attrs: () => ({ oninput: resize })
	});
</script>

<textarea bind:this={textareaEl} bind:value {...el.attrs}></textarea>
