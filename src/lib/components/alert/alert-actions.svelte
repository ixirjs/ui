<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
	import { usePart } from '$ixirjs/ui/shared';
	import { AlertBond } from './bond.svelte';
	import type { AlertActionsProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: AlertActionsProps<E, B> = $props();

	const part = usePart(AlertBond, 'actions', () => restProps, {
		context: 'optional',
		preset: () => preset
	});
	const bond = part.bond;

	const el = usePartElement(part, () => ({
		class: ['alert-actions border-border mt-3 flex items-center gap-2', '$preset', klass],
		...restProps
	}));
</script>

{@render partElement(el, children, { alert: bond! })}
