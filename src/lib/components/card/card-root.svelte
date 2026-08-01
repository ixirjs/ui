<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { bindBond } from '$svelte-atoms/core/shared';
	import { mergePresetProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { CardBond } from './bond.svelte';
	import type { CardRootProps } from './types';
	import './card.css';

	let {
		class: klass = '',
		preset = undefined,
		disabled = false,
		factory = (props) => new CardBond(props),
		children = undefined,
		onclick = undefined,
		onkeydown = undefined,
		...restProps
	}: CardRootProps<E, B> = $props();

	const binding = bindBond<CardBond>((props) => factory(props), {
		disabled: [
			() => disabled,
			(v) => {
				disabled = v ?? false;
			}
		]
	});
	const bond = binding.bond.share();

	const disabledStyles = $derived(disabled ? 'opacity-50 cursor-not-allowed' : '');

	const rootProps = $derived(mergePresetProps(preset, 'card', { ...bond?.root(), ...restProps }));

	function handleClick(event: MouseEvent) {
		if (disabled) return;
		onclick?.(event);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (disabled) return;
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onclick?.(event as unknown as MouseEvent);
		}
		onkeydown?.(event);
	}

	export function getBond() {
		return bond;
	}
</script>

<HtmlAtom
	class={[
		'card bg-card border-border flex flex-col overflow-clip rounded-lg border shadow-sm',
		disabledStyles,
		'$preset',
		klass
	]}
	{bond}
	onclick={handleClick}
	onkeydown={handleKeydown}
	{...rootProps}
>
	{@render children?.({ card: bond })}
</HtmlAtom>
