<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { SwitchProps, SwitchThumbSnippetProps } from './types';

	let {
		class: klass = '',
		checked = $bindable(false),
		disabled = false,
		id,
		name,
		value,
		onclick = undefined,
		oncheckedchange = undefined,
		children = undefined,
		thumbContent = undefined,
		presets = undefined,
		...restProps
	}: SwitchProps = $props();

	function handleClick(event: MouseEvent) {
		onclick?.(event);

		if (disabled || event.defaultPrevented) return;

		checked = !checked;
		oncheckedchange?.(checked, { event });
	}

	// State classes ride the consumer layer's `class` (Kernel's own-attrs `class` is not merged);
	// everything the part owns is in `attrs`.
	const el = Kernel.element(
		() => ({
			class: [checked && 'bg-foreground', disabled && 'cursor-not-allowed opacity-50', klass],
			...restProps
		}),
		{
			preset: 'switch',
			class:
				'switch-root bg-input outline-primary relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors duration-200 outline-0 outline-offset-2',
			attrs: () => ({
				type: 'button',
				role: 'switch',
				'aria-checked': checked,
				'aria-disabled': disabled || undefined,
				'data-checked': checked,
				onclick: handleClick
			})
		}
	);
	// The thumb's resolved props are handed to the thumb snippet, so they resolve through the seam
	// without an element of their own.
	const thumb = Kernel.element(() => ({ class: checked ? 'translate-x-6' : 'translate-x-1' }), {
		preset: 'switch.thumb',
		class:
			'switch-thumb bg-background pointer-events-none block h-4 w-4 rounded-full shadow-sm transition-transform duration-200',
		layer: () => presets?.thumb,
		variantProps: () => ({ checked }),
		attrs: () => ({ 'data-checked': checked })
	});
</script>

<button {...el.attrs}>
	<input
		{id}
		{name}
		{value}
		{disabled}
		type="checkbox"
		bind:checked
		hidden
		tabindex="-1"
		class="pointer-events-none"
		aria-hidden="true"
	/>

	<!-- Thumb -->
	{@render (thumbContent ?? defaultThumb)({ checked, props: thumb.attrs })}
</button>

{@render children?.()}

{#snippet defaultThumb({ props }: SwitchThumbSnippetProps)}
	<span {...props}></span>
{/snippet}
