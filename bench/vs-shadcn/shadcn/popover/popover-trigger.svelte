<script lang="ts">
	// @ts-nocheck — vendored third-party source; see bench/vs-shadcn/README.md
	import { cn } from "../utils";
	import { Popover as PopoverPrimitive } from "bits-ui";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: PopoverPrimitive.TriggerProps = $props();
</script>

<PopoverPrimitive.Trigger
	bind:ref
	data-slot="popover-trigger"
	class={cn("", className)}
	{...restProps}
/>
