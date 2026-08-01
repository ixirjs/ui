<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { PortalBond } from './bond.svelte';
	import { type HtmlAtomProps, type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
	import { usePart } from '$ixirjs/ui/shared';

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: HtmlAtomProps<E, B> = $props();

	const part = usePart(PortalBond, 'inner', () => restProps, {
		message: '<Portal.Inner /> must be used within a <Portal.Outer />',
		preset: () => preset
	});

	const el = usePartElement(part, () => ({
		class: ['relative size-full', '$preset', klass],
		...restProps
	}));
</script>

<!--
	Teleport sink and floating-ui boundary. `relative size-full` makes it the offsetParent the
	teleported `absolute` overlays anchor against; no overflow clip keeps containment soft.
-->
{@render partElement(el, children)}
