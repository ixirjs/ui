<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { PortalBond } from './bond.svelte';
	import {
		type RenderProps,
		type Base,
		type BasePropsOf,
		type HtmlElementTagName
	} from '$ixirjs/ui/components/atom';
	import { definePart } from '$ixirjs/ui/components/atom/define-part.svelte';

	const props: RenderProps<E, B> & BasePropsOf<B> = $props();

	const el = definePart(PortalBond, 'inner', () => props, {
		class: 'relative size-full',
		message: '<Portal.Inner /> must be used within a <Portal.Outer />'
	});
</script>

<!--
	Teleport sink and floating-ui boundary. `relative size-full` makes it the offsetParent the
	teleported `absolute` overlays anchor against; no overflow clip keeps containment soft.
-->
{@render Kernel.render(el)(
	el.tag(),
	el.class(),
	el.attrs(),
	props.children,
	undefined,
	el.motion(),
	el
)}
