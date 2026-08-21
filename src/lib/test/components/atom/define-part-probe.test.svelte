<script lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { definePart } from '$ixirjs/ui/components/atom/define-part.svelte';
	import { CardBond } from '$ixirjs/ui/components/card/bond.svelte';

	const props: Record<string, unknown> = $props();

	const el = definePart(CardBond, 'title', () => props, {
		as: 'h3',
		class: 'probe-base',
		context: 'optional'
	});
</script>

{@render Kernel.render(el)(el, props.children as never)}
