<script lang="ts">
	import { useControl, INPUT_FIELD_CLASS } from './shared';
	import type { InputPasswordControlProps } from './types';

	let {
		value = $bindable(''),
		visible = $bindable(false),
		class: klass = '',
		placeholder = '',
		disabled = false,
		readonly = false,
		toggleContent = undefined,
		preset: presetKey = 'input.password',
		onchange = undefined,
		oninput = undefined,
		onvaluechange = undefined,
		onvisiblechange = undefined,
		...restProps
	}: InputPasswordControlProps = $props();

	const control = useControl({
		preset: () => presetKey,
		restProps: () => restProps,
		class: () => klass,
		variantProps: () => ({ disabled, readonly, visible }),
		type: () => (visible ? 'text' : 'password'),
		base: INPUT_FIELD_CLASS
	});

	function toggle(event: MouseEvent | undefined) {
		if (disabled) return;
		visible = !visible;
		control.notify(onvisiblechange, visible, event, 'toggle', { value });
	}
</script>

<!-- `value` is an attribute, not a binding: `control.handleInput` below is the sole writer. -->
<input
	{value}
	type={visible ? 'text' : 'password'}
	{placeholder}
	{disabled}
	{readonly}
	class={control.class}
	{...control.attrs}
	{onchange}
	oninput={control.handleInput(oninput, onvaluechange, (next) => (value = next))}
/>

{@render (toggleContent ?? defaultToggle)({ visible, toggle, disabled })}

{#snippet defaultToggle(opts: {
	visible: boolean;
	toggle: (event?: MouseEvent) => void;
	disabled: boolean;
})}
	<button
		type="button"
		onclick={opts.toggle}
		disabled={opts.disabled}
		aria-label={opts.visible ? 'Hide password' : 'Show password'}
		class="input-password-toggle text-muted-foreground hover:text-foreground disabled:text-muted-foreground/50 flex h-full w-8 shrink-0 cursor-pointer items-center justify-center transition-colors disabled:cursor-not-allowed"
	>
		{@render (opts.visible ? eyeOffIcon : eyeIcon)()}
	</button>
{/snippet}

{#snippet eyeOffIcon()}
	<!-- Eye-off icon -->
	<svg viewBox="0 0 16 16" fill="none" class="h-4 w-4" aria-hidden="true">
		<path
			d="M2 2l12 12M6.5 6.6A2 2 0 0 0 9.4 9.5M4.2 4.3C2.8 5.3 1.7 6.5 1 8c1.3 2.7 4 4.5 7 4.5 1.2 0 2.3-.3 3.3-.8M7 3.6C7.3 3.5 7.7 3.5 8 3.5c3 0 5.7 1.8 7 4.5a9.6 9.6 0 0 1-1.7 2.4"
			stroke="currentColor"
			stroke-width="1.3"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	</svg>
{/snippet}

{#snippet eyeIcon()}
	<!-- Eye icon -->
	<svg viewBox="0 0 16 16" fill="none" class="h-4 w-4" aria-hidden="true">
		<path
			d="M1 8C2.3 5.3 5 3.5 8 3.5s5.7 1.8 7 4.5c-1.3 2.7-4 4.5-7 4.5S2.3 10.7 1 8Z"
			stroke="currentColor"
			stroke-width="1.3"
		/>
		<circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.3" />
	</svg>
{/snippet}
