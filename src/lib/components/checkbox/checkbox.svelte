<script lang="ts">
	import { Icon } from '$ixirjs/ui/components/icon';
	import { mergePresetProps, HtmlAtom } from '$ixirjs/ui/components/atom';
	import CheckmarkRegularIcon from '$ixirjs/ui/icons/icon-checkmark.svelte';
	import type { CheckboxProps } from './types';
	import { animateCheckboxIndicator } from './motion.svelte';
	import './checkbox.css';
	import { Input } from '$ixirjs/ui/components/input';

	let {
		class: klass = '',
		checked = $bindable(false),
		indeterminate = $bindable(false),
		value = $bindable(undefined),
		group = $bindable([]),
		disabled = false,
		id,
		name,
		checkedContent,
		indeterminateContent,
		enter,
		exit,
		initial,
		onchange,
		oninput,
		oncheckedchange,
		onblur,
		onfocus,
		onclick = undefined,
		preset = undefined,
		presets = undefined,
		...restProps
	}: CheckboxProps = $props();

	const checkboxRootProps = $derived(mergePresetProps(preset, 'checkbox', restProps));

	let checkboxElement: HTMLInputElement | undefined = $state();

	const isChecked = $derived(checked === true);
	const isIndeterminate = $derived(indeterminate === true);
	const showCheckmark = $derived(isChecked && !isIndeterminate);

	const overlayContent = $derived(
		isIndeterminate ? indeterminateSnippet : showCheckmark ? checkedSnippet : undefined
	);

	function handleChange(event: Event) {
		onchange?.(event);
	}

	function handleInput(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const nextChecked = input.checked;
		const changed = checked !== nextChecked;

		checked = nextChecked;
		indeterminate = input.indeterminate;
		oninput?.(event);

		if (changed) {
			oncheckedchange?.(nextChecked, { event });
		}
	}

	function handleClick(event: MouseEvent) {
		if (disabled) return;

		// Click forwarded by the native input (e.g. clicking surrounding <label> text); the input event owns the commit.
		if (event.target === checkboxElement) {
			return;
		}

		onclick?.(event);

		if (event.defaultPrevented) {
			return;
		}

		// Delegate the state transition to the native input so oninput/onchange receive real DOM events.
		// Prevent the ancestor label's default forwarding from toggling the input a second time.
		event.preventDefault();
		checkboxElement?.click();
	}
</script>

{#snippet indeterminateSnippet()}
	<HtmlAtom
		preset="checkbox.indeterminate"
		presetLayer={presets?.indeterminate}
		class={[
			'checkbox-indeterminate pointer-events-none flex size-full scale-50 items-center justify-center rounded-inherit bg-current'
		]}
		base={indeterminateContent}
		enter={animateCheckboxIndicator()}
		exit={animateCheckboxIndicator()}
	/>
{/snippet}

{#snippet customCheckedSnippet()}
	<HtmlAtom
		preset="checkbox.checkmark"
		presetLayer={presets?.checkmark}
		class={[
			'checkbox-indicator text-accent pointer-events-none flex h-full content-center items-center justify-center overflow-hidden p-0.5'
		]}
		base={checkedContent}
		enter={animateCheckboxIndicator()}
		exit={animateCheckboxIndicator()}
	/>
{/snippet}

{#snippet defaultCheckedSnippet()}
	<HtmlAtom
		preset="checkbox.checkmark"
		presetLayer={presets?.checkmark}
		class={[
			'checkbox-indicator text-accent pointer-events-none flex h-full content-center items-center justify-center overflow-hidden p-0.5'
		]}
		enter={animateCheckboxIndicator()}
		exit={animateCheckboxIndicator()}
	>
		<Icon class="h-full p-0" src={CheckmarkRegularIcon} />
	</HtmlAtom>
{/snippet}

{#snippet checkedSnippet()}
	{@const content = checkedContent ? customCheckedSnippet : defaultCheckedSnippet}
	{@render content?.()}
{/snippet}

<Input.Root
	as="div"
	class={[
		'checkbox-root aspect-square shrink-0 text-foreground h-5 w-fit cursor-pointer rounded-sm outline-0 outline-offset-2 transition-colors duration-100',
		isChecked && 'bg-foreground',
		'$preset',
		klass,
		'relative'
	]}
	role="checkbox"
	aria-checked={isIndeterminate ? 'mixed' : isChecked}
	{enter}
	{exit}
	{initial}
	onclick={handleClick}
	{...checkboxRootProps}
>
	<input
		bind:this={checkboxElement}
		bind:checked
		bind:group
		bind:indeterminate
		{value}
		{id}
		{name}
		{disabled}
		type="checkbox"
		class="checkbox-input pointer-events-none"
		onchange={handleChange}
		oninput={handleInput}
		{onblur}
		{onfocus}
		hidden
		tabindex="-1"
	/>

	{@render overlayContent?.()}
</Input.Root>
