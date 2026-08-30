<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { Icon } from '$ixirjs/ui/components/icon';
	import CheckmarkRegularIcon from '$ixirjs/ui/icons/icon-checkmark.svelte';
	import type { CheckboxProps } from './types';
	import { animateCheckboxIndicator } from './motion.svelte';
	import './checkbox.css';

	const ID = $props.id();
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
		as = undefined,
		initial,
		enter,
		exit,
		animate = undefined,
		onchange,
		oninput,
		oncheckedchange,
		onblur,
		onfocus,
		onclick = undefined,
		presets = undefined,
		...restProps
	}: CheckboxProps = $props();

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

	// The root used to mount `Input.Root`; it renders that element itself now — same classes, same
	// `input-root-<seed>` id — and dispatches for the consumer's `as` and transitions. State classes
	// ride the consumer layer's `class` (Kernel's own-attrs `class` is not merged).
	const el = Kernel.element(
		() => ({
			class: [
				'checkbox-root aspect-square shrink-0 text-foreground h-5 w-fit cursor-pointer rounded-sm outline-0 outline-offset-2 transition-colors duration-100',
				isChecked && 'bg-foreground',
				klass,
				'relative'
			],
			...restProps
		}),
		{
			preset: 'checkbox',
			class:
				'text-foreground bg-input relative flex h-10 w-auto items-center overflow-hidden rounded-md border',
			attrs: () => ({
				id: Kernel.id(ID, 'input-root'),
				role: 'checkbox',
				'aria-checked': isIndeterminate ? 'mixed' : isChecked,
				onclick: handleClick
			}),
			as: () => as ?? 'div',
			motion: () =>
				initial || enter || exit || animate ? { initial, enter, exit, animate } : undefined
		}
	);
	const leaf = Kernel.render(el);

	// One transition pair for both indicators, built once; an overlay only ever plays one animation.
	const indicatorMotion = { enter: animateCheckboxIndicator(), exit: animateCheckboxIndicator() };
	// Declared here, not in the snippets: the seam owns effects and must be created during init, and
	// a snippet body is not init. `base` is the consumer's custom content, when there is one.
	const indeterminateEl = Kernel.element(() => ({}), {
		preset: 'checkbox.indeterminate',
		class:
			'checkbox-indeterminate pointer-events-none flex size-full scale-50 items-center justify-center rounded-inherit bg-current',
		layer: () => presets?.indeterminate,
		base: () => indeterminateContent,
		motion: () => indicatorMotion
	});
	const checkmarkEl = Kernel.element(() => ({}), {
		preset: 'checkbox.checkmark',
		class:
			'checkbox-indicator text-accent pointer-events-none flex h-full content-center items-center justify-center overflow-hidden p-0.5',
		layer: () => presets?.checkmark,
		base: () => checkedContent,
		motion: () => indicatorMotion
	});
	const indeterminateLeaf = Kernel.render(indeterminateEl);
	const checkmarkLeaf = Kernel.render(checkmarkEl);
</script>

{@render leaf(el, body)}

{#snippet body()}
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
{/snippet}

{#snippet indeterminateSnippet()}
	{@render indeterminateLeaf(indeterminateEl)}
{/snippet}

{#snippet checkedSnippet()}
	{@render checkmarkLeaf(checkmarkEl, checkedContent ? undefined : checkmarkIcon)}
{/snippet}

{#snippet checkmarkIcon()}
	<Icon class="h-full p-0" src={CheckmarkRegularIcon} />
{/snippet}
