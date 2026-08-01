<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
	import { usePart } from '$ixirjs/ui/shared';
	import { DialogBond } from './bond.svelte';
	import type { DialogFooterProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: DialogFooterProps<E, B> = $props();

	const part = usePart(DialogBond, 'footer', () => restProps, {
		preset: () => preset
	});
	const bond = part.bond;

	const el = usePartElement(part, () => ({
		class: ['flex px-4', '$preset', klass],
		...restProps
	}));
</script>

{#snippet body()}
	{@render children?.({ dialog: bond })}
{/snippet}

{@render partElement(el, body)}
