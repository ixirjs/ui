<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'p', B extends Base = Base">
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
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
</script>

<HtmlAtom
	{as}
	class={['text-muted-foreground mt-1 text-xs', '$preset', klass]}
	{...restProps}
	{part}
>
	{@render children?.({ field: bond })}
</HtmlAtom>
