<script lang="ts">
	import { resolveControlPreset, INPUT_FIELD_CLASS, writeInputValue } from './shared';
	import { cn, toClassValue } from '$svelte-atoms/core/utils';
	import { InputBond } from './bond.svelte';
	import type { InputPasswordControlProps } from './types';

	const bond = InputBond.get();

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
		...restProps
	}: InputPasswordControlProps = $props();

	const preset = resolveControlPreset(() => presetKey, bond);

	function handleChange(ev: Event) {
		onchange?.(ev, { value });
	}

	function handleInput(ev: Event) {
		const input = ev.currentTarget as HTMLInputElement;
		value = input.value;
		writeInputValue(bond, value);
		oninput?.(ev, { value });
	}

	function toggle() {
		visible = !visible;
	}
</script>

{#snippet defaultToggle(opts: { visible: boolean; toggle: () => void; disabled: boolean })}
	<button
		type="button"
		onclick={opts.toggle}
		disabled={opts.disabled}
		aria-label={opts.visible ? 'Hide password' : 'Show password'}
		class="input-password-toggle text-muted-foreground hover:text-foreground disabled:text-muted-foreground/50 flex h-full w-8 shrink-0 cursor-pointer items-center justify-center transition-colors disabled:cursor-not-allowed"
	>
		{#if opts.visible}
			<!-- Eye-off icon -->
			<svg viewBox="0 0 16 16" fill="none" class="h-4 w-4" aria-hidden="true">
				<path d="M2 2l12 12M6.5 6.6A2 2 0 0 0 9.4 9.5M4.2 4.3C2.8 5.3 1.7 6.5 1 8c1.3 2.7 4 4.5 7 4.5 1.2 0 2.3-.3 3.3-.8M7 3.6C7.3 3.5 7.7 3.5 8 3.5c3 0 5.7 1.8 7 4.5a9.6 9.6 0 0 1-1.7 2.4"
					stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
		{:else}
			<!-- Eye icon -->
			<svg viewBox="0 0 16 16" fill="none" class="h-4 w-4" aria-hidden="true">
				<path d="M1 8C2.3 5.3 5 3.5 8 3.5s5.7 1.8 7 4.5c-1.3 2.7-4 4.5-7 4.5S2.3 10.7 1 8Z"
					stroke="currentColor" stroke-width="1.3"/>
				<circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.3"/>
			</svg>
		{/if}
	</button>
{/snippet}

<input
	bind:value={
		() => value,
		(v) => {
			value = v;
			writeInputValue(bond, v);
		}
	}
	type={visible ? 'text' : 'password'}
	{placeholder}
	{disabled}
	{readonly}
	class={cn(
		INPUT_FIELD_CLASS,
		preset?.class,
		toClassValue(klass, bond)
	)}
	onchange={handleChange}
	oninput={handleInput}
	{...restProps}
/>

{@render (toggleContent ?? defaultToggle)({ visible, toggle, disabled })}
