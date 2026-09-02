<script lang="ts">
	// @ts-nocheck — vendored third-party source; see bench/vs-shadcn/README.md
	import { Popover as PopoverPrimitive } from "bits-ui";

	let { ...restProps }: PopoverPrimitive.PortalProps = $props();
</script>

<PopoverPrimitive.Portal {...restProps} />
