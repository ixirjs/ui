<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
	import { usePart } from '$ixirjs/ui/shared';
	import { AlertBond } from './bond.svelte';
	import type { AlertDescriptionProps } from './types';

	let {
		class: klass = '',
		as = 'p' as E,
		preset = undefined,
		children = undefined,
		...restProps
	}: AlertDescriptionProps<E, B> = $props();

	const part = usePart(AlertBond, 'description', () => restProps, {
		context: 'optional',
		preset: () => preset
	});
	const bond = part.bond;

	const el = usePartElement(part, () => ({
		as,
		class: ['alert-description border-border mt-1 text-sm leading-relaxed', '$preset', klass],
		...restProps
	}));
</script>

{#snippet body()}
	{@render children?.({ alert: bond! })}
{/snippet}

{@render partElement(el, body)}
