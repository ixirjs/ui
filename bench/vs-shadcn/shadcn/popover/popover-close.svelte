<script lang="ts">
	// @ts-nocheck — vendored third-party source; see bench/vs-shadcn/README.md
	import { Popover as PopoverPrimitive } from "bits-ui";

	let { ref = $bindable(null), ...restProps }: PopoverPrimitive.CloseProps = $props();
</script>

<PopoverPrimitive.Close bind:ref data-slot="popover-close" {...restProps} />
