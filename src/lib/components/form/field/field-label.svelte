<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'label', B extends Base = Base">
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
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
</script>

<HtmlAtom class={['flex', '$preset', klass]} {...restProps} {part}>
	{@render children?.({ field: bond })}
</HtmlAtom>
