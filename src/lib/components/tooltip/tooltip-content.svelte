<script lang="ts" generics="T extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Content } from '$svelte-atoms/core/components/popover/atoms';
	import type { Base } from '$svelte-atoms/core/components/atom';
	import type { HtmlElementTagName } from '$svelte-atoms/core/components/element';
	import type { PopoverContentProps } from '$svelte-atoms/core/components/popover/types';

	// Default to the `ambient` layer so tooltips render above modals and sibling overlays;
	// everything else forwards to popover Content unchanged.
	let { layer = 'ambient', ...restProps }: PopoverContentProps<T, B> = $props();
</script>

<Content {layer} {...restProps} />
