<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import type { HTMLAttributes } from 'svelte/elements';
	import { InputBond } from './bond.svelte';
	import {
		HtmlAtom,
		type ElementType,
		type HtmlAtomProps,
		type Base
	} from '$svelte-atoms/core/components/atom';

	type Element = ElementType<E>;

	const bond = InputBond.get();

	let {
		class: klass = '',
		children = undefined,
		preset = undefined,
		...restProps
	}: HtmlAtomProps<E, B> & HTMLAttributes<Element> = $props();

	const placeholderProps = $derived({
		preset: preset ?? bond?.atom('placeholder').preset ?? 'input.placeholder',
		...(bond?.atom('placeholder').spread ?? {}),
		...restProps
	});

	const shouldShowPlaceholder = $derived.by(() => {
		const type = (bond?.elements?.input as HTMLInputElement | undefined)?.type ?? '';

		if (['radio', 'checkbox'].includes(type)) {
			return false;
		}

		if (['files'].includes(type)) {
			return !bond?.state.props.files?.length;
		}

		return !bond?.state.props.value;
	});
</script>

{#if shouldShowPlaceholder}
	<HtmlAtom
		class={[
			'text-muted-foreground pointer-events-none absolute inset-0 flex h-full w-full items-center px-1 leading-1 outline-none',
			'$preset',
			klass
		]}
		style="left:{(bond?.elements?.input as HTMLInputElement | undefined)?.offsetLeft ?? 0}px"
		{...placeholderProps}
	>
		{@render children?.()}
	</HtmlAtom>
{/if}
