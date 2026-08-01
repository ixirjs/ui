<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { mergeAtomProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import type { CollapsibleHeaderProps } from './types';
	import { CollapsibleBond, CollapsibleHeaderAtom } from './bond.svelte';

	const bond = CollapsibleBond.getOrThrow(
		'<Collapsible.Header /> must be used within a <Collapsible.Root />'
	);

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: CollapsibleHeaderProps<E, B> = $props();

	const atom = createAtomInstance<CollapsibleHeaderAtom, CollapsibleBond>('header', {
		bond,
		required: true,
		factory: (owner) => new CollapsibleHeaderAtom(owner as CollapsibleBond).role('trigger')
	});

	const collapsibleProps = $derived(mergeAtomProps(atom, preset, restProps));
</script>

<HtmlAtom
	{bond}
	class={['border-border flex cursor-pointer items-center gap-2', '$preset', klass]}
	{...collapsibleProps}
>
	{@render children?.({ collapsible: bond })}
</HtmlAtom>
