<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { mergeAtomProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import { CollapsibleBodyAtom, CollapsibleBond } from './bond.svelte';
	import { animateCollapsibleBody } from './motion.svelte';
	import type { CollapsibleBodyProps } from './types';

	const bond = CollapsibleBond.getOrThrow(
		'<Collapsible.Body /> must be used within a <Collapsible.Root />'
	);

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		fallback = {
			animate: animateCollapsibleBody(),
			initial: animateCollapsibleBody({ duration: 0 })
		},
		...restProps
	}: CollapsibleBodyProps<E, B> = $props();

	const atom = createAtomInstance<CollapsibleBodyAtom, CollapsibleBond>('body', {
		bond,
		required: true,
		factory: (owner) => new CollapsibleBodyAtom(owner as CollapsibleBond).role('content')
	});

	const bodyProps = $derived(mergeAtomProps(atom, preset, restProps));
</script>

<HtmlAtom {bond} class={['border-border', '$preset', klass]} {fallback} {...bodyProps}>
	{@render children?.({ collapsible: bond })}
</HtmlAtom>
