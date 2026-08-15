<script module lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { PaginationBond } from './bond.svelte';
	const PART = Kernel.part(PaginationBond, 'next', { class: '' });
</script>

<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import type { PaginationNextProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		as = 'button' as E,
		children = undefined,
		...restProps
	}: PaginationNextProps<E, B> & BasePropsOf<B> = $props();

	const part = Kernel.node(PART, () => ({ preset }), { context: 'required' });

	const el = Kernel.element(part, () => ({
		as,
		class: ['pagination-next', '$preset', klass],
		type: as === 'button' ? 'button' : undefined,
		...restProps
	}));
</script>

{@render Kernel.render(el)(
	el.tag(),
	el.class(),
	el.attrs(),
	children,
	{ pagination: part.bond },
	el.motion(),
	el
)}
