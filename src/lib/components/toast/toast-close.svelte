<script
	lang="ts"
	generics="E extends keyof HTMLElementTagNameMap = 'button', B extends Base = Base"
>
	import { Icon } from '$ixirjs/ui/components/icon';
	import Close from '$ixirjs/ui/icons/icon-close.svelte';
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import { ToastBond } from './bond.svelte';
	import type { ToastCloseProps } from './types';
	import { usePart } from '$ixirjs/ui/shared';

	let {
		class: klass = '',
		as = 'button' as E,
		preset = undefined,
		children = undefined,
		onclick = undefined,
		onkeydown = undefined,
		...restProps
	}: ToastCloseProps<E, B> = $props();

	const part = usePart(ToastBond, 'dismiss', () => restProps, {
		message: '<Toast.Close /> must be used within a <Toast.Root />',
		preset: () => preset
	});
	const bond = part.bond;

	const defaults = $derived({
		type: as === 'button' ? 'button' : undefined,
		role: as === 'button' ? undefined : 'button',
		tabindex: as === 'button' ? undefined : 0
	});

	// These run before the atom's own dismiss handler and stage the reason for it. The seam composes
	// the two — consumer handler first, then the atom's, skipped when default is prevented — so
	// neither needs to invoke the atom handler by hand.
	function onclick_(event: MouseEvent) {
		onclick?.(event);
		if (event.defaultPrevented) return;
		bond.stageOpenChange({ event, reason: 'close-button' });
	}

	function onkeydown_(event: KeyboardEvent) {
		onkeydown?.(event);
		if (event.defaultPrevented) return;
		if (event.key === 'Enter' || event.key === ' ') {
			bond.stageOpenChange({ event, reason: 'close-button' });
		}
	}
</script>

<HtmlAtom
	{as}
	{defaults}
	class={['cursor-pointer text-current h-6', '$preset', klass]}
	{...restProps}
	{part}
	onclick={onclick_}
	onkeydown={onkeydown_}
>
	{#if children}
		{@render children({ toast: bond })}
	{:else}
		<Icon class="h-full" src={Close} />
	{/if}
</HtmlAtom>
