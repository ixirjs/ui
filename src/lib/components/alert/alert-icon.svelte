<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { Icon } from '$ixirjs/ui/components/icon';
	import { type Base, HtmlAtom } from '$ixirjs/ui/components/atom';
	import { usePart } from '$ixirjs/ui/shared';
	import { AlertBond } from './bond.svelte';
	import type { AlertIconProps } from './types';

	let {
		class: klass = '',
		base = Icon as unknown as B,
		preset = undefined,
		children = undefined,
		...restProps
	}: AlertIconProps<E, B> = $props();

	const part = usePart(AlertBond, 'icon', () => restProps, {
		context: 'optional',
		preset: () => preset
	});
	const bond = part.bond;
</script>

<HtmlAtom
	{base}
	class={[
		'alert-icon border-border inline-flex aspect-square h-5 items-center justify-center rounded-full text-sm font-medium',
		'$preset',
		klass
	]}
	{...restProps}
	{part}
>
	{@render children?.({ alert: bond! })}
</HtmlAtom>
