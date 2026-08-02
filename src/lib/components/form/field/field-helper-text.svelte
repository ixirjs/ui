<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'p', B extends Base = Base">
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
	import { usePart } from '$ixirjs/ui/shared';
	import { FieldBond } from './bond.svelte';
	import type { FieldTextProps } from '$ixirjs/ui/components/form/types';

	let {
		class: klass = '',
		as = 'p' as E,
		children = undefined,
		preset = undefined,
		...restProps
	}: FieldTextProps<E, B> = $props();

	const part = usePart(FieldBond, 'description', () => restProps, {
		message: '<Field.HelperText /> must be used within a <Field.Root />',
		preset: () => preset ?? 'field.helper-text'
	});
	const bond = part.bond;

	const el = usePartElement(part, () => ({
		as,
		class: ['text-muted-foreground mt-1 text-xs', '$preset', klass],
		...restProps
	}));
</script>

{@render partElement(el, children, { field: bond })}
