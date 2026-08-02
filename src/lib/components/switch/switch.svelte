<script lang="ts">
	import { mergePresetProps, HtmlAtom } from '$ixirjs/ui/components/atom';
	import { createPresentation } from '$ixirjs/ui/components/atom/presentation.svelte';
	import type { SwitchProps, SwitchThumbSnippetProps } from './types';

	let {
		class: klass = '',
		checked = $bindable(false),
		disabled = false,
		id,
		name,
		value,
		preset = undefined,
		onclick = undefined,
		oncheckedchange = undefined,
		children = undefined,
		thumbContent = undefined,
		presets = undefined,
		...restProps
	}: SwitchProps = $props();

	const switchProps = $derived(mergePresetProps(preset, 'switch', restProps));
	const thumbPresentation = createPresentation({
		preset: () => 'switch.thumb',
		instance: () => presets?.thumb,
		class: () => [
			'switch-thumb bg-background pointer-events-none block h-4 w-4 rounded-full shadow-sm transition-transform duration-200',
			checked ? 'translate-x-6' : 'translate-x-1'
		],
		variantProps: () => ({ checked }),
		restProps: () => ({ 'data-checked': checked })
	});
	const thumbProps = $derived({
		class: thumbPresentation.class,
		...thumbPresentation.attrs
	} as Record<string, unknown>);

	function handleClick(event: MouseEvent) {
		onclick?.(event);

		if (disabled || event.defaultPrevented) return;

		checked = !checked;
		oncheckedchange?.(checked, { event });
	}
</script>

<HtmlAtom
	as="button"
	type="button"
	class={[
		'switch-root bg-input outline-primary relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors duration-200 outline-0 outline-offset-2',
		checked && 'bg-foreground',
		disabled && 'cursor-not-allowed opacity-50',
		'$preset',
		klass
	]}
	role="switch"
	aria-checked={checked}
	aria-disabled={disabled || undefined}
	data-checked={checked}
	onclick={handleClick}
	{...switchProps}
>
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
	{@render (thumbContent ?? defaultThumb)({ checked, props: thumbProps })}
</HtmlAtom>

{@render children?.()}

{#snippet defaultThumb({ props }: SwitchThumbSnippetProps)}
	<span {...props}></span>
{/snippet}
