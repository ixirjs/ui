<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
	import { usePart } from '$ixirjs/ui/shared';
	import { AlertBond } from './bond.svelte';
	import type { AlertTitleProps } from './types';

	let {
		as = 'h4' as E,
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: AlertTitleProps<E, B> = $props();

	const part = usePart(AlertBond, 'title', () => restProps, {
		context: 'optional',
		preset: () => preset
	});
	const bond = part.bond;

	const el = usePartElement(part, () => ({
		as,
		class: ['alert-title border-border text-sm leading-tight font-medium', '$preset', klass],
		...restProps
	}));
</script>

{#snippet body()}
	{@render children?.({ alert: bond! })}
{/snippet}

{@render partElement(el, body)}
