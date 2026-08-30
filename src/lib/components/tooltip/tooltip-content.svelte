<script lang="ts">
	import { Content } from '$ixirjs/ui/components/popover/atoms';
	import type { PopoverContentProps } from '$ixirjs/ui/components/popover/types';

	// Default to the `ambient` layer so tooltips render above modals and sibling overlays;
	// everything else forwards to popover Content unchanged.
	let { layer = 'ambient', ...restProps }: PopoverContentProps<'div'> = $props();
</script>

<Content {layer} {...restProps} />
