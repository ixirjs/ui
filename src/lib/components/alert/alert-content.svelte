<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
	import { usePart } from '$ixirjs/ui/shared';
	import { AlertBond } from './bond.svelte';
	import type { AlertContentProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: AlertContentProps<E, B> = $props();

	const part = usePart(AlertBond, 'content', () => restProps, {
		context: 'optional',
		preset: () => preset
	});
	const bond = part.bond;

	const el = usePartElement(part, () => ({
		class: ['alert-content border-border flex-1 space-y-1', '$preset', klass],
		...restProps
	}));
</script>

{@render partElement(el, children, { alert: bond! })}
