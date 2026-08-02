<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { useRoot } from '$ixirjs/ui/shared';
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
	import { CardBond } from './bond.svelte';
	import type { CardRootProps } from './types';
	import './card.css';

	const ID = $props.id();

	let {
		class: klass = '',
		preset = undefined,
		disabled = false,
		clickable = undefined,
		factory = undefined,
		children = undefined,
		onclick = undefined,
		onkeydown = undefined,
		...restProps
	}: CardRootProps<E, B> = $props();

	const root = useRoot(
		CardBond,
		{
			disabled: [
				() => disabled,
				(v) => {
					disabled = v ?? false;
				}
			],
			clickable: () => clickable ?? Boolean(onclick)
		},
		{ id: () => ID, preset: () => preset, factory: () => factory }
	);
	const bond = root.bond;

	const disabledStyles = $derived(disabled ? 'opacity-50 cursor-not-allowed' : '');

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

	const el = usePartElement(root, () => ({
		class: [
			'card bg-card border-border flex flex-col overflow-clip rounded-lg border shadow-sm',
			disabledStyles,
			'$preset',
			klass
		],
		onclick: handleClick,
		onkeydown: handleKeydown,
		...restProps
	}));
</script>

{@render partElement(el, children, { card: bond })}
