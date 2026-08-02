<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { usePart } from '$ixirjs/ui/shared';
	import { InputBond } from './bond.svelte';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
	import type { HtmlAtomProps, Base } from '$ixirjs/ui/components/atom';

	let {
		class: klass = '',
		children = undefined,
		preset = undefined,
		...restProps
	}: HtmlAtomProps<E, B> = $props();
	const part = usePart(InputBond, 'placeholder', () => restProps, {
		context: 'optional',
		preset: () => preset
	});
	const bond = part.bond;

	const shouldShowPlaceholder = $derived.by(() => {
		const type = (bond?.elements?.input as HTMLInputElement | undefined)?.type ?? '';

		if (['radio', 'checkbox'].includes(type)) {
			return false;
		}

		if (['files'].includes(type)) {
			return !bond?.props.files?.length;
		}

		return !bond?.props.value;
	});

	const el = usePartElement(part, () => ({
		class: [
			'text-muted-foreground pointer-events-none absolute inset-0 flex h-full w-full items-center px-1 leading-1 outline-none',
			'$preset',
			klass
		],
		style: `left:${(bond?.elements?.input as HTMLInputElement | undefined)?.offsetLeft ?? 0}px`,
		...restProps
	}));
</script>

{@render (shouldShowPlaceholder ? placeholder : undefined)?.()}

{#snippet placeholder()}
	{@render partElement(el, children)}
{/snippet}
