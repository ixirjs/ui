<script lang="ts">
	import { Icon } from '$svelte-atoms/core/components/icon';
	import { mergePresetProps, HtmlAtom } from '$svelte-atoms/core/components/atom';
	import CheckmarkRegularIcon from '$svelte-atoms/core/icons/icon-checkmark.svelte';
	import type { CheckboxProps } from './types';
	import { animateCheckboxIndicator } from './motion';
	import './checkbox.css';
	import { Input } from '../input';

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
		onblur,
		onfocus,
		onclick = undefined,
		preset = undefined,
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

	function handleChange(ev: Event) {
		onchange?.(ev, {
			checked: checked
		});
	}

	function handleInput(ev: Event) {
		oninput?.(ev, {
			checked: checked
		});
	}

	function handleClick(ev: MouseEvent) {
		if (disabled) return;

		// Click forwarded by the native input (e.g. clicking surrounding <label> text); bind:checked already owns that toggle.
		if (ev.target === checkboxElement) {
			return;
		}

		onclick?.(ev);

		if (ev.defaultPrevented) {
			return;
		}

		// We own the toggle below. preventDefault stops an ancestor <label> from forwarding this click to the
		// hidden input and toggling a second time; stopPropagation would NOT, since forwarding is a default action.
		ev.preventDefault();

		if (indeterminate) {
			indeterminate = false;
			checked = true;
		} else {
			checked = !checked;
		}

		handleInput(ev);
	}
</script>

{#snippet indeterminateSnippet()}
	<HtmlAtom
		preset="checkbox.indeterminate"
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
