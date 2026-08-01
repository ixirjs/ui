<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
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
</script>

<HtmlAtom
	class={['alert-actions border-border mt-3 flex items-center gap-2', '$preset', klass]}
	{...restProps}
	{part}
>
	{@render children?.({ alert: bond! })}
</HtmlAtom>
