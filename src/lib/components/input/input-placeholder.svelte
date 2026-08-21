<script module lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { InputBond } from './bond.svelte';
	const PART = Kernel.plan(InputBond, 'placeholder', { class: '' });
</script>

<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import type {
		RenderProps,
		Base,
		BasePropsOf,
		HtmlElementTagName
	} from '$ixirjs/ui/components/atom';

	let {
		class: klass = '',
		children = undefined,
		preset = undefined,
		...restProps
	}: RenderProps<E, B> & BasePropsOf<B> = $props();
	const part = Kernel.node(PART, () => ({ preset }), { context: 'optional' });
	const shouldShowPlaceholder = $derived(part.bond?.shouldShowPlaceholder ?? true);

	const el = Kernel.element(part, () => ({
		// The real control carries the accessible name; this is a purely visual stand-in and would
		// otherwise be announced as stray text beside it.
		'aria-hidden': 'true',
		class: [
			'text-muted-foreground pointer-events-none absolute inset-0 flex h-full w-full items-center px-1 leading-1 outline-none',
			'$preset',
			klass
		],
		...restProps
	}));
</script>

{@render (shouldShowPlaceholder ? placeholder : undefined)?.()}

{#snippet placeholder()}
	{@render Kernel.render(el)(el, children)}
{/snippet}
