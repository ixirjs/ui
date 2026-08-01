<script lang="ts">
    import {Root} from '../dropdown-menu/atoms'
	import type { PopoverRootProps } from '../popover';

    // Trigger is often a large element (row, card, image), so content sizes to its own `min-w-*`
    // rather than the trigger. Opt back in per-instance with `minWidth` on the content.
    let {placement = 'bottom-start', ...restProps}: PopoverRootProps = $props();
</script>

<Root {placement} {...restProps} />