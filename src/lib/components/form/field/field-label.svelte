<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'label', B extends Base = Base">
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
	import { usePart } from '$ixirjs/ui/shared';
	import { FieldBond } from './bond.svelte';
	import type { FieldLabelProps } from '$ixirjs/ui/components/form/types';

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: FieldLabelProps<E, B> = $props();

	const part = usePart(FieldBond, 'label', () => restProps, {
		preset: () => preset
	});
	const bond = part.bond;

	const el = usePartElement(part, () => ({ class: ['flex', '$preset', klass], ...restProps }));
</script>

{@render partElement(el, children, { field: bond })}
